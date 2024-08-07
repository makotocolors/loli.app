const { readdirSync, lstatSync } = require('node:fs'), { resolve } = require('node:path');
let name, code, client = {};

function fileFiltering(directory, extension = '.js') {
  function filesToArray(dir, ext) {
    return readdirSync(dir).reduce((arr, file) => {
      const item = resolve(dir, file);
      const isDirectory = lstatSync(item).isDirectory();
      if (isDirectory || !ext || file.endsWith(ext)) {
        isDirectory? arr.push(...filesToArray(item, ext)): arr.push(item);
      };
      return arr;
    }, []);
  };
  
  return filesToArray(directory, extension)
    .filter((file) => {
      file = require(file);
      return ((typeof file === 'function' && file.name === code) ||
      (file && typeof file === 'object' && typeof file[code] === 'function'))
    })
};

function deepMerge(base, user) {
  function isPlainObject(obj) {
    return obj && typeof obj === 'object' && obj.constructor === Object;
  };
  
  for (const key of Object.keys(user)) {
    if (key in base) {
      if (typeof user[key] !== typeof base[key]) {
        throw new TypeError('InvalidOptionProvided', { cause: user[key]});
      }
      if (isPlainObject(user[key]) && isPlainObject(base[key])) {
        user[key] = deepMerge(base[key], user[key]);
      }
    }
  }
  return { ...base, ...user };
};

module.exports = (class Application {
  constructor(userClient, userOptions = {}) {
    try {
      if (!userClient) throw new Error('MissingClient');
      else if (!(userClient instanceof Object) || (userClient instanceof Array)) {
        throw new TypeError('InvalidClientProvided', { cause: userClient });
      };
      if (!userOptions) throw new Error('MissingOptions');
      else if (!(userOptions instanceof Object) || (userOptions instanceof Array)) {
        throw new TypeError('InvalidOptionsProvided', { cause: userOptions });
      };

      client = userClient;
      this.options = deepMerge({
        nomenclature: { name: 'name', code: 'code' },
        filter: { extension: '.js' },
        cache: { enable: true, driver: Map }
      }, userOptions);
      name = this.options.nomenclature.name, code = this.options.nomenclature.code;
      this.cache = this.options.cache.enable? new this.options.cache.driver(): null;
    }
    catch (error) {
      throw new Error('UnexpectedError', { cause: error });
    };
  };

  on(event, path, callback) {
    try {
      if (!event) throw new Error('MissingEvent');
      else if (typeof event !== 'string') {
        throw new TypeError('InvalidEventProvided', { cause: event });
      };
      if (!path) throw new Error('MissingPath');
      else if (typeof path !== 'string') {
        throw new TypeError('InvalidPathProvided', { cause: path });
      };

      const files = fileFiltering(path, this.options.filter.extension);
      if (this.cache && !this.cache.has(event)) {
        this.cache.set(event, new this.options.cache.driver());
        for (const [file, func] of files.map((file) => [file, require(file)])) {
          const funcName = (typeof func === 'function' || typeof func[name] !== 'string'? file: func[name]);
          const funcCode = (typeof func === 'function'? func: func[code]);
          this.cache.get(event).set(funcName, funcCode);
        };
      };

      return client.on(event, (...data) => {
        const params = [...data];
        if (callback) {
          if (typeof callback === 'function') callback({
            files,
            set: (...userParams) => (params.push(...userParams)),
            cache: (userEvent) => (this.cache?.get?.(userEvent) ?? this.cache),
            event: (userCallback) => {
              if (userCallback) {
                if (typeof userCallback === 'function') userCallback(...data); 
                else throw new TypeError('InvalidFunctionProvided', { cause: userCallback });
              };
              return data;
            }
          }, ...data);
          else throw new TypeError('InvalidFunctionProvided', { cause: callback });
        };
          
        if (this.cache) for (const func of this.cache.get(event)) func[1](...params);
        else for (const func of files.map((file) => require(file))) {
          typeof func === 'function'? func(...params): func[code](...params);
        };
      });
    }
    catch (error) {
      throw new Error('UnexpectedError', { cause: error })
    };
  };
});
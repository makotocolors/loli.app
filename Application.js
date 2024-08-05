const { readdirSync, statSync } = require('node:fs'), { resolve } = require('node:path');
let name, code, client = {};

function filesToArray(directory, extension = '.js') {
  return readdirSync(directory).reduce((arr, file) => {
    const item = resolve(directory, file);
    const isDirectory = statSync(item).isDirectory();
    if (isDirectory || !extension || file.endsWith(extension)) {
      isDirectory? arr.push(...filesToArray(item, extension)): arr.push(item);
    };
    return arr;
  }, []);
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    };
  };
  return Object.assign(target || {}, source || {});
};

module.exports = (class Application {
  constructor(userClient, userOptions = {}) {
    try {
      if (!userClient) throw new Error('MissingClient');
      else if (typeof userClient !== 'object' || Array.isArray(userClient)) {
        throw new TypeError('InvalidClientProvided', { cause: userClient });
      };
      if (!userOptions) throw new Error('MissingOptions');
      else if (typeof userOptions !== 'object' || Array.isArray(userOptions)) {
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

      const files = filesToArray(path, this.options.filter.extension).filter((file) => {
        file = require(file);
        return ((typeof file === 'function' && file.name === code) ||
        (file && typeof file === 'object' && typeof file[code] === 'function'));
      });

      if (this.cache && !this.cache.has(event)) {
        this.cache.set(event, new this.options.cache.driver());
        for (const [func, file] of files.map((file) => [require(file), file])) {
          this.cache.get(event).set(func[name] ?? file, func[code] ?? func);
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
          
        if (this.cache) for (const func of this.cache.get(event)) func(...params);
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
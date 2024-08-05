const { readdirSync, statSync } = require('node:fs'), { resolve } = require('node:path');
let name, code, client = {};

function filesToArray(directory, extension = '.js') {
  return readdirSync(directory).reduce((arr, file) => {
    const item = resolve(directory, file);
    const check = statSync(item).isDirectory();
    if (check || !extension || file.endsWith(extension)) {
      check? arr.push(...filesToArray(item, extension)): arr.push(item);
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

      const files = filesToArray(path, this.options.filter.extension).map((filePath) => {
        const file = require(filePath);
        const isValidFunction = (typeof file === 'function' && file.name === code);
        const isValidObject = (file && typeof file === 'object' && typeof file[code] === 'function');
        if (isValidFunction || isValidObject) return filePath;
        else return null;
      }).filter((filePath) => filePath !== null);

      if (this.cache && !this.cache.has(event)) {
        this.cache.set(event, new this.options.cache.driver());
        files.forEach((filePath) => {
          const file = require(filePath);
          const isFunction = typeof file === 'function';
          this.cache.get(event).set((isFunction || typeof file[name] !== 'string'? filePath: file[name]), (isFunction? file: file[code]));
        });
      };

      let params = [];
      if (callback && typeof callback === 'function') {
        callback(Object.freeze({
          files,
          set: (...data) => (params = data),
          cache: (event) => (this.cache?.get?.(event) ?? this.cache),
        }));
      };

      client.on(event, (data) => {
        try {
          if (this.cache) this.cache.get(event).forEach(code => code(data, ...params));
          else files.forEach((filePath) => {
            const file = require(filePath);
            typeof file === 'function'? file(data, ...params): file[code](data, ...params);
          });
        }
        catch (error) {
          throw new Error('ReadingError', { cause: error });
        };
      });
    }
    catch (error) {
      throw new Error('UnexpectedError', { cause: error })
    };
  };
});
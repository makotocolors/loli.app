let [client, [name, code], params] = [{}, [], []];

function filesToArray(directory, extension = '.js') {
  const [{ readdirSync, statSync }, { resolve }] = [require('node:fs'), require('node:path')];
  return readdirSync(directory).reduce((arr, file) => {
    const item = resolve(directory, file);
    if (statSync(item).isDirectory()) {
      arr.push(...filesToArray(item, extension));
    } else if (!extension || file.endsWith(extension)) {
      arr.push(item);
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
      else if (typeof userClient !== 'object' || Array.isArray(userClient)) throw new TypeError('InvalidClientProvided', { cause: userClient });
      if (!userOptions) throw new Error('MissingOptions');
      else if (typeof userOptions !== 'object' || Array.isArray(userOptions)) throw new TypeError('InvalidOptionsProvided', { cause: userOptions });

      client = userClient;
      this.options = deepMerge({
        nomenclature: { name: 'name', code: 'code' },
        filter: { extension: '.js' },
        cache: { enable: true, driver: Map },
        function: { filesToArray, deepMerge },
      }, userOptions);
      [name, code] = [this.options.nomenclature.name, this.options.nomenclature.code];
      this.cache = this.options.cache.enable? new this.options.cache.driver(): null;
    }
    catch (error) {
      throw new Error('UnexpectedError', { cause: error })
    };
  };

  on(event, path, callback) {
    try {
      if (!event) throw new Error('MissingEvent');
      else if (typeof event !== 'string') throw new TypeError('InvalidEventProvided', { cause: event });
      if (!path) throw new Error('MissingPath');
      else if (typeof path !== 'string') throw new TypeError('InvalidPathProvided', { cause: path });

      const array = this.options.function.filesToArray(path, this.options.filter.extension);
      if (this.cache && !this.cache.has(event)) {
        this.cache.set(event, new this.options.cache.driver());
        array.forEach(path => {
          const content = require(path);
          if (content) {
            if (typeof content === 'function' && content.name === code) {
              this.cache.get(event).set(path, content);
            }
            else if (typeof content === 'object' && typeof content[code] === 'function') {
              this.cache.get(event).set((typeof content[name] === 'string'? content[name]: path), content[code]);
            };
          };
        });
      };

      if (callback && typeof callback === 'function') {
        callback(Object.freeze({
          files: array,
          set: (...data) => (params = data),
          cache: (event) => (this.cache?.get?.(event) ?? this.cache),
        }));
      };

      client.on(event, data => {
        try {
          if (this.cache) this.cache.get(event).forEach(code => code(data, ...params));
          else array.forEach(path => {
            const content = require(path);
            if (content) {
              if (typeof content === 'function' && content.name === code) {
                content(data, ...params);              
              }
              else if (typeof content === 'object' && typeof content[code] === 'function') {
                content[code](data, ...params);
              };
            };
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
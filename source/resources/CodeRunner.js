const { existsSync: exists } = require('node:fs'), { resolve } = require('node:path');
const CacheSync = require('./CacheSync.js');

class CodeRunner extends CacheSync {
  constructor(client, options, cache) {
    super(cache, options.cache.driver, options);
    this.client = client;
  };

  run(event, path, callback, isOnce) {
    try {
      if (!event || event === '') {
        throw new Error('MissingEvent');
      }
      else if (typeof event !== 'string') {
        throw new TypeError('InvalidEventProvided', { cause: event });
      };
      if (typeof path === 'function') {
        callback = path;
        path = undefined;
      };
      if (exists(resolve(event))) {
        path = event;
        event = undefined;
      };
  
      if ((!path || path === '') && typeof callback !== 'function') {
        throw new Error('MissingPath');
      }
      else if (path && typeof path !== 'string') {
        throw new TypeError('InvalidPathProvided', { cause: path });
      };

      const call = (array, ...data) => {
        if (callback) {
          if (typeof callback !== 'function') {
            throw new TypeError('InvalidFunctionProvided', { cause: callback });
          };
          callback({
            cache: this.cache,
            set: (...secondaryParams) => array.push(...secondaryParams),
            event: (secondaryCallback) => {
              if (secondaryCallback) {
                if (typeof secondaryCallback !== 'function') {
                  throw new TypeError('InvalidFunctionProvided', { cause: secondaryCallback });
                };
              secondaryCallback(...data);
              };
              return data;
            },
          }, ...data);
        };
        return array;
      };

      if (path) {
        this.runnerCache(event, path, isOnce);
        for (const [func, funcEvents] of this.cache.entries()) {
          if (func === 'events') continue; 
          for (const [funcEvent, funcPaths] of funcEvents.entries()) {
            if(this.cache.get('events').get(func).includes(funcEvent)) continue;
            this.cache.get('events').get(func).push(funcEvent);
            this.client[func]
            (funcEvent, (...data) => {
              for (const cache of funcPaths.values())
              cache.get(this.nome.code)(...data, ...call([], ...data));
            });
          };
        };
      }
      else {
        this.client[isOnce? 'once': 'on']
        (event, (...data) => call([], ...data));
      };
    } catch (error) {
      throw new Error('UnexpectedError', { cause: error });
    };
  };
};
module.exports = (CodeRunner);
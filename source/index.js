const { deepMerge } = require('./functions.js'), onOnce = require('./onOnce.js');
class Application {
  constructor(client, options = {}) {
    if (!client) throw new Error('MissingClient');
    else if (!(client instanceof Object) || (client instanceof Array)) {
      throw new TypeError('InvalidClientProvided', { cause: client });
    };
    if (!options) throw new Error('MissingOptions');
    else if (!(options instanceof Object) || (options instanceof Array)) {
      throw new TypeError('InvalidOptionsProvided', { cause: options });
    };
    
    this.options = Object.assign(deepMerge({
      nomenclature: { data: 'data', code: 'code' },
      filter: { extension: '.js' },
      cache: { enable: true, driver: Map },
    }, options), { client });
    this.cache = this.options.cache.enable? new this.options.cache.driver(): null;
  };

  on(event, path, callback) {
    return onOnce(
      { options: this.options, cache: this.cache },
      { event, path, callback }, 'on');
  };

  once(event, path, callback) {
    return onOnce(
      { options: this.options, cache: this.cache },
      { event, path, callback }, 'once');
  };
};
module.exports = (Application);
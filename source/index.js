const { deepMerge } = require('./resources/functions.js');
const CodeRunner = require('./resources/CodeRunner.js');
let code;

class Application {
  constructor(client, options = {}) {
    if (!client) {
      throw new Error('MissingClient');
    }
    else if (!(client instanceof Object) || (client instanceof Array)) {
      throw new TypeError('InvalidClientProvided', { cause: client });
    };
    if (!options) {
      throw new Error('MissingOptions');
    }
    else if (!(options instanceof Object) || (options instanceof Array)) {
      throw new TypeError('InvalidOptionsProvided', { cause: options });
    };
    
    this.options = deepMerge(
      {
        nomenclature: {
          data: 'data',
          event: 'event',
          once: 'once',
          code: 'code',
        },
        filter: {
          extension: '.js',
        },
        cache: {
          driver: Map,
        },
      },
      options,
    );
    this.cache = new this.options.cache.driver;
    code = new CodeRunner(client, this.options, this.cache);
  };

  run(event, path, callback) {
    return code.run(event, path, callback, null);
  };
  
  on(event, path, callback) {
    return code.run(event, path, callback, false);
  };

  once(event, path, callback) {
    return code.run(event, path, callback, true);
  };
};
module.exports = (Application);
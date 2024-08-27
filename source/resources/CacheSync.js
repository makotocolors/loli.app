const { pathsToArray } = require('./functions.js');

class CacheSync {
  constructor(cache, driver, { nomenclature, extension }) {
    this.cache = cache;
    this.driver = driver;
    this.nome = { ...nomenclature };
    this.extension = extension;
  };

  runnerCache(event, path, isOnce) {
    return pathsToArray(path, this.extension).reduce((cache, filePath) => {
      const file = require(filePath);
      const funcEvent = (event ?? file?.[this.nome.data]?.[this.nome.event] ?? file[this.nome.event]);
      const funcCode = (((typeof file === 'function') && (file.name === this.nome.code))? file: file?.[this.nome.code]);
      let funcIsOnce = (isOnce ?? file?.[this.nome.data]?.[this.nome.once] ?? file[this.nome.once] ?? null);
      if ((typeof funcEvent === 'string') && (typeof funcCode === 'function') && (typeof funcIsOnce === 'boolean')) {
        funcIsOnce = (funcIsOnce? 'once': 'on');
        const events = cache.get('events') ?? cache.set('events', new this.driver).get('events');
        if(!events.has(funcIsOnce)) events.set(funcIsOnce, []);
        let funcMap = (cache.get(funcIsOnce) ?? cache.set(funcIsOnce, new this.driver).get(funcIsOnce));
        funcMap = (funcMap.get(funcEvent) ?? funcMap.set(funcEvent, new this.driver).get(funcEvent));
        funcMap.set(filePath, new this.driver(
          [
            [this.nome.data, new this.driver(Object.entries(file?.[this.nome.data] ?? {}))],
            [this.nome.code, funcCode],
          ]
        ));
      };
      return cache
    }, this.cache);
  };
};
module.exports = (CacheSync);
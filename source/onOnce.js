const { pathsToArray, pathFiltering } = require('./functions.js');
module.exports = ({ options, cache }, { event, path, callback }, funcType) => {
  try {
    if (!event) throw new Error('MissingEvent');
    else if (typeof event !== 'string') {
      throw new TypeError('InvalidEventProvided', { cause: event });
    };
    if (!path) throw new Error('MissingPath');
    else if ((typeof path !== 'string') && (typeof path !== 'function')) {
      throw new TypeError('InvalidPath/FunctionProvided', { cause: path });
    };

    let paths;
    if (typeof path === 'function') callback = path;
    else {
      paths = pathFiltering(pathsToArray(path, options.filter.extension), options.nomenclature.code);
      if (cache && (funcType === 'on')) {
        if (!cache.has(event)) cache.set(event, []);
        for (const [filePath, file] of paths.map((filePath) => [filePath, require(filePath)])) {
          cache.get(event).push({
            path: filePath,
            [options.nomenclature.data]: (typeof file === 'object'? file[options.nomenclature.data]: null),
            [options.nomenclature.code]: (typeof file === 'object'? file[options.nomenclature.code]: file),
          });
        };
      };
    };

    return options.client[funcType](event, (...data) => {
      const params = [...data];
      if (callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('InvalidFunctionProvided', { cause: callback });
        }
        else callback({
          paths: paths || null,
          set: (...secondaryParams) => params.push(...secondaryParams),
          cache: (secondaryEvent) => (cache?.get?.(secondaryEvent) ?? cache),
          event: (secondaryCallback) => {
            if (secondaryCallback) {
              if (typeof secondaryCallback !== 'function') {
                throw new TypeError('InvalidFunctionProvided', { cause: secondaryCallback });
              }
              else secondaryCallback(...data);
            };
            return data;
          },
        }, ...data);
      };

      if (typeof path === 'string') {
        for (const func of (((funcType === 'on') && cache?.get?.(event)) || paths.map((file) => require(file)))) {
          (((funcType === 'on') && cache) || typeof func !== 'function')? func[options.nomenclature.code](...params): func(...params);
        };
      };
    });
  }
  catch (error) {
    throw new Error('UnexpectedError', { cause: error });
  };
};
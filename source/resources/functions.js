const { readdirSync, lstatSync } = require('node:fs'), { resolve } = require('node:path');
function deepMerge(primary, secondary) {
  function isPlainObject(obj) {
    return obj && typeof obj === 'object' && obj.constructor === Object;
  };
  for (const key of Object.keys(secondary)) {
    if (key in primary) {
      if (typeof secondary[key] !== typeof primary[key]) {
        throw new TypeError('InvalidOptionProvided', { cause: secondary[key] });
      };
      if (isPlainObject(secondary[key]) && isPlainObject(primary[key])) {
        secondary[key] = deepMerge(primary[key], secondary[key]);
      };
    };
  };
  return { ...primary, ...secondary };
};

function pathsToArray(directory, extension) {
  return readdirSync(directory).reduce((array, filePath) => {
    const path = resolve(directory, filePath);
    const isDirectory = lstatSync(path).isDirectory();
    if (isDirectory || !extension || filePath.endsWith(extension)) {
      isDirectory?
        array.push(...pathsToArray(path, extension)):
        array.push(path);
    };
    return array;
  }, []);
};
module.exports = ({ deepMerge, pathsToArray });
const { readdirSync, lstatSync } = require('node:fs'), { resolve } = require('node:path');
module.exports = ({ deepMerge, pathsToArray, pathFiltering });
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
  return readdirSync(directory).reduce((arr, file) => {
    const item = resolve(directory, file);
    const isDirectory = lstatSync(item).isDirectory();
    if (isDirectory || !extension || file.endsWith(extension)) {
      isDirectory? arr.push(...pathsToArray(item, extension)): arr.push(item);
    };
    return arr;
  }, []);
};
function pathFiltering(paths, code) {
  return paths.filter((filePath) => {
    const file = require(filePath);
    return ((typeof file === 'function' && file.name === code) ||
      (file && typeof file === 'object' && typeof file[code] === 'function'));
  });
};
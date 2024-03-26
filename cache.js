const fs = require('fs');
const path = require('path');

const cacheDirectory = '.cache';

function cachingWrapper(apiFunction, cacheDuration) {
  return async function (...args) {
    let cacheKey = apiFunction.name;
    for (const value of args) {
      cacheKey += `${value}`;
    }

    const cacheFilePath = path.join(cacheDirectory, `${cacheKey}.json`);
    const currentTime = Date.now();

    // Check if the cache directory exists, create it if it doesn't
    if (!fs.existsSync(cacheDirectory)) {
      fs.mkdirSync(cacheDirectory);
    }

    // Check if the cache file exists and is not expired
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      if (currentTime - cacheData.timestamp < cacheDuration) {
        return cacheData.data;
      }
    }

    // Call the original API function with the provided arguments
    const result = await apiFunction(...args);

    // Cache the result with the current timestamp
    const cacheData = {
      data: result,
      timestamp: currentTime,
    };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    return result;
  };
}


module.exports = {
  cachingWrapper
};
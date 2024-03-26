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

    try {
      // Check if the cache directory exists, create it if it doesn't
      if (!fs.existsSync(cacheDirectory)) {
        fs.mkdirSync(cacheDirectory);
      }

      // Check if the cache file exists and is not expired
      if (fs.existsSync(cacheFilePath)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        if (currentTime - cacheData.timestamp < cacheDuration) {
          console.log(`Returning cached result for ${apiFunction.name} with args:`, args);
          return cacheData.data;
        }
      }

      // Call the original API function with the provided arguments
      const result = await apiFunction(...args);
      console.log(apiFunction.name, JSON.stringify(result, null, 2));

      // Cache the result with the current timestamp
      const cacheData = {
        data: result,
        timestamp: currentTime,
      };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));

      console.log(`Caching new result for ${apiFunction.name} with args:`, args);
      return result;
    } catch (error) {
      console.error(`Error in ${apiFunction.name}:`, error);
      throw error;
    }
  };
}


module.exports = {
  cachingWrapper
};
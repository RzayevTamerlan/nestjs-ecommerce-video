import { filterBySubString } from './filterBySubString';
import { Cache } from 'cache-manager';

export const deleteCache = async (cacheManager: Cache, subString: string) => {
  const cache = await cacheManager.store.keys();
  const keys = filterBySubString(cache, subString);
  const deletePromises = keys.map(async (key) => {
    return await cacheManager.del(key);
  });

  return Promise.all(deletePromises);
};
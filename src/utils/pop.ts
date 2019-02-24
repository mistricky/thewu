export function mapPop<K, V>(map: Map<K, V>, key: K): V | undefined {
  let result = map.get(key);

  if (result) {
    map.delete(key);
    return result;
  }

  return undefined;
}

interface ObjectDiffResult<T> {
  added: T[];
  removed: T[];
  updated: T[];
}

// Objects diff algorithm can tell the renderer
// what attribute changed
// what attribute removed
// what attribute added
export const diffObjects = (
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): ObjectDiffResult<string> => {
  const newKeys = Object.keys(newObj);
  const oldKeys = Object.keys(oldObj);

  return {
    added: newKeys.filter((key) => !oldObj[key]),
    removed: oldKeys.filter((key) => !newObj[key]),
    updated: newKeys.filter(
      (key) => !!oldObj[key] && oldObj[key] !== newObj[key],
    ),
  };
};

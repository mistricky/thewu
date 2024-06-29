interface ObjectDiffResult {
  added: Key[];
  removed: Key[];
  updated: Key[];
}

type Key = string | number;

// Objects diff algorithm can tell the renderer
// what attribute changed
// what attribute removed
// what attribute added
export const diffObjects = (
  oldObj: object,
  newObj: object,
): ObjectDiffResult => {
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

// Find difference between two arrays, return the difference items
// if has item was updated in newArray, there is no update action,
// instead, the oldArray just removed old item and append new item
export const diffArrays = <T>(oldArray: T[], newArray: T[]) => ({
  added: newArray.filter((item) => !oldArray.includes(item)),
  removed: oldArray.filter((item) => !newArray.includes(item)),
});

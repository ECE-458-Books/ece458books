export interface IDer {
  id: string | number;
}

// Find the element with the given ID
export function findById<T extends IDer>(array: T[], id: string | number) {
  return array.find((element) => element.id === id);
}

// Remove the ID from the array
export function filterById<T extends IDer>(
  array: T[],
  id: string | number,
  setArray?: (array: T[]) => void
) {
  const newData = array.filter((element) => element.id !== id);
  if (setArray) setArray(newData);
  return newData;
}

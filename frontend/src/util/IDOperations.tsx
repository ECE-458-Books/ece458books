export interface IDer {
  id: string | number;
}

export function findById<T extends IDer>(array: T[], id: string | number) {
  return array.find((element) => element.id === id);
}

// Remove the ID from the array
export function filterById<T extends IDer>(
  array: T[],
  id: string | number,
  setArray: (array: T[]) => void
) {
  const newData = array.filter((element) => element.id !== id);
  setArray(newData);
  return newData;
}

interface IDer {
  id: string | number;
}

export function findById<T extends IDer>(array: T[], id: string | number) {
  return array.find((element) => element.id === id);
}

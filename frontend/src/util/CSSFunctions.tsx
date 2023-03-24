export function arrowColorDeterminer(inputValue: number) {
  if (inputValue > 0) {
    return { color: "green" };
  } else if (inputValue < 0) {
    return { color: "red" };
  }
  return { color: "black" };
}

export function colorDeterminer(inputValue: number) {
  if (inputValue > 0) {
    return "text-green-700";
  } else if (inputValue < 0) {
    return "text-red-700";
  }
  return "text-900";
}

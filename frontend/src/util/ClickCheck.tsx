export function isHighlightingText() {
  const selection = window.getSelection();
  if (!selection) return;

  return selection.toString().length > 0;
}

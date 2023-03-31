export enum ViewScrollType {
  Instant = "instant",
  Smooth = "smooth",
  Auto = "auto",
}

export function scrollToTop(behavior?: ViewScrollType): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior ?? "smooth",
  });
}

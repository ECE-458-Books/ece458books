export function scrollToTop(behavior?: ScrollBehavior): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior ?? "smooth",
  });
}

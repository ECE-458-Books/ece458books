export function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

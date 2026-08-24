export function scrollToId(id) {
  const el = typeof id === "string" && id.startsWith("#") ? document.querySelector(id) : document.getElementById(id);
  if (!el) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -20, duration: 1.3 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

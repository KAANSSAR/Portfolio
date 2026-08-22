export function smoothScrollTo(selector: string) {
  const target = document.querySelector(selector);
  if (!target) return;
  const dest = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 80);
  window.scrollTo({ top: dest, behavior: 'smooth' });
}

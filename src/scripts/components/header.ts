export function initHeader(): () => void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const toggle = header?.querySelector<HTMLButtonElement>(".site-header__toggle");
  const links = header?.querySelectorAll<HTMLAnchorElement>(".site-header__link, .btn");

  if (!header || !toggle) return () => {};

  function setOpen(isOpen: boolean): void {
    header?.classList.toggle("is-open", isOpen);
    toggle?.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("no-scroll", isOpen);
  }

  function handleToggle(): void {
    setOpen(!header?.classList.contains("is-open"));
  }

  function handleLinkClick(): void {
    setOpen(false);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") setOpen(false);
  }

  toggle.addEventListener("click", handleToggle);
  links?.forEach((link) => link.addEventListener("click", handleLinkClick));
  window.addEventListener("keydown", handleKeydown);

  return () => {
    toggle.removeEventListener("click", handleToggle);
    links?.forEach((link) => link.removeEventListener("click", handleLinkClick));
    window.removeEventListener("keydown", handleKeydown);
    setOpen(false);
  };
}

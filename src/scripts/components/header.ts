import { gsap } from "../main";

export function initHeader(): () => void {
  const navToggler = document.querySelector<HTMLButtonElement>(
    ".header__nav-toggler"
  );
  const navMenu = document.querySelector<HTMLElement>(".header__nav-list");
  const navLinks =
    document.querySelectorAll<HTMLAnchorElement>(".header__nav-list a");

  if (!navToggler || !navMenu) return () => {};

  function closeMenu(): void {
    navLinks.forEach((link) => {
      if (link.parentElement) link.parentElement.style.opacity = "0";
    });

    window.setTimeout(() => {
      navToggler?.classList.remove("toggler-open");
      navMenu?.classList.remove("open");
      document.body.classList.remove("no-scroll");
      navLinks.forEach((link) => {
        if (link.parentElement) link.parentElement.style.opacity = "";
      });
    }, 200);
  }

  function openMenu(): void {
    navToggler?.classList.add("toggler-open");
    navMenu?.classList.add("open");
    document.body.classList.add("no-scroll");
  }

  function handleTogglerClick(): void {
    if (navMenu?.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function handleNavLinkClick(): void {
    if (navMenu?.classList.contains("open")) {
      handleTogglerClick();
    }
  }

  navToggler.addEventListener("click", handleTogglerClick);
  navLinks.forEach((link) => {
    link.addEventListener("click", handleNavLinkClick);
  });

  let lastScrollY = 0;
  let isHidden = false;
  let ticking = false;
  const map = document.querySelector<HTMLIFrameElement>(".map iframe");
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  function updateHeaderVisibility(): void {
    if (navMenu?.classList.contains("open")) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY;

    if (scrollY && Math.abs(scrollY - lastScrollY) < 5) {
      ticking = false;
      return;
    }

    const direction = scrollY > lastScrollY ? "down" : "up";
    lastScrollY = scrollY;

    if (direction === "down" && !isHidden && scrollY > 50) {
      gsap.to(".header", {
        opacity: 0,
        y: 22,
        duration: 0.1,
        ease: "power1.in",
      });
      isHidden = true;
    } else if (direction === "up") {
      gsap.to(".header", {
        opacity: 1,
        y: scrollY === 0 ? 22 : 10,
        duration: 0.15,
        ease: "power1.in",
      });
      isHidden = false;
    }

    ticking = false;
  }

  function requestTick(): void {
    if (map) {
      map.style.pointerEvents = "none";
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        map.style.pointerEvents = "auto";
      }, 250);
    }

    if (!ticking) {
      requestAnimationFrame(updateHeaderVisibility);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });

  const currentPath = window.location.pathname;
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("header__nav-link--active");
    }
  });

  return () => {
    navToggler.removeEventListener("click", handleTogglerClick);
    navLinks.forEach((link) => {
      link.removeEventListener("click", handleNavLinkClick);
    });
    window.removeEventListener("scroll", requestTick);
    if (scrollTimeout) clearTimeout(scrollTimeout);
  };
}

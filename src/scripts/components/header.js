import { gsap } from "../main.js";

export function initHeader() {
  const navToggler = document.querySelector(".header__nav-toggler");
  const navMenu = document.querySelector(".header__nav-list");
  const navLinks = document.querySelectorAll(".header__nav-list a");

  navToggler.addEventListener("click", handleTogglerClick);
  navLinks.forEach((elem) =>
    elem.addEventListener("click", handleNavLinkClick)
  );

  function handleTogglerClick() {
    if (navMenu.classList.contains("open")) {
      // Closing: fade out links first
      navLinks.forEach((link) => {
        link.parentElement.style.opacity = "0";
      });
      setTimeout(() => {
        navToggler.classList.toggle("toggler-open");
        navMenu.classList.toggle("open");
        document.body.classList.toggle(
          "no-scroll",
          navMenu.classList.contains("open")
        );
        // Reset opacity for next open
        navLinks.forEach((link) => {
          link.parentElement.style.opacity = "";
        });
      }, 200);
    } else {
      // Opening: toggle immediately
      navToggler.classList.toggle("toggler-open");
      navMenu.classList.toggle("open");
      document.body.classList.toggle(
        "no-scroll",
        navMenu.classList.contains("open")
      );
    }
  }

  function handleNavLinkClick() {
    if (navMenu.classList.contains("open")) {
      navToggler.click();
    }
  }

  let lastScrollY = 0;
  let isHidden = false;
  let ticking = false;

  // Map pointer events handling to avoid scroll glitch
  const map = document.querySelector(".map iframe");
  let scrollTimeout;

  function updateHeaderVisibility() {
    if (navMenu.classList.contains("open")) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY;

    // Only react if scroll position has changed significantly
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
      if (isHidden) {
        gsap.to(".header", {
          opacity: 1,
          y: 10,
          duration: 0.15,
          ease: "power1.in",
        });
      } else if (!isHidden && scrollY === 0) {
        gsap.to(".header", {
          opacity: 1,
          y: 22,
          duration: 0.15,
          ease: "power1.in",
        });
      }
      isHidden = false;
    }

    ticking = false;
  }

  function requestTick() {
    // Handle map pointer events on scroll
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

  // Dynamic active link
  const currentPath = window.location.pathname;
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("header__nav-link--active");
    }
  });
}

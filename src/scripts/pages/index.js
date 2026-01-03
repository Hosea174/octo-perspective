import { gsap } from "../main.js";
import { animateText, animateFadeIn } from "../common.js";
import { responsiveClamp } from "../utils.js";

// init function definitions for each section
// e.g. function initHeroSection() {...}

export function initIndex() {
  window.addEventListener("load", () => {
    document.fonts.ready.then(() => {
      // function calls for each section defined above
      // e.g. initHeroSection()
    });
  });
}

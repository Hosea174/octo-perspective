import { gsap } from "./main.js";
import { SplitText } from "gsap/SplitText";
import { responsiveClamp } from "./utils.js";

gsap.registerPlugin(SplitText);

const textAnimations = {
  logoAnimation: (el, staggerValue = 0.02, durationValue = 0.5) => {
    const split = SplitText.create(el, {
      type: "chars",
      smartWrap: true,
      mask: "chars",
    });

    split.chars.forEach((charEl) => {
      const text = charEl.innerText;
      charEl.innerHTML = "";
      const ogDiv = document.createElement("div");
      ogDiv.className = "og-char";
      ogDiv.innerText = text;
      const dupDiv = document.createElement("div");
      dupDiv.className = "duplicate-char";
      dupDiv.innerText = text;
      charEl.appendChild(ogDiv);
      charEl.appendChild(dupDiv);
    });

    gsap.from(split.chars, {
      yPercent: -100,
      ease: "power2.inOut",
      stagger: {
        each: staggerValue,
        from: "random",
      },
      duration: durationValue,
      repeat: 1,
      repeatDelay: 0.75,
    });
  },
  headerAnimation: (el, staggerValue = 0.2, durationValue = 0.9) => {
    const split = SplitText.create(el, {
      type: "words",
      mask: "words",
      wordsClass: "word",
    });
    gsap.from(split.words, {
      yPercent: 100,
      ease: "power3.out",
      stagger: staggerValue,
      duration: durationValue,
      // scrollTrigger: {
      //   trigger: el,
      //   start: "top 50%",
      // },
    });
  },
  bodyAnimation: (el, staggerValue = 0.1, durationValue = 0.75) => {
    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        return gsap.from(self.lines, {
          opacity: 0,
          yPercent: 100,
          duration: durationValue,
          stagger: staggerValue,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(self.masks, { overflow: "visible" });
          },
        });
      },
    });
  },
  linkAnimation: (selectors, staggerValue = 0.08, durationValue = 0.5) => {
    let links = document.querySelectorAll(selectors);

    links.forEach((el) => {
      const split = SplitText.create(el, {
        type: "chars",
        smartWrap: true,
        mask: "chars",
      });

      split.chars.forEach((charEl) => {
        const text = charEl.innerText;
        charEl.innerHTML = "";
        const ogDiv = document.createElement("div");
        ogDiv.className = "og-char";
        ogDiv.innerText = text;
        const dupDiv = document.createElement("div");
        dupDiv.className = "duplicate-char";
        dupDiv.innerText = text;
        charEl.appendChild(ogDiv);
        charEl.appendChild(dupDiv);
      });

      const hoverTl = gsap.timeline({ paused: true });

      hoverTl.to(split.chars, {
        yPercent: -100,
        stagger: {
          amount: staggerValue,
        },
        ease: "expo.inOut",
        duration: durationValue,
      });

      const target =
        el.parentElement && el.parentElement.tagName === "BUTTON"
          ? el.parentElement
          : el;
      target.addEventListener("mouseenter", () => hoverTl.play());
      target.addEventListener("mouseleave", () => hoverTl.reverse());
    });
  },
};

export function animateText(el, staggerValue, durationValue) {
  gsap.set(el, { visibility: "visible" });
  const targetEl = typeof el === "string" ? document.querySelector(el) : el;
  const animType = targetEl?.dataset?.textAnim;
  const animFunc = textAnimations[animType];
  if (animFunc) animFunc(el, staggerValue, durationValue);
}

/**
 * @typedef {Object} AnimateFadeInOptions
 * @property {HTMLElement|string} el - The element(s) to animate. Can be a DOM element or CSS selector string
 * @property {number} [blurValue=0] - Blur filter value in pixels applied during animation
 * @property {number} [durationValue=0.8] - Animation duration in seconds
 * @property {"toTop"|"toBottom"|"toLeft"|"toRight"} [directionValue="toTop"] - Animation direction
 * @property {string} [easeValue="power4.inOut"] - GSAP easing function string
 * @property {number} [staggerValue=0] - Stagger delay between multiple elements in seconds
 * @property {boolean} [immediateRenderValue=true] - Whether to render immediately
 * @property {number} [xPercentValue=30] - Horizontal movement distance as percentage
 * @property {number} [yPercentValue=100] - Vertical movement distance as percentage
 * @property {Object|null} [scrollTriggerValue=null] - GSAP ScrollTrigger configuration object
 */

/**
 * Animates elements fading in with directional movement and optional effects
 * @param {AnimateFadeInOptions} options - Configuration options for the fade-in animation
 * @returns {Object} GSAP tween object
 */
export function animateFadeIn(options = {}) {
  const {
    el,
    blurValue = 0,
    durationValue = 0.8,
    directionValue = "toTop",
    easeValue = "power4.inOut",
    staggerValue = 0,
    immediateRenderValue = true,
    xPercentValue = 30,
    yPercentValue = 100,
    scrollTriggerValue = null,
  } = options;
  gsap.set(el, { visibility: "visible" });

  const directions = {
    toRight: { xPercent: -xPercentValue, yPercent: 0 },
    toLeft: { xPercent: xPercentValue, yPercent: 0 },
    toBottom: { xPercent: 0, yPercent: -yPercentValue },
    toTop: { xPercent: 0, yPercent: yPercentValue },
  };

  const direction = directions[directionValue] || directions.toTop;

  const tweenVars = {
    opacity: 0,
    filter: `blur(${blurValue}px)`,
    duration: durationValue,
    ease: easeValue,
    stagger: staggerValue,
    immediateRender: immediateRenderValue,
    ...direction,
  };

  if (scrollTriggerValue) {
    tweenVars.scrollTrigger = scrollTriggerValue;
  }

  return gsap.from(el, tweenVars);
}

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { initGlobalFadeIns, initGlobalTextAnimations } from "./common";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

// Keep a single Lenis instance and ticker for the lifetime of the document.
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: true, touchMultiplier: 1, anchors: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let context: gsap.Context | undefined;
let cleanText: (() => void) | undefined;
let generation = 0;

function cleanup(): void {
  generation++;
  cleanText?.();
  cleanText = undefined;
  context?.revert();
  context = undefined;
}

async function initAnimationLayer(): Promise<void> {
  cleanup();
  const current = generation;
  // Do not hold the page hostage to an unavailable font; autoSplit handles later reflow.
  await Promise.race([document.fonts.ready.catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 1200))]);
  if (current !== generation || !document.documentElement.hasAttribute("data-motion-pending")) return;
  try {
    context = gsap.context(() => {});
    context.add(() => {
      initGlobalFadeIns();
      cleanText = initGlobalTextAnimations();
    });
    document.documentElement.removeAttribute("data-motion-pending");
    ScrollTrigger.refresh();
  } catch (error) {
    cleanup();
    document.documentElement.removeAttribute("data-motion-pending");
    console.error("Animation initialization failed", error);
  }
}

void initAnimationLayer();
// These hooks are inert without Astro's optional ClientRouter.
document.addEventListener("astro:before-swap", cleanup);
document.addEventListener("astro:page-load", () => {
  if (document.documentElement.hasAttribute("data-motion-pending")) void initAnimationLayer();
});

export { gsap, lenis, ScrollTrigger };

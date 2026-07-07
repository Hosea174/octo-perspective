import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  initGlobalFadeIns,
  initGlobalTextAnimations,
  revealAnimationTargets,
} from "./common";
import { prefersReducedMotion, whenPageReady } from "./utils";

gsap.registerPlugin(ScrollTrigger, SplitText);

ScrollTrigger.config({
  ignoreMobileResize: true,
});

gsap.defaults({
  duration: 0.8,
  ease: "power3.out",
});

let animationContext: gsap.Context | undefined;

const lenis: Lenis | null = prefersReducedMotion()
  ? null
  : new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1,
      anchors: true,
    });

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function initAnimationLayer(): void {
  animationContext?.revert();

  animationContext = gsap.context(() => {
    if (prefersReducedMotion()) {
      revealAnimationTargets();
      ScrollTrigger.refresh();
      return;
    }

    initGlobalFadeIns();
    initGlobalTextAnimations();
    ScrollTrigger.refresh();
  });
}

whenPageReady(initAnimationLayer);

export { gsap, lenis, ScrollTrigger };

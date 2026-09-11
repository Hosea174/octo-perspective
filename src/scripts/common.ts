import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { responsiveClamp } from "./utils";

gsap.registerPlugin(SplitText);

export type FadeDirection = "toTop" | "toBottom" | "toLeft" | "toRight";

export const fadePresets = {
  "fade-1": {
    autoAlpha: 0,
    y: () => responsiveClamp(22, 36),
    duration: 0.75,
    ease: "power3.out",
    clearProps: "transform",
  },
  "fade-2": {
    autoAlpha: 0,
    y: () => responsiveClamp(32, 52),
    scale: 0.97,
    duration: 0.85,
    ease: "power3.out",
    clearProps: "transform",
  },
  "fade-3": {
    autoAlpha: 0,
    x: () => -responsiveClamp(28, 48),
    duration: 0.75,
    ease: "power3.out",
    clearProps: "transform",
  },
  "fade-subtle": {
    autoAlpha: 0,
    y: () => responsiveClamp(12, 18),
    duration: 0.55,
    ease: "power2.out",
    clearProps: "transform",
  },
  "fade-scale": {
    autoAlpha: 0,
    scale: 0.94,
    y: () => responsiveClamp(14, 24),
    duration: 0.75,
    ease: "back.out(1.3)",
    clearProps: "transform",
  },
  "fade-btn": {
    autoAlpha: 0,
    y: () => responsiveClamp(14, 20),
    duration: 0.5,
    ease: "power2.inOut",
    clearProps: "transform",
  },
} satisfies Record<string, gsap.TweenVars>;

export type FadePresetName = keyof typeof fadePresets;

interface TextAnimations {
  headerAnimation: (
    el: gsap.DOMTarget,
    staggerValue?: number,
    durationValue?: number
  ) => gsap.core.Tween | undefined;
  bodyAnimation: (
    el: gsap.DOMTarget,
    staggerValue?: number,
    durationValue?: number
  ) => gsap.core.Tween | undefined;
  linkAnimation: (
    el: gsap.DOMTarget,
    staggerValue?: number,
    durationValue?: number
  ) => void;
}

const fadeDirections = new Set<FadeDirection>([
  "toTop",
  "toBottom",
  "toLeft",
  "toRight",
]);

const textAnimations: TextAnimations = {
  headerAnimation: (el, staggerValue = 0.055, durationValue = 0.9) => {
    const split = SplitText.create(el, { type: "words,lines", mask: "lines" });
    gsap.set(el, { visibility: "visible" });
    return gsap.from(split.words, {
      yPercent: 110,
      duration: durationValue,
      stagger: staggerValue,
      ease: "power4.out",
      onComplete: () => split.revert(),
    });
  },
  bodyAnimation: (el, staggerValue = 0.04, durationValue = 0.7) => {
    const split = SplitText.create(el, { type: "lines", mask: "lines" });
    gsap.set(el, { visibility: "visible" });
    return gsap.from(split.lines, {
      yPercent: 100,
      opacity: 0,
      duration: durationValue,
      stagger: staggerValue,
      ease: "power3.out",
      onComplete: () => split.revert(),
    });
  },
  linkAnimation: (el) => {
    gsap.set(el, { visibility: "visible" });
  },
};

export function animateText(
  el: gsap.DOMTarget,
  staggerValue?: number,
  durationValue?: number
): gsap.core.Tween | void | undefined {
  const targetEl =
    typeof el === "string"
      ? document.querySelector<HTMLElement>(el)
      : (el as HTMLElement | null);
  const animType = targetEl?.dataset?.textAnim as keyof TextAnimations | undefined;
  const animFunc = animType ? textAnimations[animType] : undefined;
  return animFunc ? animFunc(el, staggerValue, durationValue) : undefined;
}

export function getFadeVars(
  direction: FadeDirection = "toTop",
  presetName: FadePresetName = "fade-1"
): gsap.TweenVars {
  const preset = fadePresets[presetName] ?? fadePresets["fade-1"];
  const tweenVars: gsap.TweenVars = { ...preset };
  const resolveVal = (val: unknown) =>
    typeof val === "function" ? (val as () => number)() : val;

  const presetRecord = preset as Record<string, unknown>;
  const rawDist = resolveVal(presetRecord.y) ?? resolveVal(presetRecord.x) ?? 32;
  const distance = Math.abs(Number(rawDist) || 32);

  if (direction === "toLeft" || direction === "toRight") {
    tweenVars.x = () => (direction === "toLeft" ? distance : -distance);
    delete (tweenVars as any).y;
  } else {
    tweenVars.y = () => (direction === "toTop" ? distance : -distance);
    delete (tweenVars as any).x;
  }

  delete (tweenVars as any).yPercent;
  delete (tweenVars as any).xPercent;
  tweenVars.clearProps = tweenVars.clearProps ?? "transform";

  return tweenVars;
}

export function animateFadeIn(
  el: gsap.DOMTarget,
  direction: FadeDirection = "toTop",
  presetName: FadePresetName = "fade-1",
  scrollTriggerValue: gsap.DOMTarget | object | null = null
): gsap.core.Tween | undefined {
  const targetEl =
    typeof el === "string"
      ? document.querySelector<HTMLElement>(el)
      : (el as HTMLElement | null);
  if (!targetEl) return undefined;

  const tweenVars = getFadeVars(direction, presetName);
  if (scrollTriggerValue) {
    tweenVars.scrollTrigger = scrollTriggerValue as gsap.TweenVars["scrollTrigger"];
  }

  return gsap.from(targetEl, tweenVars);
}

export function initGlobalFadeIns(): void {
  document.querySelectorAll<HTMLElement>('[data-fade-in^="st"]').forEach((el) => {
    const parts = el.dataset.fadeIn?.split(":") ?? [];
    const presetName =
      parts[1] && parts[1] in fadePresets
        ? (parts[1] as FadePresetName)
        : "fade-1";
    const direction =
      parts[2] && fadeDirections.has(parts[2] as FadeDirection)
        ? (parts[2] as FadeDirection)
        : "toTop";

    animateFadeIn(el, direction, presetName, {
      trigger: el,
      start: "top 90%",
      once: true,
      invalidateOnRefresh: true,
    });
  });
}

export function initGlobalTextAnimations(): void {
  document.querySelectorAll<HTMLElement>("[data-text-anim]").forEach((el) => {
    if (el.dataset.textAnim?.startsWith("tl:")) return;
    animateText(el);
  });
}

export function revealAnimationTargets(): void {
  gsap.set("[data-text-anim]", { visibility: "visible" });
  gsap.set("[data-fade-in]", { autoAlpha: 1 });
}
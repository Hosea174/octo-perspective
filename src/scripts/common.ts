import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { responsiveClamp } from "./utils";

export type FadeDirection = "toTop" | "toBottom" | "toLeft" | "toRight";
export const fadePresets = {
  "fade-1": { distance: [22, 36], duration: 0.75, ease: "power3.out" },
  "fade-2": { distance: [32, 52], scale: 0.97, duration: 0.85, ease: "power3.out" },
  "fade-3": { distance: [28, 48], duration: 0.75, ease: "power3.out" },
  "fade-subtle": { distance: [12, 18], duration: 0.55, ease: "power2.out" },
  "fade-scale": { distance: [14, 24], scale: 0.94, duration: 0.75, ease: "back.out(1.3)" },
  "fade-btn": { distance: [14, 20], duration: 0.5, ease: "power2.out" },
} as const;
export type FadePresetName = keyof typeof fadePresets;

// From-vars can be added directly to a section timeline.
export function getFadeVars(direction: FadeDirection = "toTop", name: FadePresetName = "fade-1"): gsap.TweenVars {
  const preset = fadePresets[name] ?? fadePresets["fade-1"];
  const distance = () => responsiveClamp(preset.distance[0], preset.distance[1]);
  const horizontal = direction === "toLeft" || direction === "toRight";
  const sign = direction === "toLeft" || direction === "toTop" ? 1 : -1;
  return {
    autoAlpha: 0,
    [horizontal ? "x" : "y"]: () => sign * distance(),
    ...("scale" in preset ? { scale: preset.scale } : {}),
    duration: preset.duration,
    ease: preset.ease,
    clearProps: "transform",
  };
}

export function animateFadeIn(el: HTMLElement, direction: FadeDirection = "toTop", name: FadePresetName = "fade-1"): gsap.core.Tween {
  const { duration, ease, clearProps, ...initial } = getFadeVars(direction, name);
  gsap.set(el, initial);
  return gsap.to(el, {
    autoAlpha: 1, x: 0, y: 0, scale: 1, duration, ease, clearProps,
    scrollTrigger: { trigger: el, start: "top 90%", once: true, invalidateOnRefresh: true },
  });
}

// Register the returned cleanup with the page lifecycle when creating text reveals manually.
export function animateText(el: HTMLElement, type: "headerAnimation" | "bodyAnimation", scroll = true): () => void {
  const heading = type === "headerAnimation";
  const split = SplitText.create(el, {
    type: heading ? "words,lines" : "lines",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      const targets = heading ? self.words : self.lines;
      gsap.set(targets, { yPercent: 100, opacity: 0 });
      return gsap.to(targets, {
        yPercent: 0, opacity: 1, duration: heading ? 0.8 : 0.65,
        stagger: heading ? 0.045 : 0.06, ease: "power3.out",
        scrollTrigger: scroll ? { trigger: el, start: "top 90%", once: true } : undefined,
        onComplete: () => self.revert(),
      });
    },
  });
  return () => split.revert();
}

export function initGlobalFadeIns(): void {
  const directions = new Set<FadeDirection>(["toTop", "toBottom", "toLeft", "toRight"]);
  document.querySelectorAll<HTMLElement>('[data-fade-in="st"], [data-fade-in^="st:"]').forEach((el) => {
    const [, preset, direction] = (el.dataset.fadeIn ?? "").split(":");
    const name = preset && Object.hasOwn(fadePresets, preset) ? preset as FadePresetName : "fade-1";
    const dir = direction && directions.has(direction as FadeDirection) ? direction as FadeDirection : "toTop";
    animateFadeIn(el, dir, name);
  });
}

export function initGlobalTextAnimations(): () => void {
  const cleanups: Array<() => void> = [];
  try {
    document.querySelectorAll<HTMLElement>('[data-text-anim="headerAnimation"], [data-text-anim="bodyAnimation"]').forEach((el) => {
      cleanups.push(animateText(el, el.dataset.textAnim as "headerAnimation" | "bodyAnimation"));
    });
  } catch (error) {
    cleanups.forEach((cleanup) => cleanup());
    throw error;
  }
  return () => cleanups.forEach((cleanup) => cleanup());
}

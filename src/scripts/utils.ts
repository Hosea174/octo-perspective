import { gsap } from "gsap";

export function responsiveClamp(minValue: number, maxValue: number, minScreen = 350, maxScreen = 1450): number {
  const map = gsap.utils.mapRange(minScreen, maxScreen, minValue, maxValue);
  return Math.round(gsap.utils.clamp(minValue, maxValue, map(window.innerWidth)) * 100) / 100;
}

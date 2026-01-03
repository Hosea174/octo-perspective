import { gsap } from "./main.js";

export function responsiveClamp(
  minValue,
  maxValue,
  minScreen = 350,
  maxScreen = 1450
) {
  const map = gsap.utils.mapRange(minScreen, maxScreen, minValue, maxValue);
  const clamp = gsap.utils.clamp(minValue, maxValue);
  const value = clamp(map(window.innerWidth));
  return Math.round(value * 100) / 100;
}

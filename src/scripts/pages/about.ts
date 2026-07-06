import { gsap } from "../main";
import { whenPageReady } from "../utils";

export function initAbout(): void {
  whenPageReady(() => {
    gsap.context(() => {});
  });
}

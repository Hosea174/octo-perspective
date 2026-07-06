import { gsap } from "../main";
import { whenPageReady } from "../utils";

export function initIndex(): void {
  whenPageReady(() => {
    gsap.context(() => {});
  });
}

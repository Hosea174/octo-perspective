import { gsap } from 'gsap';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export function createMouthSurprise() {
  let openedAt = 0;
  let armed = true;
  let lastBurst = -Infinity;

  function burst() {
    const symbol = document.querySelector<SVGElement>('.visit-bar__mark svg');
    if (!symbol) return;
    const overlay = document.createElement('div');
    overlay.className = 'infinity-surprise';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<div class="infinity-surprise__flash"></div><div class="infinity-surprise__ring"></div><div class="infinity-surprise__ring"></div><div class="infinity-surprise__ring"></div><div class="infinity-surprise__message"><span>A LITTLE INFINITY</span></div>';
    overlay.querySelector('.infinity-surprise__message')!.prepend(symbol.cloneNode(true));
    const particles = Array.from({ length: 24 }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'infinity-surprise__particle';
      particle.append(symbol.cloneNode(true));
      overlay.append(particle);
      const angle = i * Math.PI * 2 / 24;
      const radius = Math.min(innerWidth, innerHeight) * (.24 + (i % 4) * .09);
      return { element: particle, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
    document.body.append(overlay);
    const shake = [
      { translate: '0 0' },
      { translate: '-7px 4px' },
      { translate: '7px -4px' },
      { translate: '-6px -2px' },
      { translate: '5px 3px' },
      { translate: '-3px 2px' },
      { translate: '2px -1px' },
      { translate: '0 0' },
    ];
    document.querySelectorAll<HTMLElement>('.background, #scene, main, .visit-bar, .social-links, #camera-preview, .top-actions, #cursor, .infinity-surprise')
      .forEach(element => element.animate(shake, { duration: 650, easing: 'ease-out' }));
    const timeline = gsap.timeline({ onComplete: () => overlay.remove() });
    timeline.to(overlay.querySelector('.infinity-surprise__flash'), { opacity: 1, duration: .2, yoyo: true, repeat: 1 }, 0)
      .fromTo(overlay.querySelectorAll('.infinity-surprise__ring'), { scale: .1, opacity: .9 }, { scale: 2.8, opacity: 0, duration: 1.8, stagger: .16, ease: 'power2.out' }, 0)
      .fromTo(overlay.querySelector('.infinity-surprise__message'), { scale: .35, rotation: -35, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: .8, ease: 'back.out(1.7)' }, .05)
      .to(overlay.querySelector('.infinity-surprise__message'), { scale: 1.16, opacity: 0, duration: .7, ease: 'power2.in' }, 1.8);
    particles.forEach(({ element, x, y }, i) => {
      timeline.fromTo(element, { x: 0, y: 0, rotation: 0, scale: .3, opacity: 1 }, { x, y, rotation: 180 + i * 35, scale: 1.1, opacity: 0, duration: 1.5 + (i % 4) * .12, ease: 'power2.out' }, .1 + (i % 4) * .035);
    });
  }

  return (face: NormalizedLandmark[] | undefined, now: number) => {
    if (!face?.[14] || !face[13] || !face[33] || !face[263]) { openedAt = 0; return; }
    const eyeWidth = Math.hypot(face[33].x - face[263].x, face[33].y - face[263].y);
    if (eyeWidth < .01) return;
    const mouthGap = Math.hypot(face[13].x - face[14].x, face[13].y - face[14].y) / eyeWidth;
    if (mouthGap < .10) { armed = true; openedAt = 0; }
    else if (mouthGap > .18 && armed) {
      if (!openedAt) openedAt = now;
      if (now - openedAt >= 60 && now - lastBurst >= 2500) { armed = false; lastBurst = now; burst(); }
    } else if (mouthGap <= .18) openedAt = 0;
  };
}

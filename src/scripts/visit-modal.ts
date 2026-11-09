import { gsap } from 'gsap';

const dialog = document.querySelector<HTMLDialogElement>('.visit-modal')!;
const panel = dialog.querySelector<HTMLElement>('.visit-modal__panel')!;
const form = dialog.querySelector<HTMLFormElement>('.visit-form')!;
const toast = document.querySelector<HTMLElement>('.visit-toast')!;
const cursor = document.querySelector<HTMLElement>('#cursor')!;
const preview = document.querySelector<HTMLElement>('#camera-preview')!;
const video = document.querySelector<HTMLVideoElement>('#camera')!;
function movePreview(parent: HTMLElement) {
  parent.append(preview);
  if (video.srcObject && video.paused) void video.play().catch(() => {});
}
let toastAnimation: gsap.core.Timeline | undefined;

document.querySelector<HTMLButtonElement>('#open-visit')!.addEventListener('click', () => {
  dialog.showModal();
  movePreview(dialog);
  dialog.append(cursor);
  gsap.fromTo(panel, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', clearProps: 'transform' });
  gsap.fromTo(panel.querySelectorAll('.visit-modal__top, .visit-form'),
    { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: 'power2.out', clearProps: 'transform' });
});

dialog.querySelector<HTMLButtonElement>('.visit-modal__close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => { movePreview(document.body); document.body.append(cursor); });

form.addEventListener('submit', event => {
  event.preventDefault();
  dialog.close();
  form.reset();
  toastAnimation?.kill();
  toast.hidden = false;
  toastAnimation = gsap.timeline({ onComplete: () => { toast.hidden = true; } })
    .fromTo(toast, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' })
    .to(toast, { opacity: 0, y: -8, duration: .35, ease: 'power2.in' }, '+=2.8');
});

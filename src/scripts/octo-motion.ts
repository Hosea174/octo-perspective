import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
const root = document.documentElement;
const loader = document.querySelector<HTMLElement>('.preloader');
const hero = document.querySelector<HTMLElement>('.hero__title');
const bar = document.querySelector<HTMLElement>('.visit-bar');
const image = document.querySelector<HTMLImageElement>('.background__image');
let finished = false;
let heroEntrance: gsap.core.Timeline | undefined;
const loadingProgress = { value: 0 };
const progressFill = document.querySelector<HTMLElement>('.preloader__fill');
const progressText = document.querySelector<HTMLElement>('.preloader__percentage');
const progressLabel = document.querySelector<HTMLElement>('.preloader__label');
let finishingLoading = false;
function showProgress(value: number, onComplete?: () => void) {
  gsap.killTweensOf(loadingProgress);
  gsap.to(loadingProgress, {
    value: Math.max(value, loadingProgress.value), duration: .45, ease: 'power2.out',
    onUpdate: () => {
      if (progressFill) progressFill.style.transform = `scaleX(${loadingProgress.value / 100})`;
      if (progressText) progressText.textContent = `${Math.round(loadingProgress.value)}%`;
    },
    onComplete,
  });
}

function release() {
  if (finished) return;
  finished = true;
  gsap.killTweensOf(loadingProgress);
  root.classList.add('motion-ready');
  const show = () => { root.classList.add('ready'); if (window.scrollY > 30) { heroEntrance?.progress(1); ScrollTrigger.refresh(); } else heroEntrance?.play(); };
  if (!loader || root.classList.contains('ready')) { show(); return; }
  gsap.to(loader, { opacity: 0, duration: .6, ease: 'power2.inOut', onComplete: show });
}
if (root.dataset.motionFallback !== 'true') try {
  showProgress(5);
  const words = hero ? SplitText.create(hero, { type: 'words', wordsClass: 'hero__word' }).words : [];
  const barCopy = bar?.querySelector<HTMLElement>('.visit-bar__content p');
  const barLines = barCopy ? SplitText.create(barCopy, { type: 'lines', linesClass: 'visit-bar__line' }).lines : [];
  const barMark = bar?.querySelector('.visit-bar__mark');
  const barContent = bar?.querySelector('.visit-bar__content');
  const barButton = document.querySelector<HTMLElement>('.visit-bar__content button')!;
  gsap.set(words, { yPercent: 35, opacity: 0 });
  gsap.set(bar, { y: 24, opacity: 0 });
  gsap.set([barMark, barContent], { y: 12, opacity: 0 });
  gsap.set(barLines, { yPercent: 35, opacity: 0 });
  gsap.set(barButton, { y: 8, opacity: 0 });
  heroEntrance = gsap.timeline({ paused: true })
    .to(words, { yPercent: 0, opacity: 1, duration: .9, stagger: .055, ease: 'power3.out' })
    .to(words, { color: '#ffd53d', duration: .18, stagger: { each: .075, repeat: 1, repeatDelay: .08, yoyo: true }, ease: 'sine.inOut' }, '<+=.12')
    .to(bar, { y: 0, opacity: 1, duration: .55, ease: 'power3.out' }, .15)
    .to([barMark, barContent], { y: 0, opacity: 1, duration: .55, stagger: .12, ease: 'power3.out' }, '<+=.18')
    .to(barLines, { yPercent: 0, opacity: 1, duration: .5, stagger: .1, ease: 'power2.out' }, '<+=.24')
    .to(barButton, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' }, '<+=.18');
  const symbol = bar?.querySelector<SVGElement>('.visit-bar__mark svg');
  if (symbol) gsap.to(symbol, { rotation: 360, transformOrigin: '50% 50%', duration: 18, ease: 'none', repeat: -1 });
  document.querySelectorAll<HTMLElement>('.chapter__card').forEach(card => {
    const icon = card.querySelector('.chapter__icon');
    const title = card.querySelector('h2');
    const copy = card.querySelector('p');
    const titleWords = title ? SplitText.create(title, { type: 'words' }).words : [];
    gsap.set(card, { opacity: 0, y: 30 });
    gsap.set(icon, { opacity: 0, rotation: -35, scale: .8 });
    gsap.set(titleWords, { opacity: 0, yPercent: 35 });
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' } })
      .to(card, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' })
      .to(icon, { opacity: 1, rotation: 0, scale: 1, duration: .6, ease: 'power3.out' }, '-=.45')
      .to(titleWords, { opacity: 1, yPercent: 0, duration: .65, stagger: .06, ease: 'power3.out' }, '-=.5')
      .to(titleWords, { color: '#ffd53d', duration: .18, stagger: { each: .08, repeat: 1, repeatDelay: .08, yoyo: true }, ease: 'sine.inOut' }, '<+=.12');
    if (copy) SplitText.create(copy, {
      type: 'lines', mask: 'lines', linesClass: 'chapter__line', autoSplit: true,
      onSplit: self => gsap.from(self.lines, {
        opacity: 0, yPercent: 100, duration: .8, stagger: .14, ease: 'power3.out',
        scrollTrigger: { trigger: copy, start: 'top 85%', toggleActions: 'play none none reverse' },
      }),
    });
  });
  const footer = document.querySelector<HTMLElement>('.footer');
  if (footer && bar) {
    const barOut = gsap.to(bar, { y: () => bar.offsetHeight + 48, duration: .45, ease: 'power2.inOut', paused: true });
    ScrollTrigger.create({ trigger: footer, start: 'top 75%', onEnter: () => barOut.play(), onLeaveBack: () => barOut.reverse() });
    const footerWord = footer.querySelector<HTMLElement>('.footer__word');
    const footerChars = footerWord ? SplitText.create(footerWord, { type: 'chars', charsClass: 'footer__char' }).chars : [];
    const footerLine = footer.querySelector('.footer__line');
    const footerButton = footer.querySelector('.footer__top');
    gsap.set(footerChars, { opacity: 0 });
    gsap.set(footerLine, { scaleX: 0 });
    gsap.set(footerButton, { y: 20, opacity: 0 });
    const footerEntrance = gsap.timeline({ paused: true })
      .to(footerChars, { opacity: 1, duration: .65, stagger: .08, ease: 'power2.out' })
      .to(footerLine, { scaleX: 1, duration: .85, ease: 'power2.inOut' }, '-=.35')
      .to(footerButton, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, '-=.35');
    ScrollTrigger.create({
      trigger: footer.querySelector('.footer__inner'), start: 'top 95%',
      onEnter: () => footerEntrance.play(),
      onLeaveBack: () => footerEntrance.reverse(),
    });
  }
  root.classList.add('motion-ready');
  let completedAssets = 0;
  const assetReady = () => {
    if (finishingLoading) return;
    completedAssets++;
    if (progressLabel) progressLabel.textContent = 'Preparing the page';
    showProgress(completedAssets * 10);
  };
  const assets = Promise.all([
    (image?.decode().catch(() => {}) ?? Promise.resolve()).then(assetReady),
    document.fonts.ready.then(assetReady),
  ]);
  const sceneReady = new Promise<{ success: boolean; timeout?: boolean }>(resolve => {
    let settled = false;
    const finish = (result: { success: boolean; timeout?: boolean }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      window.removeEventListener('octo:scene-ready', onReady);
      window.removeEventListener('octo:scene-progress', onProgress);
      resolve(result);
    };
    const onReady = (event: Event) => finish((event as CustomEvent<{ success: boolean }>).detail ?? { success: false });
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ loaded: number; total: number; lengthComputable: boolean }>).detail;
      if (finished || finishingLoading) return;
      if (progressLabel) progressLabel.textContent = detail?.lengthComputable ? 'Loading the 3D scene' : 'Preparing the 3D scene';
      if (detail?.lengthComputable && detail.total > 0) showProgress(20 + 70 * Math.min(1, detail.loaded / detail.total));
    };
    const timeout = window.setTimeout(() => finish({ success: false, timeout: true }), 40000);
    window.addEventListener('octo:scene-progress', onProgress);
    if (root.dataset.sceneReady === 'loaded') finish({ success: true });
    else if (root.dataset.sceneReady === 'failed') finish({ success: false });
    else window.addEventListener('octo:scene-ready', onReady);
  });
  showProgress(5);
  Promise.all([assets, sceneReady]).then(([, scene]) => {
    finishingLoading = true;
    if (progressLabel) progressLabel.textContent = scene.success ? 'Scene ready' : 'Opening the still view';
    showProgress(100, release);
  }).catch(error => { console.error('Preloader readiness failed', error); release(); });
} catch (error) { console.error('Motion setup failed', error); gsap.set([hero, bar], { clearProps: 'all' }); release(); }

const visitLink = document.querySelector<HTMLButtonElement>('.visit-bar__content button');
const surprise = document.querySelector<HTMLElement>('.visit-bar__surprise');
if (visitLink && surprise) visitLink.addEventListener('click', () => {
  gsap.killTweensOf(surprise);
  gsap.fromTo(surprise, { x: 0, y: 0, scale: .4, rotation: 0, opacity: 1 }, { x: 22, y: -85, scale: 1.4, rotation: 240, opacity: 0, duration: 1.05, ease: 'power2.out' });
});

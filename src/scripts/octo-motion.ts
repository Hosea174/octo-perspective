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
const loading = gsap.timeline({ repeat: -1, yoyo: true }).fromTo('.preloader__line', { scaleX: .2 }, { scaleX: 1, duration: 1, ease: 'sine.inOut' });

function release() {
  if (finished) return;
  finished = true;
  loading.kill();
  root.classList.add('motion-ready');
  const show = () => { root.classList.add('ready'); if (window.scrollY > 30) { heroEntrance?.progress(1); ScrollTrigger.refresh(); } else heroEntrance?.play(); };
  if (!loader || root.classList.contains('ready')) { show(); return; }
  gsap.to(loader, { opacity: 0, duration: .6, ease: 'power2.inOut', onComplete: show });
}
try {
  const words = hero ? SplitText.create(hero, { type: 'words', wordsClass: 'hero__word' }).words : [];
  const barCopy = bar?.querySelector<HTMLElement>('.visit-bar__content p');
  const barWords = barCopy ? SplitText.create(barCopy, { type: 'words', wordsClass: 'visit-bar__word' }).words : [];
  const barMark = bar?.querySelector('.visit-bar__mark');
  const barContent = bar?.querySelector('.visit-bar__content');
  const barButton = document.querySelector<HTMLElement>('.visit-bar__content a')!;
  gsap.set(words, { yPercent: 35, opacity: 0 });
  gsap.set(bar, { y: 24, opacity: 0 });
  gsap.set([barMark, barContent], { y: 12, opacity: 0 });
  gsap.set(barWords, { yPercent: 35, opacity: 0 });
  gsap.set(barButton, { y: 8, opacity: 0 });
  heroEntrance = gsap.timeline({ paused: true })
    .to(words, { yPercent: 0, opacity: 1, duration: .9, stagger: .055, ease: 'power3.out' })
    .to(bar, { y: 0, opacity: 1, duration: .55, ease: 'power3.out' }, '-=.55')
    .to([barMark, barContent], { y: 0, opacity: 1, duration: .55, stagger: .12, ease: 'power3.out' }, '-=.4')
    .to(barWords, { yPercent: 0, opacity: 1, duration: .45, stagger: .018, ease: 'power2.out' }, '-=.28')
    .to(barButton, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' }, '-=.35');
  const symbol = bar?.querySelector<SVGElement>('.visit-bar__mark svg');
  if (symbol) gsap.to(symbol, { rotation: 360, transformOrigin: '50% 50%', duration: 18, ease: 'none', repeat: -1 });
  document.querySelectorAll<HTMLElement>('.chapter__card').forEach(card => {
    const icon = card.querySelector('.chapter__icon');
    const title = card.querySelector('h2');
    const copy = card.querySelector('p');
    gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' } })
      .from(card, { opacity: 0, y: 30, duration: .7, ease: 'power3.out' })
      .from(icon, { opacity: 0, rotation: -35, scale: .8, duration: .6, ease: 'power3.out' }, '-=.45')
      .from(title, { opacity: 0, y: 20, duration: .7, ease: 'power3.out' }, '-=.5')
      .from(copy, { opacity: 0, y: 12, duration: .6, ease: 'power3.out' }, '-=.5');
  });
  const footer = document.querySelector<HTMLElement>('.footer');
  if (footer && bar) {
    const barOut = gsap.to(bar, { y: () => bar.offsetHeight + 48, duration: .45, ease: 'power2.inOut', paused: true });
    ScrollTrigger.create({ trigger: footer, start: 'top 75%', onEnter: () => barOut.play(), onLeaveBack: () => barOut.reverse() });
    const footerWord = footer.querySelector<HTMLElement>('.footer__word');
    const footerChars = footerWord ? SplitText.create(footerWord, { type: 'chars', charsClass: 'footer__char' }).chars : [];
    const footerLine = footer.querySelector('.footer__line');
    const footerButton = footer.querySelector('.footer__top');
    gsap.timeline({ scrollTrigger: { trigger: footer.querySelector('.footer__inner'), start: 'top 95%', toggleActions: 'play none none reverse' } })
      .from(footerChars, { yPercent: 35, opacity: 0, duration: .85, stagger: .11, ease: 'power3.out' })
      .from(footerLine, { scaleX: 0, duration: .85, ease: 'power2.inOut' }, '-=.35')
      .from(footerButton, { y: 20, opacity: 0, duration: .6, ease: 'power3.out' }, '-=.35');
  }
  root.classList.add('motion-ready');
  Promise.race([Promise.all([image?.decode().catch(() => {}), document.fonts.ready]), new Promise(resolve => setTimeout(resolve, 5000))]).then(release).catch(release);
} catch (error) { console.error('Motion setup failed', error); gsap.set([hero, bar], { clearProps: 'all' }); release(); }

const visitLink = document.querySelector<HTMLAnchorElement>('.visit-bar__content a');
const surprise = document.querySelector<HTMLElement>('.visit-bar__surprise');
if (visitLink && surprise) visitLink.addEventListener('click', () => {
  gsap.killTweensOf(surprise);
  gsap.fromTo(surprise, { x: 0, y: 0, scale: .4, rotation: 0, opacity: 1 }, { x: 22, y: -85, scale: 1.4, rotation: 240, opacity: 0, duration: 1.05, ease: 'power2.out' });
});

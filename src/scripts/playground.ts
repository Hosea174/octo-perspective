import * as THREE from 'three';
import type { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import type { DrawingUtils, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GestureTracker, faceZoom, steadyHand, isMiddleFinger, type Point } from './gestures';
import { createMouthSurprise } from './mouth-surprise';
import { activateVirtualClick } from './virtual-click';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lenis = new Lenis({ anchors: true, smoothWheel: !reducedMotion.matches, lerp: 0.12 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);


const sceneEl = document.querySelector('#scene') as HTMLElement;
const video = document.querySelector('#camera') as HTMLVideoElement;
const preview = document.querySelector('#camera-preview') as HTMLElement;
const depthMap = document.querySelector('#depth-map') as HTMLCanvasElement;
const depthContext = depthMap.getContext('2d')!;
const landmarkCanvas = document.querySelector('#landmarks') as HTMLCanvasElement;
const previewMode = document.querySelector('#preview-mode') as HTMLButtonElement;
const previewLabel = document.querySelector('#preview-label') as HTMLElement;
let depthEnabled = true;
previewMode.addEventListener('click', () => {
  depthEnabled = !depthEnabled;
  depthMap.hidden = !depthEnabled;
  landmarkCanvas.hidden = depthEnabled;
  previewMode.setAttribute('aria-pressed', String(depthEnabled));
  previewMode.setAttribute('aria-label', depthEnabled ? 'Show normal camera preview' : 'Show estimated landmark depth');
  previewMode.textContent = depthEnabled ? 'Camera' : 'Depth';
  previewLabel.textContent = depthEnabled ? 'LANDMARK DEPTH' : 'LIVE TRACKING';
});
function drawDepthMap(face?: NormalizedLandmark[], hand?: NormalizedLandmark[]) {
  if (!depthEnabled) return;
  const ctx = depthContext, w = depthMap.width, h = depthMap.height;
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, w, h);
  if (face?.length) {
    const depths = face.map(point => point.z);
    const near = Math.min(...depths), range = Math.max(.001, Math.max(...depths) - near);
    const edges = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
    for (let i = 0; i + 2 < edges.length; i += 3) {
      const a = face[edges[i].start], b = face[edges[i].end], c = face[edges[i + 1].end];
      if (!a || !b || !c) continue;
      const shade = Math.round(45 + 200 * (1 - ((a.z + b.z + c.z) / 3 - near) / range));
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.lineTo(c.x * w, c.y * h); ctx.closePath(); ctx.fill();
    }
  }
  if (hand?.length) {
    const depths = hand.map(point => point.z);
    const near = Math.min(...depths), range = Math.max(.001, Math.max(...depths) - near);
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const edge of HandLandmarker.HAND_CONNECTIONS) {
      const a = hand[edge.start], b = hand[edge.end];
      if (!a || !b) continue;
      const shade = Math.round(60 + 195 * (1 - ((a.z + b.z) / 2 - near) / range));
      ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
    }
  }
}
const landmarkContext = landmarkCanvas.getContext('2d')!;
let FaceLandmarker: typeof import('@mediapipe/tasks-vision').FaceLandmarker;
let HandLandmarker: typeof import('@mediapipe/tasks-vision').HandLandmarker;
let drawing: DrawingUtils;
const toggle = document.querySelector('#camera-toggle') as HTMLButtonElement;
const recenter = document.querySelector('#recenter') as HTMLButtonElement;
const qualityToggle = document.querySelector('#quality-toggle') as HTMLButtonElement;
const qualityPanel = document.querySelector('#quality-panel') as HTMLElement;
const helpToggle = document.querySelector('#help-toggle') as HTMLButtonElement;
const helpPanel = document.querySelector('#help-panel') as HTMLElement;
const helpClose = document.querySelector('#help-close') as HTMLButtonElement;
const eggSpoiler = document.querySelector('#egg-spoiler') as HTMLButtonElement;
const eggDetails = document.querySelector('#egg-details') as HTMLElement;
const previewToggle = document.querySelector('#preview-toggle') as HTMLInputElement;
const eggConfirm = document.querySelector('#egg-confirm') as HTMLElement;
const eggCancel = document.querySelector('#egg-cancel') as HTMLButtonElement;
const eggReveal = document.querySelector('#egg-reveal') as HTMLButtonElement;
const previewLoading = document.querySelector('#preview-loading') as HTMLElement;
const previewLoadingText = document.querySelector('#preview-loading-text') as HTMLElement;
const qualityRange = document.querySelector('#quality-range') as HTMLInputElement;
const qualityValue = document.querySelector('#quality-value') as HTMLOutputElement;
const performanceToggle = document.querySelector('#performance-mode') as HTMLInputElement;
const qualityReset = document.querySelector('#quality-reset') as HTMLButtonElement;
const status = document.querySelector('#status') as HTMLElement;
const statusContainer = document.querySelector('.camera-status') as HTMLElement;
function setCameraStatus(message: string, state: 'idle' | 'loading' | 'error' = 'idle') { status.textContent = message; statusContainer.dataset.state = state; }
const hint = document.querySelector('#hint') as HTMLElement;
const cursor = document.querySelector('#cursor') as HTMLElement;
let renderer: THREE.WebGLRenderer | undefined;
let spark: SparkRenderer | undefined;
let splat: SplatMesh | undefined;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#33423e');
const camera = new THREE.PerspectiveCamera();
let eyeX = 0, eyeY = 0, targetX = 0, targetY = 0, zoom = 1, targetZoom = 1;
let neutral: {x:number,y:number,width:number} | null = null;
let latestFace: {x:number,y:number,width:number} | null = null;
let stream: MediaStream | null = null;
let worker: Worker | null = null;
let framePending = false;
let running = false, starting = false, lastVideo = -1, lastDetect = 0, lastFaceSeen = 0;
const gestures = new GestureTracker();
const updateMouthSurprise = createMouthSurprise();
let grabY = 0, grabScroll = 0, filteredGrabY = 0, wasGrabbing = false, cursorX = innerWidth/2, cursorY = innerHeight/2;
let filteredX = .5, filteredY = .5, cursorAcquired = false;
let generation = 0, lastRender = 0, lastOverlayDraw = 0;
let sceneDirty = true;
const qualityBudgets = [500_000, 900_000, 1_300_000, 1_800_000];
function applyQualitySettings() {
  const budget = qualityBudgets[Number(qualityRange.value)] ?? qualityBudgets[3];
  const performance = performanceToggle.checked;
  const effectiveBudget = performance ? Math.min(budget, 800_000) : budget;
  if (spark) {
    spark.lodSplatCount = effectiveBudget;
    spark.lodRenderScale = performance ? 1.15 : 1;
  }
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, performance ? 1 : 1.5));
    renderer.setSize(innerWidth, innerHeight);
  }
  qualityValue.value = performance ? `${Number((effectiveBudget / 1_000_000).toFixed(1))}M max · Performance` : `${Number((effectiveBudget / 1_000_000).toFixed(1))}M max`;
  sceneDirty = true;
}
function setQualityPanel(open: boolean) {
  qualityPanel.hidden = !open;
  qualityToggle.setAttribute('aria-expanded', String(open));
}
function setHelpPanel(open: boolean) {
  helpPanel.hidden = !open;
  helpToggle.setAttribute('aria-expanded', String(open));
}
qualityToggle.addEventListener('click', () => {
  const open = Boolean(qualityPanel.hidden);
  if (open) setHelpPanel(false);
  setQualityPanel(open);
});
helpToggle.addEventListener('click', () => {
  const open = Boolean(helpPanel.hidden);
  if (open) setQualityPanel(false);
  setHelpPanel(open);
});
helpClose.addEventListener('click', () => setHelpPanel(false));
eggSpoiler.addEventListener('click', () => {
  if (!eggDetails.hidden) {
    eggDetails.hidden = true;
    eggSpoiler.setAttribute('aria-expanded', 'false');
    return;
  }
  eggConfirm.hidden = false;
  eggSpoiler.hidden = true;
  eggCancel.focus();
});
eggCancel.addEventListener('click', () => {
  eggConfirm.hidden = true;
  eggSpoiler.hidden = false;
  eggSpoiler.focus();
});
eggReveal.addEventListener('click', () => {
  eggConfirm.hidden = true;
  eggSpoiler.hidden = false;
  eggDetails.hidden = false;
  eggSpoiler.setAttribute('aria-expanded', 'true');
  eggSpoiler.focus();
});
previewToggle.addEventListener('change', () => {
  preview.hidden = !previewToggle.checked || (!running && !starting);
});
qualityRange.addEventListener('input', applyQualitySettings);
performanceToggle.addEventListener('change', applyQualitySettings);
qualityReset.addEventListener('click', () => {
  qualityRange.value = matchMedia('(max-width: 700px)').matches ? '1' : '3';
  performanceToggle.checked = false;
  applyQualitySettings();
});
document.addEventListener('click', (event) => {
  if (!qualityPanel.hidden && !qualityPanel.contains(event.target as Node) && !qualityToggle.contains(event.target as Node)) setQualityPanel(false);
  if (!helpPanel.hidden && !helpPanel.contains(event.target as Node) && !helpToggle.contains(event.target as Node)) setHelpPanel(false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setQualityPanel(false); setHelpPanel(false); } });
let rudeSince = 0, rudeArmed = true, lastRude = -Infinity;
export function reactToMiddleFinger(points: Point[] | undefined, now: number) {
  if (!isMiddleFinger(points)) { rudeSince = 0; rudeArmed = true; return; }
  if (!rudeArmed) return;
  if (!rudeSince) rudeSince = now;
  if (now - rudeSince < 220 || now - lastRude < 5000) return;
  rudeArmed = false; lastRude = now;
  const message = document.createElement('div');
  message.className = 'kindness-message';
  message.setAttribute('role', 'status');
  message.innerHTML = `<div class="kindness-message__wash"></div>
    <div class="kindness-message__content">
      <span class="kindness-message__eyebrow">That's not very nice.</span>
      <div class="kindness-message__title"><span>LOVE</span><span>YOU TOO.</span></div>
      <svg class="kindness-message__smile" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#ffd53d"/><circle cx="35" cy="40" r="4" fill="#111"/><circle cx="65" cy="40" r="4" fill="#111"/><path d="M29 58c5 12 13 18 21 18s16-6 21-18" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/></svg>
      <span class="kindness-message__footnote">A little kindness goes a long way.</span>
    </div>`;
  document.body.append(message);
  gsap.timeline({ onComplete: () => message.remove() })
    .fromTo(message.querySelector('.kindness-message__wash'), { opacity: 0 }, { opacity: 1, duration: .35 }, 0)
    .fromTo(message.querySelectorAll('.kindness-message__title span'), { yPercent: 65, rotation: -4, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .7, stagger: .1, ease: 'back.out(1.3)' }, .05)
    .fromTo(message.querySelector('.kindness-message__smile'), { scale: 0, rotation: -90 }, { scale: 1, rotation: 12, duration: .65, ease: 'back.out(2)' }, .3)
    .fromTo(message.querySelectorAll('.kindness-message__eyebrow, .kindness-message__footnote'), { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: .12 }, .45)
    .to(message.querySelector('.kindness-message__smile'), { rotation: -12, duration: .55, repeat: 2, yoyo: true, ease: 'sine.inOut' }, .95)
    .to(message, { opacity: 0, scale: 1.04, duration: .45, ease: 'power2.in' }, 3.2);
}
const sceneEye = new THREE.Vector3(-15.404, 2.978, 8.593);
const sceneTarget = new THREE.Vector3(-9.25, 2.835, 5.712);
const sceneDistance = sceneEye.distanceTo(sceneTarget);
camera.fov = 48;
camera.position.copy(sceneEye);
camera.lookAt(sceneTarget);
const sceneOrientation = camera.quaternion.clone();
const sceneRight = new THREE.Vector3(1, 0, 0).applyQuaternion(sceneOrientation);
const sceneUp = new THREE.Vector3(0, 1, 0).applyQuaternion(sceneOrientation);
function project(force = false) {
  const previousZoom = zoom, previousEyeX = eyeX, previousEyeY = eyeY;
  zoom += (targetZoom - zoom) * 0.14;
  eyeX += (targetX - eyeX) * 0.3; eyeY += (targetY - eyeY) * 0.3;
  if (Math.abs(targetZoom - zoom) < 0.0005) zoom = targetZoom;
  if (Math.abs(targetX - eyeX) < 0.0005) eyeX = targetX;
  if (Math.abs(targetY - eyeY) < 0.0005) eyeY = targetY;
  const changed = force || Math.abs(zoom - previousZoom) > 0.0001 || Math.abs(eyeX - previousEyeX) > 0.0001 || Math.abs(eyeY - previousEyeY) > 0.0001;
  if (!changed) return false;
  const offsetX = eyeX * 10, offsetY = eyeY * 8;
  const height = 2 * sceneDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / zoom;
  const width = height * innerWidth / innerHeight, near = .05;
  camera.position.copy(sceneEye).addScaledVector(sceneRight, offsetX).addScaledVector(sceneUp, offsetY);
  camera.quaternion.copy(sceneOrientation);
  camera.projectionMatrix.makePerspective((-width/2-offsetX)*near/sceneDistance, (width/2-offsetX)*near/sceneDistance, (height/2-offsetY)*near/sceneDistance, (-height/2-offsetY)*near/sceneDistance, near, 1000);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  return true;
}
function resize() { renderer?.setSize(innerWidth, innerHeight); sceneDirty = true; }
async function initScene() { try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  const { SparkRenderer, SplatMesh } = await import('@sparkjsdev/spark');
  const isSmallScreen = matchMedia('(max-width: 700px)').matches;
  if (isSmallScreen) qualityRange.value = '1';
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); resize(); sceneEl.appendChild(renderer.domElement);
  spark = new SparkRenderer({ renderer, enableLod: true, lodSplatCount: qualityBudgets[Number(qualityRange.value)], lodRenderScale: 1, focalAdjustment: 2, sortRadial: false, onDirty: () => { sceneDirty = true; } }); scene.add(spark);
  applyQualitySettings();
  splat = new SplatMesh({ url: '/media/octo.spz', lod: true, onProgress: (event) => {
    window.dispatchEvent(new CustomEvent('octo:scene-progress', { detail: { loaded: event.loaded, total: event.total, lengthComputable: event.lengthComputable } }));
  } });
  splat.rotation.x = Math.PI;
  splat.initialized.then(() => { scene.add(splat!); sceneEl.style.display = 'flex'; sceneDirty = true; document.documentElement.dataset.sceneReady = 'loaded'; window.dispatchEvent(new CustomEvent('octo:scene-ready', { detail: { success: true } })); }).catch((error: unknown) => { console.error('Scene failed to load', error); document.documentElement.dataset.sceneReady = 'failed'; window.dispatchEvent(new CustomEvent('octo:scene-ready', { detail: { success: false } })); });
  const draw = (now = 0) => {
    requestAnimationFrame(draw);
    if (document.visibilityState !== 'visible' || now - lastRender < 33) return;
    lastRender = now;
    const forceRender = sceneDirty;
    const cameraChanged = project(forceRender);
    if (forceRender || cameraChanged) {
      sceneDirty = false;
      renderer?.render(scene, camera);
    }
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sceneDirty = true; });
  draw();
  addEventListener('resize', resize);
} catch (error) { console.error('Scene initialization failed', error); document.documentElement.dataset.sceneReady = 'failed'; window.dispatchEvent(new CustomEvent('octo:scene-ready', { detail: { success: false } })); } }
void initScene();

function stop() {
  generation++; running = false; starting = false;
  stream?.getTracks().forEach(track => track.stop()); stream = null; video.srcObject = null;
  worker?.terminate(); worker = null; framePending = false;
  preview.hidden = true; previewLoading.hidden = false; previewLoadingText.textContent = 'Waiting for camera'; landmarkContext.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);
  neutral = null; latestFace = null; targetX = targetY = 0; targetZoom = 1; wasGrabbing = false; lenis.scrollTo(lenis.scroll, { immediate: true }); gestures.reset(); lastVideo = -1;
  cursor.style.display = 'none'; cursor.classList.remove('active');
  document.body.classList.remove('camera-on'); toggle.disabled = false; toggle.hidden = false; recenter.hidden = true; setCameraStatus('Camera is off', 'error');
}
function trackHand(points: Point[] | undefined, now: number) {
  const { state, entered } = gestures.update(points, now);
  if (wasGrabbing && state !== 'grab') { lenis.scrollTo(lenis.scroll, { immediate: true }); wasGrabbing = false; }
  if (!points || state === 'idle') {
    cursor.style.display = 'none'; cursor.classList.remove('active'); cursorAcquired = false;
    return state;
  }
  if (state === 'grab') {
    cursor.style.display = 'none'; cursorAcquired = false;
    if (entered) { grabY = filteredGrabY = points[9].y; grabScroll = lenis.scroll; wasGrabbing = true; }
    filteredGrabY = steadyHand(filteredGrabY, points[9].y);
    const destination = grabScroll - (filteredGrabY - grabY) * innerHeight * 3;
    lenis.scrollTo(destination, { lerp: 0.16, immediate: reducedMotion.matches });
  } else {
    if (state === 'point') {
      const x = Math.max(0, Math.min(1, 1 - points[8].x));
      const y = Math.max(0, Math.min(1, points[8].y));
      if (!cursorAcquired) { filteredX = x; filteredY = y; cursorX = x * innerWidth; cursorY = y * innerHeight; cursorAcquired = true; }
      filteredX = steadyHand(filteredX, x, .006); filteredY = steadyHand(filteredY, y, .006);
      cursorX += (filteredX * innerWidth - cursorX) * .35;
      cursorY += (filteredY * innerHeight - cursorY) * .35;
    }
    cursor.style.display = 'block'; cursor.style.left = `${cursorX}px`; cursor.style.top = `${cursorY}px`;
    cursor.classList.toggle('active', state === 'pinch');
    if (state === 'pinch' && entered) {
      cursor.querySelector('.cursor__pulse')?.animate([{ transform: 'scale(.65)', opacity: .95 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 450, easing: 'ease-out' });
      activateVirtualClick(cursorX, cursorY);
    }
  }
  return state;
}
type Landmark = NormalizedLandmark;
function drawLandmarks(facePoints?: Landmark[], handPoints?: Landmark[]) {
  landmarkContext.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);
  if (facePoints) {
    drawing.drawConnectors(facePoints, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#ffffff55', lineWidth: 1 });
    drawing.drawConnectors(facePoints, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#ffffffcc', lineWidth: 2 });
    drawing.drawConnectors(facePoints, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: '#ffffffcc', lineWidth: 2 });
    drawing.drawConnectors(facePoints, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: '#ffffffcc', lineWidth: 2 });
  }
  if (handPoints) {
    drawing.drawConnectors(handPoints, HandLandmarker.HAND_CONNECTIONS, { color: '#cfe99a', lineWidth: 3 });
    drawing.drawLandmarks(handPoints, { color: '#ffffff', radius: 3 });
  }
}
function handleTracking(landmarks: Landmark[] | undefined, handPoints: Landmark[] | undefined, now: number) {
  if (landmarks) {
    const leftEye = landmarks[33], rightEye = landmarks[263];
    const width = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y);
    latestFace = { x: landmarks[1].x, y: landmarks[1].y, width }; lastFaceSeen = now;
    if (!neutral && width > .01) neutral = { ...latestFace };
    if (neutral && !reducedMotion.matches) {
      targetX = Math.max(-.22, Math.min(.22, -(latestFace.x-neutral.x)*1.1));
      targetY = Math.max(-.14, Math.min(.14, -(latestFace.y-neutral.y)*1.1));
      targetZoom = faceZoom(width, neutral.width);
    }
  } else if (now-lastFaceSeen > 1000) { targetX = targetY = 0; targetZoom = 1; }
  updateMouthSurprise(landmarks, now);
  reactToMiddleFinger(handPoints, now);
  const gesture = trackHand(handPoints, now);
  if (now - lastOverlayDraw >= 66) {
    lastOverlayDraw = now;
    drawLandmarks(landmarks, handPoints);
    drawDepthMap(landmarks, handPoints);
  }
  setCameraStatus('');
  preview.dataset.gesture = gesture;
}
function tick(now: number) {
  if (!running) return;
  requestAnimationFrame(tick);
  if (document.hidden || framePending || video.readyState < 2 || video.currentTime === lastVideo || now-lastDetect < 25) return;
  lastDetect = now; lastVideo = video.currentTime; framePending = true;
  const activeWorker = worker;
  createImageBitmap(video).then(bitmap => {
    if (!running || activeWorker !== worker || !activeWorker) { bitmap.close(); return; }
    activeWorker.postMessage({ type: 'frame', bitmap, timestamp: now }, [bitmap]);
  }).catch(error => { framePending = false; console.error('Could not read camera frame', error); });
}
async function start() {
  if (starting || running) return;
  starting = true; const current = ++generation; toggle.disabled = true; previewLoadingText.textContent = 'Waiting for camera permission'; previewLoading.hidden = false; preview.hidden = !previewToggle.checked; setCameraStatus('Starting camera', 'loading');
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access requires HTTPS or localhost.');
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    if (current !== generation) { cameraStream.getTracks().forEach(t => t.stop()); return; }
    stream = cameraStream; video.srcObject = stream; await video.play();
    setCameraStatus('Loading tracking', 'loading');
    previewLoadingText.textContent = 'Loading face and hand tracking';
    previewLoading.hidden = false;
    const vision = await import('@mediapipe/tasks-vision');
    if (current !== generation) return;
    FaceLandmarker = vision.FaceLandmarker; HandLandmarker = vision.HandLandmarker;
    drawing = new vision.DrawingUtils(landmarkContext);
    const tracker = new Worker(new URL('./tracking.worker.ts', import.meta.url), { type: 'module' });
    worker = tracker;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Tracking model took too long to load')), 30000);
      tracker.onmessage = (event) => {
        if (event.data.type === 'ready') { clearTimeout(timeout); resolve(); }
        else if (event.data.type === 'error') { clearTimeout(timeout); reject(new Error(event.data.message)); }
      };
      tracker.onerror = (event) => { clearTimeout(timeout); reject(new Error(event.message)); };
      tracker.postMessage({ type: 'init' });
    });
    if (current !== generation) return;
    tracker.onmessage = (event) => {
      if (event.data.type === 'result') {
        framePending = false;
        handleTracking(event.data.facePoints, event.data.handPoints, event.data.timestamp);
      } else if (event.data.type === 'error') {
        console.error('Tracking stopped', event.data.message); stop(); setCameraStatus('Tracking stopped', 'error'); hint.textContent = 'Try enabling the camera again.';
      }
    };
    tracker.onerror = (event) => { console.error('Tracking worker failed', event.message); stop(); setCameraStatus('Tracking stopped', 'error'); hint.textContent = 'Try enabling the camera again.'; };
    running = true; starting = false; toggle.disabled = false; previewLoading.hidden = true; preview.dataset.state = 'live';
    toggle.hidden = true; recenter.hidden = false; setCameraStatus(''); document.body.classList.add('camera-on');
    hint.textContent = 'Point to move · pinch to select · fist to scroll';
    stream.getVideoTracks()[0]?.addEventListener('ended', () => { stop(); setCameraStatus('Camera disconnected', 'error'); });
    requestAnimationFrame(tick);
  } catch (error) { console.error(error); stop(); setCameraStatus(error instanceof Error && error.message.includes('Tracking model') ? 'Tracking took too long to load' : 'Camera or tracking unavailable', 'error'); hint.textContent = 'Check camera permission or your connection and try again.'; }
}
toggle.addEventListener('click', () => { toggle.hidden = true; void start(); });
void start();
recenter.addEventListener('click', () => { if (latestFace) neutral = { ...latestFace }; });
addEventListener('pagehide', stop);




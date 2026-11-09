import * as THREE from 'three';
import { SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { FaceLandmarker, HandLandmarker, DrawingUtils, type NormalizedLandmark } from '@mediapipe/tasks-vision';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GestureTracker, faceZoom, steadyHand, type Point } from './gestures';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const lenis = new Lenis({ anchors: true, smoothWheel: !reducedMotion.matches, lerp: 0.12 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);


const sceneEl = document.querySelector('#scene') as HTMLElement;
const video = document.querySelector('#camera') as HTMLVideoElement;
const preview = document.querySelector('#camera-preview') as HTMLElement;
const heatmap = document.querySelector('#heatmap') as HTMLCanvasElement;
const heatContext = heatmap.getContext('2d', { willReadFrequently: true })!;
const previewMode = document.querySelector('#preview-mode') as HTMLButtonElement;
const previewLabel = document.querySelector('#preview-label') as HTMLElement;
let heatmapEnabled = false, lastHeatmap = 0;
previewMode.addEventListener('click', () => {
  heatmapEnabled = !heatmapEnabled;
  heatmap.hidden = !heatmapEnabled;
  previewMode.setAttribute('aria-pressed', String(heatmapEnabled));
  previewMode.setAttribute('aria-label', heatmapEnabled ? 'Show normal camera preview' : 'Show brightness heatmap');
  previewMode.textContent = heatmapEnabled ? 'Camera' : 'Heatmap';
  previewLabel.textContent = heatmapEnabled ? 'BRIGHTNESS MAP' : 'LIVE TRACKING';
});
function drawHeatmap(now: number) {
  if (!heatmapEnabled || now - lastHeatmap < 100 || video.readyState < 2) return;
  lastHeatmap = now;
  heatContext.drawImage(video, 0, 0, heatmap.width, heatmap.height);
  const frame = heatContext.getImageData(0, 0, heatmap.width, heatmap.height);
  for (let i = 0; i < frame.data.length; i += 4) {
    const light = (frame.data[i] * .2126 + frame.data[i + 1] * .7152 + frame.data[i + 2] * .0722) / 255;
    frame.data[i] = Math.min(255, Math.max(0, (light * 3 - .5) * 255));
    frame.data[i + 1] = Math.min(255, Math.max(0, (light * 3 - 1.5) * 255));
    frame.data[i + 2] = Math.min(255, Math.max(0, (1.2 - light * 2.2) * 255));
  }
  heatContext.putImageData(frame, 0, 0);
}
const landmarkCanvas = document.querySelector('#landmarks') as HTMLCanvasElement;
const landmarkContext = landmarkCanvas.getContext('2d')!;
const drawing = new DrawingUtils(landmarkContext);
const toggle = document.querySelector('#camera-toggle') as HTMLButtonElement;
const recenter = document.querySelector('#recenter') as HTMLButtonElement;
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
let grabY = 0, grabScroll = 0, filteredGrabY = 0, wasGrabbing = false, cursorX = innerWidth/2, cursorY = innerHeight/2;
let filteredX = .5, filteredY = .5, cursorAcquired = false;
let generation = 0;
function project() {
  zoom += (targetZoom - zoom) * 0.14;
  const width = 0.34 * 0.95 / zoom, height = 0.19 * 0.95 / zoom, distance = 0.6, near = 0.05;
  eyeX += (targetX - eyeX) * 0.3; eyeY += (targetY - eyeY) * 0.3;
  camera.position.set(eyeX, eyeY, distance);
  camera.lookAt(eyeX, eyeY, 0);
  camera.projectionMatrix.makePerspective((-width/2-eyeX)*near/distance, (width/2-eyeX)*near/distance, (height/2-eyeY)*near/distance, (-height/2-eyeY)*near/distance, near, 1000);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}
function resize() {
  const aspect = 34 / 19;
  const width = Math.min(innerWidth, innerHeight * aspect);
  const height = width / aspect;
  renderer?.setSize(width, height);
}
if (new URLSearchParams(location.search).get('scene') === '3d') {
try {
  sceneEl.style.display = 'flex';
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); resize(); sceneEl.appendChild(renderer.domElement);
  spark = new SparkRenderer({ renderer, enableLod: true, lodSplatCount: 1000000 }); scene.add(spark);
  splat = new SplatMesh({ url: '/media/demoSplat.ply', lod: true });
  splat.position.set(0, -0.02, 0); splat.scale.setScalar(0.05);
  splat.initialized.then(() => scene.add(splat!)).catch((error: unknown) => { console.error('Scene failed to load', error); hint.textContent = 'The scene could not load. Camera controls are still available.'; });
  const draw = () => { if (document.visibilityState === 'visible') { project(); renderer?.render(scene, camera); } requestAnimationFrame(draw); }; draw();
  addEventListener('resize', resize);
} catch (error) { console.error('WebGL unavailable', error); hint.textContent = '3D is unavailable on this device. You can still explore the page.'; }
}

function stop() {
  generation++; running = false; starting = false;
  stream?.getTracks().forEach(track => track.stop()); stream = null; video.srcObject = null;
  worker?.terminate(); worker = null; framePending = false;
  preview.hidden = true; landmarkContext.clearRect(0, 0, landmarkCanvas.width, landmarkCanvas.height);
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
      const element = document.elementFromPoint(cursorX, cursorY)?.closest('a,button,input,select,textarea,[role="button"]');
      if (element instanceof HTMLElement && !element.matches(':disabled,[aria-disabled="true"]')) element.click();
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
      targetX = Math.max(-.18, Math.min(.18, -(latestFace.x-neutral.x)*1.1));
      targetY = Math.max(-.14, Math.min(.14, -(latestFace.y-neutral.y)*1.1));
      targetZoom = faceZoom(width, neutral.width);
    }
  } else if (now-lastFaceSeen > 1000) { targetX = targetY = 0; targetZoom = 1; }
  const gesture = trackHand(handPoints, now);
  drawLandmarks(landmarks, handPoints);
  drawHeatmap(now);
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
  starting = true; const current = ++generation; toggle.disabled = true; setCameraStatus('Starting camera', 'loading');
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access requires HTTPS or localhost.');
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    if (current !== generation) { cameraStream.getTracks().forEach(t => t.stop()); return; }
    stream = cameraStream; video.srcObject = stream; await video.play();
    setCameraStatus('Loading tracking', 'loading');
    preview.hidden = false;
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
    running = true; starting = false; toggle.disabled = false;
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




import { FaceLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// MediaPipe's classic WASM loader expects importScripts; module workers need a global loader.
(self as typeof self & { import: (url: string) => Promise<void> }).import = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Tracking runtime failed to load (${response.status})`);
  (0, eval)(await response.text());
};

let face: FaceLandmarker | undefined;
let hand: HandLandmarker | undefined;
type NormalizedLandmark = { x: number; y: number; z: number };
let lastHandDetection = -Infinity;
let latestHandPoints: NormalizedLandmark[] | undefined;
const handDetectionInterval = 66;

async function initialize() {
  const vision = await FilesetResolver.forVisionTasks('/wasm');
  const faceModel = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const handModel = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  // Some browsers cannot create a GPU context inside a worker; CPU remains usable there.
  for (const delegate of ['GPU', 'CPU'] as const) {
    try {
      face = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: faceModel, delegate }, runningMode: 'VIDEO', numFaces: 1 });
      hand = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: handModel, delegate }, runningMode: 'VIDEO', numHands: 1 });
      return;
    } catch (error) {
      face?.close(); hand?.close(); face = undefined; hand = undefined;
      if (delegate === 'CPU') throw error;
    }
  }
}

self.onmessage = async (event: MessageEvent) => {
  if (event.data.type === 'init') {
    try { await initialize(); lastHandDetection = -Infinity; latestHandPoints = undefined; self.postMessage({ type: 'ready' }); }
    catch (error) { self.postMessage({ type: 'error', message: String(error) }); }
  } else if (event.data.type === 'frame') {
    const { bitmap, timestamp } = event.data as { bitmap: ImageBitmap; timestamp: number };
    try {
      const facePoints = face?.detectForVideo(bitmap, timestamp).faceLandmarks[0];
      if (hand && timestamp - lastHandDetection >= handDetectionInterval) {
        latestHandPoints = hand.detectForVideo(bitmap, timestamp).landmarks[0];
        lastHandDetection = timestamp;
      }
      self.postMessage({ type: 'result', facePoints, handPoints: latestHandPoints, timestamp });
    } catch (error) { self.postMessage({ type: 'error', message: String(error) }); }
    finally { bitmap.close(); }
  }
};




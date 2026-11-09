export type Point = { x: number; y: number; z?: number };
export type Gesture = 'idle' | 'point' | 'pinch' | 'grab';
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));

function extended(p: Point[], mcp: number, pip: number, tip: number) {
  const a = p[mcp], b = p[pip], c = p[tip];
  const ux = a.x-b.x, uy = a.y-b.y, uz = (a.z ?? 0)-(b.z ?? 0);
  const vx = c.x-b.x, vy = c.y-b.y, vz = (c.z ?? 0)-(b.z ?? 0);
  const cosine = (ux*vx + uy*vy + uz*vz) / Math.max(dist(a,b)*dist(b,c), 0.00001);
  return cosine < -0.55 && dist(c, p[0]) > dist(b, p[0]) * 1.12;
}

export function classifyHand(p: Point[], previous: Gesture): Gesture {
  if (p.length < 21) return 'idle';
  const index = extended(p, 5, 6, 8);
  const middle = extended(p, 9, 10, 12);
  const ring = extended(p, 13, 14, 16);
  const pinky = extended(p, 17, 18, 20);
  const otherFingersFolded = !middle && !ring && !pinky;
  const palm = Math.max(dist(p[0], p[9]), dist(p[5], p[17]), 0.04);
  const pinch = dist(p[4], p[8]) / palm < (previous === 'pinch' ? 0.55 : 0.42);
  // A pinch must begin from pointing, so a closed fist cannot accidentally click.
  if (otherFingersFolded && pinch && (previous === 'point' || previous === 'pinch')) return 'pinch';
  if (otherFingersFolded && !index) return 'grab';
  if (otherFingersFolded && index) return 'point';
  return 'idle';
}

export class GestureTracker {
  state: Gesture = 'idle';
  private candidate: Gesture = 'idle';
  private since = 0;
  reset() { this.state = 'idle'; this.candidate = 'idle'; this.since = 0; }
  update(points: Point[] | undefined, now: number): { state: Gesture; entered: boolean } {
    if (!points) { this.reset(); return { state: 'idle', entered: false }; }
    const next = classifyHand(points, this.state);
    if (next !== this.candidate) { this.candidate = next; this.since = now; }
    const delay = next === 'idle' ? 0 : next === 'pinch' ? 40 : 90;
    if (next !== this.state && now - this.since >= delay) {
      this.state = next;
      return { state: next, entered: true };
    }
    return { state: this.state, entered: false };
  }
}
export function faceZoom(faceWidth: number, neutralWidth: number): number {
  if (!Number.isFinite(faceWidth) || !Number.isFinite(neutralWidth) || neutralWidth <= 0 || faceWidth <= 0) return 1;
  return Math.max(0.9, Math.min(1.3, faceWidth / neutralWidth));
}

export function steadyHand(previous: number, next: number, deadZone = 0.012): number {
  const delta = next - previous;
  return Math.abs(delta) <= deadZone ? previous : next - Math.sign(delta) * deadZone;
}

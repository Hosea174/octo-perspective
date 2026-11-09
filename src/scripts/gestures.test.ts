import assert from 'node:assert/strict';
import { classifyHand, GestureTracker, faceZoom, steadyHand, type Point } from './gestures';

function hand(indexExtended: boolean, otherExtended: boolean, pinch = false): Point[] {
  const p: Point[] = Array.from({length: 21}, () => ({ x: .5, y: .8, z: 0 }));
  p[0] = { x: .5, y: .9 }; p[9] = { x: .5, y: .7 };
  for (const [mcp, pip, tip, x, straight] of [[5,6,8,.4,indexExtended],[9,10,12,.5,otherExtended],[13,14,16,.6,otherExtended],[17,18,20,.7,otherExtended]] as const) {
    p[mcp] = { x, y: .7 }; p[pip] = { x, y: .55 }; p[tip] = { x, y: straight ? .3 : .72 };
  }
  p[4] = pinch ? { ...p[8] } : { x: .2, y: .65 };
  return p;
}

{
  const pointer = hand(true, false), fist = hand(false, false), open = hand(true, true), pinch = hand(false, false, true);
  assert.equal(classifyHand(open, 'idle'), 'idle');
  assert.equal(classifyHand(pointer, 'idle'), 'point');
  assert.equal(classifyHand(fist, 'idle'), 'grab');
  assert.equal(classifyHand(pinch, 'point'), 'pinch');
  assert.equal(classifyHand(pinch, 'idle'), 'grab');
  const t = new GestureTracker();
  t.update(pointer, 0); assert.deepEqual(t.update(pointer, 100), { state: 'point', entered: true });
  t.update(pinch, 110); assert.deepEqual(t.update(pinch, 160), { state: 'pinch', entered: true });
  assert.equal(t.update(pinch, 220).entered, false);
  assert.equal(t.update(undefined, 230).state, 'idle');
  t.update(fist, 240); assert.deepEqual(t.update(fist, 340), { state: 'grab', entered: true });
  assert.equal(t.update(open, 350).state, 'idle');
}


assert.equal(faceZoom(.12, .12), 1);
assert.equal(faceZoom(.3, .12), 1.3);
assert.equal(faceZoom(.04, .12), 0.9);
assert.equal(faceZoom(.1, 0), 1);
assert.equal(steadyHand(.5, .505), .5);
assert.ok(Math.abs(steadyHand(.5, .55) - .538) < 1e-9);

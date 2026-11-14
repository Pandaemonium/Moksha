'use strict';
// ───────────────────────────────────────────────────────────────
//  Input: keyboard + mouse + gamepad, mapped to actions
// ───────────────────────────────────────────────────────────────
(() => {
  const I = {
    down: new Set(), pressed: new Set(), released: new Set(),
    mx: 0, my: 0, mouseMoved: false, usingPad: false,
    padMove: { x: 0, y: 0 }, padAim: { x: 0, y: 0 },
  };
  M.input = I;
  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
    KeyJ: 'attack', KeyK: 'special', Space: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyQ: 'astra', KeyL: 'astra',
    KeyE: 'interact', KeyF: 'interact', Enter: 'confirm', Escape: 'pause', Tab: 'boons', KeyI: 'boons',
  };
  const press = (a) => { if (!I.down.has(a)) I.pressed.add(a); I.down.add(a); };
  const release = (a) => { if (I.down.has(a)) I.released.add(a); I.down.delete(a); };

  window.addEventListener('keydown', (e) => {
    M.audio.init();
    const a = KEYMAP[e.code];
    if (a) {
      if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      if (!e.repeat) press(a);
      I.usingPad = false;
    }
    M.events.emit('key', e);
  });
  window.addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) release(a); });
  window.addEventListener('blur', () => { for (const a of [...I.down]) release(a); });
  window.addEventListener('mousemove', (e) => { I.mx = e.clientX; I.my = e.clientY; I.mouseMoved = true; I.usingPad = false; });
  window.addEventListener('mousedown', (e) => {
    M.audio.init();
    if (!e.target || e.target.id !== 'game') return;
    if (e.button === 0) press('attack');
    if (e.button === 2) press('special');
  });
  window.addEventListener('mouseup', (e) => { if (e.button === 0) release('attack'); if (e.button === 2) release('special'); });
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  // gamepad
  const PADMAP = { 0: 'dash', 2: 'attack', 3: 'special', 5: 'astra', 7: 'astra', 1: 'interact', 9: 'pause', 8: 'boons', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
  const padPrev = {};
  I.pollPad = () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = pads && [...pads].find((x) => x && x.connected);
    if (!p) { I.padMove.x = I.padMove.y = 0; return; }
    const dz = (v) => (Math.abs(v) < 0.2 ? 0 : v);
    I.padMove.x = dz(p.axes[0] || 0); I.padMove.y = dz(p.axes[1] || 0);
    I.padAim.x = dz(p.axes[2] || 0); I.padAim.y = dz(p.axes[3] || 0);
    if (I.padMove.x || I.padMove.y || I.padAim.x || I.padAim.y) I.usingPad = true;
    p.buttons.forEach((b, i) => {
      const a = PADMAP[i];
      if (!a) return;
      if (b.pressed && !padPrev[i]) { press(a); I.usingPad = true; if (a === 'interact' || a === 'dash') I.pressed.add('confirm'); }
      if (!b.pressed && padPrev[i]) release(a);
      padPrev[i] = b.pressed;
    });
  };
  I.endFrame = () => { I.pressed.clear(); I.released.clear(); };
  I.moveVec = () => {
    let x = (I.down.has('right') ? 1 : 0) - (I.down.has('left') ? 1 : 0);
    let y = (I.down.has('down') ? 1 : 0) - (I.down.has('up') ? 1 : 0);
    if (I.padMove.x || I.padMove.y) { x = I.padMove.x; y = I.padMove.y; }
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    return { x, y };
  };
})();

(() => {
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const state = document.querySelector('#sessionState');
  const coords = document.querySelector('#coordinates');
  const nameInput = document.querySelector('#playerName');
  let started = false;
  let camera = { x: 0, z: 18 };
  const keys = new Set();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#91b4c8'); sky.addColorStop(1, '#e2d6b8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8d9d78'; ctx.fillRect(0, h * .66, w, h * .34);
    const horizon = h * .66, cx = w / 2 - camera.x * 2;
    ctx.strokeStyle = 'rgba(45,58,50,.24)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * 28, horizon); ctx.lineTo(cx + i * 100, h); ctx.stroke();
    }
    for (let i = 1; i <= 8; i++) {
      const y = horizon + (h - horizon) * (i / 9) ** 1.7;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    const blocks = [
      {x:-130,y:0,w:85,h:64,c:'#c8c4b8'}, {x:-37,y:-28,w:68,h:92,c:'#b9b5aa'},
      {x:43,y:8,w:112,h:56,c:'#d2c8b3'}, {x:166,y:-20,w:72,h:84,c:'#c2c2b7'}
    ];
    blocks.forEach(b => {
      const x = cx + b.x, y = horizon - 20 + b.y;
      ctx.fillStyle = b.c; ctx.fillRect(x, y, b.w, b.h);
      ctx.fillStyle = 'rgba(40,45,45,.18)'; ctx.fillRect(x, y, b.w, 5);
      ctx.strokeStyle = 'rgba(35,40,40,.25)'; ctx.strokeRect(x, y, b.w, b.h);
    });
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(12, 12, 190, 43);
    ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText('ROBLOXINGTON · LOCAL SCENE', 22, 29);
    ctx.fillStyle = '#d7e4e8'; ctx.font = '11px Arial'; ctx.fillText(started ? `Player: ${nameInput.value.trim() || 'Guest'}` : 'Preview paused', 22, 45);
    coords.textContent = `Camera: ${camera.x.toFixed(1)}, 6, ${camera.z.toFixed(1)}`;
  }

  document.querySelector('#previewButton').addEventListener('click', () => {
    started = true;
    state.textContent = `Local preview running as ${nameInput.value.trim() || 'Guest'} (no server connection)`;
    draw();
  });
  nameInput.addEventListener('input', draw);
  window.addEventListener('keydown', event => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(event.key)) {
      if (document.activeElement !== nameInput) event.preventDefault();
      keys.add(event.key.toLowerCase());
    }
  });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  function tick() {
    if (started) {
      if (keys.has('a') || keys.has('arrowleft')) camera.x -= .12;
      if (keys.has('d') || keys.has('arrowright')) camera.x += .12;
      if (keys.has('w') || keys.has('arrowup')) camera.z -= .12;
      if (keys.has('s') || keys.has('arrowdown')) camera.z += .12;
      draw();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize(); tick();
})();

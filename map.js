/* map.js — Stadium Heatmap Canvas */
const MAP = {
  zones: [
    { id:'north', label:'North Stand', cx:.5, cy:.12, rx:.35, ry:.08, crowd:.96, color:null },
    { id:'south', label:'South Stand', cx:.5, cy:.88, rx:.35, ry:.08, crowd:.72, color:null },
    { id:'east',  label:'East Stand',  cx:.9, cy:.5,  rx:.08, ry:.3,  crowd:.45, color:null },
    { id:'west',  label:'West Stand',  cx:.1, cy:.5,  rx:.08, ry:.3,  crowd:.61, color:null },
    { id:'field', label:'Field',       cx:.5, cy:.5,  rx:.28, ry:.22, crowd:0,   color:'#0f1b0f' },
  ],
  gates: [
    { id:'g1', label:'Gate 1', x:.5, y:.02, crowd:.95 },
    { id:'g2', label:'Gate 2', x:.5, y:.98, crowd:.55 },
    { id:'g3', label:'Gate 3', x:.02, y:.5, crowd:.60 },
    { id:'g4', label:'Gate 4', x:.98, y:.5, crowd:.15 },
  ],
  pois: [
    { label:'🍔 A', x:.25, y:.2 },
    { label:'🍕 B', x:.75, y:.2 },
    { label:'🍺 C', x:.75, y:.8 },
    { label:'🚻 A', x:.2, y:.7 },
    { label:'🚻 B', x:.8, y:.3 },
    { label:'🚻 D', x:.3, y:.85 },
  ],
  route: [
    { x:.55, y:.55 }, { x:.65, y:.50 }, { x:.75, y:.45 }, { x:.85, y:.45 }, { x:.92, y:.48 }, { x:.98, y:.5 },
  ],
  seat: { x:.55, y:.55, label:'S-14' },
  showHeatmap: true,
};

function crowdColor(v) {
  if (v <= 0) return null;
  if (v < .4) return 'rgba(34,197,94,';
  if (v < .7) return 'rgba(245,158,11,';
  return 'rgba(239,68,68,';
}

function drawStadium(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  ctx.clearRect(0,0,W,H);
  // BG
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,.03)';
  ctx.lineWidth = 1;
  for (let i=0; i<W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,H); ctx.stroke(); }
  for (let i=0; i<H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(W,i); ctx.stroke(); }

  // Zones
  MAP.zones.forEach(z => {
    ctx.beginPath();
    ctx.ellipse(z.cx*W, z.cy*H, z.rx*W, z.ry*H, 0, 0, Math.PI*2);
    if (z.id === 'field') {
      ctx.fillStyle = '#0a1a0a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34,197,94,.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // field lines
      ctx.strokeStyle = 'rgba(34,197,94,.15)';
      ctx.beginPath(); ctx.ellipse(z.cx*W, z.cy*H, z.rx*W*.4, z.ry*H*.4, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(z.cx*W, (z.cy-z.ry)*H); ctx.lineTo(z.cx*W, (z.cy+z.ry)*H); ctx.stroke();
    } else if (MAP.showHeatmap) {
      const c = crowdColor(z.crowd);
      if (c) {
        const g = ctx.createRadialGradient(z.cx*W, z.cy*H, 0, z.cx*W, z.cy*H, Math.max(z.rx*W, z.ry*H));
        g.addColorStop(0, c + '0.5)');
        g.addColorStop(1, c + '0.05)');
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.03)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.stroke();
    }
    // Label
    if (z.id !== 'field') {
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.font = '600 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, z.cx*W, z.cy*H + 4);
    }
  });

  // Gates
  MAP.gates.forEach(g => {
    const gx = g.x*W, gy = g.y*H;
    ctx.beginPath();
    ctx.arc(gx, gy, 14, 0, Math.PI*2);
    const c = g.crowd > .7 ? '#ef4444' : g.crowd > .4 ? '#f59e0b' : '#22c55e';
    ctx.fillStyle = c;
    ctx.globalAlpha = .8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = '700 9px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.label, gx, gy);
  });

  // POIs
  MAP.pois.forEach(p => {
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, p.x*W, p.y*H);
  });

  // Route
  if (MAP.route.length > 1) {
    ctx.beginPath();
    ctx.moveTo(MAP.route[0].x*W, MAP.route[0].y*H);
    for (let i=1; i<MAP.route.length; i++) ctx.lineTo(MAP.route[i].x*W, MAP.route[i].y*H);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([8,6]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrow at end
    const last = MAP.route[MAP.route.length-1];
    ctx.beginPath();
    ctx.arc(last.x*W, last.y*H, 6, 0, Math.PI*2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
  }

  // Seat marker
  const s = MAP.seat;
  ctx.beginPath();
  ctx.arc(s.x*W, s.y*H, 8, 0, Math.PI*2);
  ctx.fillStyle = '#7c3aed';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '700 8px Outfit';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOU', s.x*W, s.y*H);
}

function initMap() {
  const c = document.getElementById('stadiumCanvas');
  if (!c) return;
  const draw = () => drawStadium(c);
  draw();
  window.addEventListener('resize', draw);

  document.getElementById('toggle-heatmap-btn')?.addEventListener('click', () => {
    MAP.showHeatmap = !MAP.showHeatmap;
    draw();
  });
  document.getElementById('reroute-btn')?.addEventListener('click', () => {
    // Randomize route slightly
    MAP.route.forEach(p => { p.x += (Math.random()-.5)*.04; p.y += (Math.random()-.5)*.04; });
    draw();
    showToast('Route recalculated!');
  });
}

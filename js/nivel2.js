window.Nivel2 = (function () {
  'use strict';

  let _initialized = false;

  function init() {
    if (_initialized) return;

    const btn = document.getElementById('btn-dibujar-mapa');
    const canvas = document.getElementById('mapa-canvas');
    const result = document.getElementById('resultado-nivel2');

    if (!btn || !canvas || !result) return;

    _initialized = true;

    btn.classList.remove('d-none');
    canvas.classList.remove('d-none');

    btn.addEventListener('click', () => {
      if (!window.AppController || !window.AppController.state.completed.has(1)) {
        if (window.AppController) {
          window.AppController.showToast('Completa el Nivel 1 primero.', 'error');
        }
        return;
      }

      if (window.AppController.state.completed.has(2)) return;

      btn.disabled = true;

      result.innerHTML = `
        <p class="data-label">
          <span class="data-value">&#x25B6;</span> Renderizando mapa...
        </p>
      `;

      drawMap(canvas, result);
    });
  }

  function drawMap(canvas, resultEl) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width || 300;
    const h = canvas.height || 150;

    ctx.clearRect(0, 0, w, h);

    drawGrid(ctx, w, h);
    drawCityBlocks(ctx);
    drawMainStreets(ctx, w, h);
    drawRadarBorder(ctx, w, h);

    const marker = getMarkerPosition(w, h);

    drawMarkerPulse(ctx, marker.x, marker.y);
    drawOperatorMarker(ctx, marker.x, marker.y);
    drawCrosshair(ctx, marker.x, marker.y);
    drawMapLabels(ctx, w, h, marker.x, marker.y);

    resultEl.innerHTML = `
      <p class="data-label data-success mt-2">
        <i class="bi bi-check-circle-fill"></i> Mapa renderizado.
      </p>
      <p class="data-label">
        <span class="data-value">POS:</span> (${marker.x.toFixed(0)}, ${marker.y.toFixed(0)}) px
      </p>
    `;

    if (window.AppController) {
      window.AppController.onCanvasDone();
    }
  }

  function drawGrid(ctx, w, h) {
    ctx.strokeStyle = '#0e2030';
    ctx.lineWidth = 1;

    for (let x = 0; x <= w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = 0; y <= h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawCityBlocks(ctx) {
    const blocks = [
      { x: 20, y: 20, w: 50, h: 35 },
      { x: 90, y: 20, w: 40, h: 25 },
      { x: 150, y: 15, w: 60, h: 40 },
      { x: 20, y: 80, w: 35, h: 50 },
      { x: 75, y: 75, w: 55, h: 35 },
      { x: 155, y: 80, w: 45, h: 40 },
      { x: 220, y: 30, w: 30, h: 60 }
    ];

    blocks.forEach((block) => {
      ctx.fillStyle = '#0a2535';
      ctx.strokeStyle = '#1a3a50';
      ctx.lineWidth = 1;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.strokeRect(block.x, block.y, block.w, block.h);
    });
  }

  function drawMainStreets(ctx, w, h) {
    ctx.strokeStyle = '#0d4060';
    ctx.lineWidth = 3;

    [65, 130].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    [70, 145, 215].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    });

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#1a5a70';
    ctx.lineWidth = 1;

    [65, 130].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  function drawRadarBorder(ctx, w, h) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#00f5ff22';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function getMarkerPosition(w, h) {
    const coords = window.AppController.state.geoCoords;

    let x = w / 2;
    let y = h / 2;

    if (coords) {
      const normLat = ((coords.lat % 1) + 1) % 1;
      const normLon = ((coords.lon % 1) + 1) % 1;

      x = 20 + normLon * (w - 40);
      y = 20 + normLat * (h - 40);
    }

    return { x, y };
  }

  function drawMarkerPulse(ctx, x, y) {
    [24, 16, 8].forEach((radius, index) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 243, 255, ${0.1 + index * 0.12})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function drawOperatorMarker(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00f3ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawCrosshair(ctx, x, y) {
    ctx.strokeStyle = '#00f3ff88';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  function drawMapLabels(ctx, w, h, x, y) {
    ctx.fillStyle = '#00f3ff';
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.textAlign = 'left';

    const labelX = x + 8 > w - 50 ? x - 55 : x + 8;
    ctx.fillText('OPERADOR', labelX, y - 8);

    ctx.fillStyle = '#00f3ff44';
    ctx.font = '7px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SMART CITY GRID', w - 5, h - 5);
  }

  return { init };
})();
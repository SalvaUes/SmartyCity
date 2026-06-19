window.Nivel3 = (function () {
  'use strict';

  let _initialized = false;
  let _stream = null;

  function init() {
    if (_initialized) return;

    const uiContainer = document.getElementById('ui-nivel3');
    const btnAccion = document.getElementById('btn-capturar-foto');
    const video = document.getElementById('webcam-video');
    const canvas = document.getElementById('foto-canvas');
    const result = document.getElementById('resultado-nivel3');

    if (!uiContainer || !btnAccion || !video || !canvas || !result) return;

    _initialized = true;

    uiContainer.classList.remove('d-none');
    canvas.classList.add('d-none');
    video.classList.add('d-none');

    btnAccion.textContent = 'Encender Cámara';

    btnAccion.addEventListener('click', () => {
      if (!window.AppController || !window.AppController.state.completed.has(2)) {
        if (window.AppController) {
          window.AppController.showToast('Completa el Nivel 2 primero.', 'error');
        }
        return;
      }

      if (window.AppController.state.completed.has(3)) return;

      if (!_stream) {
        startCamera(btnAccion, video, result);
      } else {
        takePhoto(btnAccion, video, canvas, result);
      }
    });
  }

  async function startCamera(btn, video, result) {
    btn.disabled = true;

    result.innerHTML = `
      <p class="data-label">
        <span class="data-value">&#x25B6;</span> Solicitando acceso a la cámara...
      </p>
    `;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError(result, 'La cámara no está soportada en este navegador.');
      btn.disabled = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: 320,
          height: 240
        },
        audio: false
      });

      _stream = stream;
      video.srcObject = stream;

      video.classList.remove('d-none');
      canvas.classList.add('d-none');

      result.innerHTML = `
        <p class="data-label data-success">
          <i class="bi bi-camera-video-fill"></i> Cámara activa. Listo para capturar.
        </p>
      `;

      btn.textContent = 'Tomar Foto';
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-outline-info');
      btn.disabled = false;

    } catch (err) {
      btn.disabled = false;

      const msg = getCameraErrorMessage(err);

      showError(result, msg);

      if (window.AppController) {
        window.AppController.showToast(msg, 'error');
      }
    }
  }

  function takePhoto(btn, video, canvas, result) {
    if (!_stream) return;

    const width = video.videoWidth || 320;
    const height = video.videoHeight || 240;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    drawPhoto(ctx, video, width, height);

    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    savePhoto(base64);

    canvas.classList.remove('d-none');
    video.classList.add('d-none');
    btn.classList.add('d-none');

    stopCamera();

    result.innerHTML = `
      <p class="data-label data-success mt-2">
        <i class="bi bi-check-circle-fill"></i> ¡Evidencia capturada!
      </p>
      <p class="data-label">
        <span class="data-value">RES:</span> ${width} × ${height} px
      </p>
      <p class="data-label">
        <span class="data-value">FMT:</span> JPEG · Base64
      </p>
    `;

    if (window.AppController) {
      window.AppController.onPhotoCaptured();
    }
  }

  function drawPhoto(ctx, video, width, height) {
    ctx.drawImage(video, 0, 0, width, height);

    ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    const timestamp = new Date().toLocaleString('es-ES');

    ctx.fillStyle = '#00f3ff';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillText(`CAPTURA: ${timestamp}`, 10, height - 8);
  }

  function savePhoto(base64) {
    try {
      localStorage.setItem('nivel3_snapshot', base64);
    } catch (error) {
      if (window.AppController) {
        window.AppController.showToast('La fotografía fue capturada, pero no pudo guardarse en LocalStorage.', 'error');
      }
    }
  }

  function stopCamera() {
    if (!_stream) return;

    _stream.getTracks().forEach((track) => track.stop());
    _stream = null;
  }

  function getCameraErrorMessage(error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Permiso de cámara denegado. Permite el acceso en tu navegador.';
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No se encontró ninguna cámara conectada.';
    }

    if (error.name === 'NotReadableError') {
      return 'La cámara está siendo usada por otra aplicación.';
    }

    return 'Error al acceder a la cámara: ' + error.message;
  }

  function showError(el, msg) {
    el.innerHTML = `
      <p class="data-label data-error">
        <i class="bi bi-exclamation-triangle-fill"></i> ${msg}
      </p>
    `;
  }

  return { init };
})();
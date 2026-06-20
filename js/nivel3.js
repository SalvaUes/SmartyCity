
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

    if (!uiContainer || !btnAccion || !video || !canvas) return;

  
    let result = document.getElementById('resultado-nivel3');
    if (!result) {
      result = document.createElement('div');
      result.id = 'resultado-nivel3';
      result.className = 'mt-3 terminal-box text-secondary p-2';
      result.style.fontSize = '0.8rem';
      uiContainer.appendChild(result);
    }

    _initialized = true;


    uiContainer.classList.remove('d-none');
    

    canvas.style.display = 'none';


    btnAccion.textContent = 'Encender Cámara';

    btnAccion.addEventListener('click', () => {

      if (!window.AppController || !window.AppController.state.completed.has(2)) {
        if (window.AppController) window.AppController.showToast('Completa el Nivel 2 primero.', 'error');
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
    result.innerHTML = '<p class="data-label"><span class="data-value">&#x25B6;</span> Solicitando acceso a la cámara...</p>';

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showError(result, 'La cámara no está soportada en este navegador.');
      btn.disabled = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
        audio: false
      });

      _stream = stream;
      video.srcObject = stream;
      video.style.display = 'block';

      result.innerHTML = '<p class="data-label data-success"><i class="bi bi-camera-video-fill"></i> Cámara activa. Listo para capturar.</p>';
      

      btn.textContent = 'Tomar Foto';
      btn.classList.replace('btn-outline-secondary', 'btn-outline-info');
      btn.disabled = false;

    } catch (err) {
      btn.disabled = false;
      let msg = 'Error al acceder a la cámara: ' + err.message;
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Permiso de cámara denegado. Permite el acceso en tu navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No se encontró ninguna cámara conectada.';
      } else if (err.name === 'NotReadableError') {
        msg = 'La cámara está siendo usada por otra aplicación.';
      }
      
      showError(result, msg);
      if (window.AppController) window.AppController.showToast(msg, 'error');
    }
  }

  function takePhoto(btn, video, canvas, result) {
    if (!_stream) return;

    // Obtener dimensiones reales del video
    const w = video.videoWidth || 320;
    const h = video.videoHeight || 240;

    canvas.width = w;
    canvas.height = h;

    // Dibujar el fotograma del video en el canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    // Filtro estético Cyberpunk
    ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Sello de Marca de tiempo (Timestamp)
    const ts = new Date().toLocaleString('es-ES');
    ctx.fillStyle = '#00f3ff';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillText(`CAPTURA: ${ts}`, 10, h - 8);

    // Convertir a base64 para guardar
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    try {
      localStorage.setItem('nivel3_snapshot', base64);
    } catch (e) {
      
    }

    // Intercambiar visibilidad: Mostramos la foto estática (canvas) y ocultamos el video en vivo
    canvas.style.display = 'block';
    video.style.display = 'none';
    btn.style.display = 'none'; // El nivel ya terminó, quitamos el botón

    // Apagar el hardware de la cámara para no dejar la luz encendida
    _stream.getTracks().forEach(t => t.stop());
    _stream = null;

    result.innerHTML = `
      <p class="data-label data-success mt-2"><i class="bi bi-check-circle-fill"></i> ¡Evidencia capturada!</p>
      <p class="data-label"><span class="data-value">RES:</span> ${w} × ${h} px</p>
      <p class="data-label"><span class="data-value">FMT:</span> JPEG · Base64</p>
    `;

    // Notificamos a AppController para desbloquear el Nivel 4
    if (window.AppController) window.AppController.onPhotoCaptured();
  }

  function showError(el, msg) {
    el.innerHTML = `<p class="data-label data-error"><i class="bi bi-exclamation-triangle-fill"></i> ${msg}</p>`;
  }

  return { init };
})();
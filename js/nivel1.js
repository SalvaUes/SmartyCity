
window.Nivel1 = (function () {
  'use strict';

  let _initialized = false;

  const GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  };




  function init() {
    if (_initialized) return;

    const btn = document.getElementById('btn-ubicacion');
    const result = document.getElementById('resultado-nivel1');

    if (!btn || !result) return;
    
    _initialized = true;

    btn.addEventListener('click', () => handleLocationRequest(btn, result));
  }



  function handleLocationRequest(btn, result) {
    if (!navigator.geolocation) {
      showError(result, 'La Geolocalización no está soportada en este navegador.');
      return;
    }

    btn.disabled = true;
    result.innerHTML = '<p class="data-label"><span class="data-value">&#x25B6;</span> Solicitando acceso GPS...</p>';

    navigator.geolocation.getCurrentPosition(
      (position) => handleSuccess(position, result),
      (error) => handleError(error, result, btn),
      GEO_OPTIONS
    );
  }




  function handleSuccess(position, result) {
    const { latitude: lat, longitude: lon, accuracy: acc } = position.coords;

    result.innerHTML = `
      <p class="data-label data-success">
        <i class="bi bi-check-circle-fill"></i> ¡Señal adquirida!
      </p>
      <p class="data-label"><span class="data-value">LAT:</span> ${lat.toFixed(6)}</p>
      <p class="data-label"><span class="data-value">LON:</span> ${lon.toFixed(6)}</p>
      <p class="data-label"><span class="data-value">ACC:</span> ±${Math.round(acc)} m</p>
    `;

    if (window.AppController) {
      window.AppController.onGeoSuccess({ lat, lon, accuracy: acc });
    }
  }





  function handleError(error, result, btn) {
    btn.disabled = false;
    let msg = 'Error desconocido al obtener la ubicación.';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        msg = 'Permiso denegado. Permite el acceso a la ubicación en tu navegador.';
        break;
      case error.POSITION_UNAVAILABLE:
        msg = 'Ubicación no disponible. Verifica tu conexión o GPS.';
        break;
      case error.TIMEOUT:
        msg = 'Tiempo de espera agotado. Intenta de nuevo.';
        break;
    }

    showError(result, msg);
    if (window.AppController) {
      window.AppController.showToast(msg, 'error');
    }
  }



  
  function showError(el, msg) {
    el.innerHTML = `<p class="data-label data-error"><i class="bi bi-exclamation-triangle-fill"></i> ${msg}</p>`;
  }

  return { init };
})();



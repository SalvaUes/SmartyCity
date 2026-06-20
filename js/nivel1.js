
window.Nivel1 = (function () {
  'use strict';

  let _initialized = false;

  const GEO_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  };

  // Referencias a los estados ya definidos en index.html (no se crea HTML aquí)
  let els = null;

  function getEls(result) {
    return {
      espera: result.querySelector('#n1-msg-espera'),
      validando: result.querySelector('#n1-msg-validando'),
      solicitando: result.querySelector('#n1-msg-solicitando'),
      exito: result.querySelector('#n1-resultado-exito'),
      lat: result.querySelector('#n1-lat'),
      lon: result.querySelector('#n1-lon'),
      acc: result.querySelector('#n1-acc'),
      error: result.querySelector('#n1-mensaje-error'),
      errorTexto: result.querySelector('#n1-error-texto')
    };
  }

  function ocultarTodos(e) {
    e.espera.classList.add('d-none');
    e.validando.classList.add('d-none');
    e.solicitando.classList.add('d-none');
    e.exito.classList.add('d-none');
    e.error.classList.add('d-none');
  }

  function init() {
    if (_initialized) return;

    const btn = document.getElementById('btn-ubicacion');
    const result = document.getElementById('resultado-nivel1');

    if (!btn || !result) return;

    els = getEls(result);
    _initialized = true;

    btn.addEventListener('click', () => handleLocationRequest(btn, result));
  }

  function handleLocationRequest(btn, result) {
    if (!navigator.geolocation) {
      showError('La Geolocalización no está soportada en este navegador.');
      return;
    }

    btn.disabled = true;
    ocultarTodos(els);
    els.validando.classList.remove('d-none');

    // Validación explícita del estado del permiso antes de solicitar la ubicación
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'denied') {
            btn.disabled = false;
            showError('Permiso denegado. Habilita la ubicación en la configuración del navegador.');
            if (window.AppController) {
              window.AppController.showToast('Permiso de ubicación denegado.', 'error');
            }
            return;
          }
          requestPosition(btn);
        })
        .catch(() => requestPosition(btn)); // Si el navegador no soporta la consulta, se sigue con el flujo normal
    } else {
      requestPosition(btn);
    }
  }

  function requestPosition(btn) {
    ocultarTodos(els);
    els.solicitando.classList.remove('d-none');

    navigator.geolocation.getCurrentPosition(
      (position) => handleSuccess(position),
      (error) => handleError(error, btn),
      GEO_OPTIONS
    );
  }

  function handleSuccess(position) {
    const { latitude: lat, longitude: lon, accuracy: acc } = position.coords;

    ocultarTodos(els);
    els.lat.textContent = lat.toFixed(6);
    els.lon.textContent = lon.toFixed(6);
    els.acc.textContent = `±${Math.round(acc)} m`;
    els.exito.classList.remove('d-none');

    if (window.AppController) {
      window.AppController.onGeoSuccess({ lat, lon, accuracy: acc });
    }
  }

  function handleError(error, btn) {
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

    showError(msg);
    if (window.AppController) {
      window.AppController.showToast(msg, 'error');
    }
  }

  function showError(msg) {
    ocultarTodos(els);
    els.errorTexto.textContent = msg;
    els.error.classList.remove('d-none');
  }

  return { init };
})();

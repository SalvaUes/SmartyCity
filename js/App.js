

(function () {
  "use strict";

  const DOM = {
    toast: "app-toast",
    toastBody: "toast-body",
    victoryScreen: "victory-screen",
    btnRestart: "btn-restart",
    level4: {
      btnWorker: "btn-iniciar-n4",
      progressWrap: "progreso-n4-container",
      progressBar: "progreso-n4",
      result: "resultado-nivel4"
    },
    level5: {
      btnWorker: "btn-iniciar-n5",
      btnDownload: "btn-descargar-json",
      progressWrap: "progreso-n5-container",
      progressBar: "progreso-n5",
      result: "resultado-nivel5"
    }
  };

  const state = {
    currentLevel: 1,
    completed: new Set(),
    geoCoords: null,
    workerResults: {},
  };

  let _toastInstance = null;




  function getToast() {
    const toastEl = document.getElementById(DOM.toast);
    if (!toastEl) return null;
    if (!_toastInstance && typeof bootstrap !== "undefined") {
      _toastInstance = new bootstrap.Toast(toastEl, { delay: 4000 });
    }
    return { el: toastEl, instance: _toastInstance };
  }





  function showToast(msg, type = "info") {
    const toast = getToast();
    if (!toast) return;
    const toastBody = document.getElementById(DOM.toastBody);
    if (toastBody) toastBody.textContent = msg;
    toast.el.classList.remove("toast-success", "toast-error");
    if (type === "success") toast.el.classList.add("toast-success");
    if (type === "error") toast.el.classList.add("toast-error");
    toast.instance.show();
  }



  window.AppController = {
    state,
    showToast,
    onGeoSuccess(coords) {
      state.geoCoords = coords;
      completeLevel(1);
    },
    onCanvasDone() {
      completeLevel(2);
    },
    onPhotoCaptured() {
      completeLevel(3);
    },
    onWorker4Done(results) {
      state.workerResults[4] = results;
      completeLevel(4);
    },
    onWorker5Done(results) {
      state.workerResults[5] = results;
      completeLevel(5);
    },
  };



  function completeLevel(n) {
    if (state.completed.has(n)) return;
    state.completed.add(n);
    setCardCompleted(n);
    updateTrackerDot(n, "done");

    if (n < 5) {
      unlockLevel(n + 1);
      showToast(`¡Nivel ${n} superado! Nivel ${n + 1} desbloqueado.`, "success");
    } else {
      showToast("¡Todos los niveles completados! Sistema restaurado.", "success");
      setTimeout(showVictory, 800);
    }
  }


  function unlockLevel(n) {
    state.currentLevel = n;
    const card = document.getElementById(`card-nivel${n}`); // ID Corregido
    const lockOverlay = document.getElementById(`overlay-n${n}`);

    if (card) {
      card.classList.remove("locked-card");
      card.classList.add("active-card", "unlocked");

      const opaqueElements = card.querySelectorAll(".opacity-25");
      opaqueElements.forEach(el => el.classList.remove("opacity-25"));

      const header = card.querySelector(".card-header");
 
      let badge = header.querySelector(".badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge bg-info text-dark mb-2 px-3 py-1";
        badge.textContent = "ACTIVO";
        header.prepend(badge); 
      }

      const icon = header.querySelector("i.bi");
      if (icon) {
        icon.classList.remove("text-secondary");
        icon.classList.add("text-info");
      }
    }
    
    if (lockOverlay) lockOverlay.style.display = "none";
    enableLevelControls(n);
  }





  function setCardCompleted(n) {
    const card = document.getElementById(`card-nivel${n}`); // ID Corregido
    
    if (card) {
      
      card.classList.remove("active-card", "locked-card", "unlocked");
      card.classList.add("completed-card");

      const header = card.querySelector(".card-header");
    
      const badge = header.querySelector(".badge");
      if (badge) {
        badge.className = "badge bg-success text-light mb-2 px-3 py-1";
        badge.textContent = "COMPLETADO";
      }

      const icon = header.querySelector("i.bi");
      if (icon) {
        icon.classList.remove("text-info", "text-secondary");
        icon.classList.add("text-success");
      }
    }
  }




  function updateTrackerDot(n, status) {
    const dot = document.getElementById(`dot-${n}`);
    if (!dot) return;
    dot.classList.remove("active", "done");
    if (status === "active") dot.classList.add("active");
    if (status === "done") dot.classList.add("done");
  }


  function enableLevelControls(n) {
    const selectors = {
      2: "#btn-dibujar-mapa",
      3: "#btn-capturar-foto",
      4: "#" + DOM.level4.btnWorker,
      5: "#" + DOM.level5.btnWorker,
    };
    if (selectors[n]) {
      const btn = document.querySelector(selectors[n]);
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("d-none"); 
      }
    }
  }



  function showVictory() {
    const vs = document.getElementById(DOM.victoryScreen);
    if (!vs) return;
    vs.style.display = "block";
    vs.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function initLevel4() {
    const btnWorker = document.getElementById(DOM.level4.btnWorker);
    if (!btnWorker) return;

    btnWorker.addEventListener("click", function () {
      if (state.completed.has(4)) return;
      btnWorker.disabled = true;

      const progressWrap = document.getElementById(DOM.level4.progressWrap);
      const progressBar = document.getElementById(DOM.level4.progressBar);
      const resultEl = document.getElementById(DOM.level4.result);

      if (!progressWrap || !progressBar || !resultEl) return;

      progressWrap.classList.remove("d-none");
      resultEl.classList.remove("d-none");
      
      progressBar.style.width = "15%";
      resultEl.innerHTML = '<p class="data-label">Generando 20,000 registros de sensores...</p>';

      setTimeout(() => {
        const sensorData = generateSensorData(20000);
        progressBar.style.width = "40%";
        resultEl.innerHTML = '<p class="data-label">Enviando datos al Worker...</p>';

        const worker = new Worker("js/worker-n4.js");
        let fakeProgress = 40;
        
        const progressInterval = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + 5, 90);
          progressBar.style.width = `${fakeProgress}%`;
        }, 200);

        worker.onmessage = function (e) {
          clearInterval(progressInterval);
          const r = e.data;
          
          if (r.error) {
            handleWorkerError(progressBar, resultEl, btnWorker, new Error(r.error), worker);
            return;
          }

          progressBar.style.width = "100%";
          progressBar.textContent = "¡Completado!";
          renderWorker4HTML(resultEl, r);

          worker.terminate();
          window.AppController.onWorker4Done(r);
        };

        worker.onerror = function (err) {
          clearInterval(progressInterval);
          handleWorkerError(progressBar, resultEl, btnWorker, err, worker);
        };

        worker.postMessage({ data: sensorData });
      }, 100);
    });
  }







  function renderWorker4HTML(container, r) {
    container.innerHTML = `
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-label">Temp Promedio</span><span class="stat-value">${r.tempAvg.toFixed(2)} °C</span></div>
        <div class="stat-item"><span class="stat-label">Temp Máx</span><span class="stat-value pink">${r.tempMax.toFixed(2)} °C</span></div>
        <div class="stat-item"><span class="stat-label">Temp Mín</span><span class="stat-value green">${r.tempMin.toFixed(2)} °C</span></div>
        <div class="stat-item"><span class="stat-label">Hum Promedio</span><span class="stat-value">${r.humAvg.toFixed(2)} %</span></div>
        <div class="stat-item"><span class="stat-label">Hum Máx</span><span class="stat-value pink">${r.humMax.toFixed(2)} %</span></div>
        <div class="stat-item"><span class="stat-label">Hum Mín</span><span class="stat-value green">${r.humMin.toFixed(2)} %</span></div>
      </div>
      <p class="data-label data-success mt-2"><i class="bi bi-check-circle-fill"></i> ${r.count.toLocaleString()} registros procesados</p>
    `;
  }

  function generateSensorData(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      temperatura: 15 + Math.random() * 30,
      humedad: 20 + Math.random() * 60,
    }));
  }

  function initLevel5() {
    const btnWorker = document.getElementById(DOM.level5.btnWorker);
    const btnDl = document.getElementById(DOM.level5.btnDownload);
    
    if (!btnWorker || !btnDl) return;
    let results5 = null;

    btnWorker.addEventListener("click", function () {
      if (state.completed.has(5)) return;
      btnWorker.disabled = true;

      const progressWrap = document.getElementById(DOM.level5.progressWrap);
      const progressBar = document.getElementById(DOM.level5.progressBar);
      const resultEl = document.getElementById(DOM.level5.result);

      if (!progressWrap || !progressBar || !resultEl) return;


      progressWrap.classList.remove("d-none");
      resultEl.classList.remove("d-none");

      progressBar.style.width = "5%";
      resultEl.innerHTML = '<p class="data-label">Generando 250,000 registros cuánticos...</p>';

      setTimeout(() => {
        const quantumData = generateQuantumData(250000);
        progressBar.style.width = "20%";
        resultEl.innerHTML = '<p class="data-label">Transfiriendo datos al Portal Cuántico...</p>';


        const worker = new Worker("js/worker-n5.js");
        let fakeProgress = 20;

        const progressInterval = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + 3, 88);
          progressBar.style.width = `${fakeProgress}%`;
        }, 300);

        worker.onmessage = function (e) {
          clearInterval(progressInterval);
          results5 = e.data;

          if (results5.error) {
            handleWorkerError(progressBar, resultEl, btnWorker, new Error(results5.error), worker);
            return;
          }

          progressBar.style.width = "100%";
          progressBar.textContent = "¡Portal Abierto!";
          renderWorker5HTML(resultEl, results5);

          btnDl.classList.remove("d-none");
          worker.terminate();
          window.AppController.onWorker5Done(results5);
        };

        worker.onerror = function (err) {
          clearInterval(progressInterval);
          handleWorkerError(progressBar, resultEl, btnWorker, err, worker);
        };

        worker.postMessage({ data: quantumData });
      }, 150);
    });

    btnDl.addEventListener("click", function () {
      if (!results5) return;
      downloadJSON(results5, "quantum_results.json");
    });
  }








  function renderWorker5HTML(container, r) {
    const top3Temp = r.top10Temps.slice(0, 3).map((x) => x.temperatura.toFixed(1)).join(" / ");
    const top3Press = r.top10Presiones.slice(0, 3).map((x) => x.presion.toFixed(1)).join(" / ");

    container.innerHTML = `
      <div class="stat-grid">
        <div class="stat-item"><span class="stat-label">Registros Válidos</span><span class="stat-value yellow">${r.validCount.toLocaleString()}</span></div>
        <div class="stat-item"><span class="stat-label">Descartados</span><span class="stat-value pink">${r.discardedCount.toLocaleString()}</span></div>
        <div class="stat-item"><span class="stat-label">Temp Promedio</span><span class="stat-value">${r.tempAvg.toFixed(2)} °C</span></div>
        <div class="stat-item"><span class="stat-label">Hum Promedio</span><span class="stat-value">${r.humAvg.toFixed(2)} %</span></div>
        <div class="stat-item" style="grid-column: span 2;"><span class="stat-label">Top 3 Temps (°C)</span><span class="stat-value pink">${top3Temp}</span></div>
        <div class="stat-item" style="grid-column: span 2;"><span class="stat-label">Top 3 Presiones (hPa)</span><span class="stat-value yellow">${top3Press}</span></div>
      </div>
      <p class="data-label data-success mt-2"><i class="bi bi-check-circle-fill"></i> Análisis cuántico completado.</p>
    `;
  }





  
  function generateQuantumData(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      temperatura: (Math.random() < 0.15 ? -1 : 1) * (15 + Math.random() * 40),
      humedad: (Math.random() < 0.15 ? -1 : 1) * (20 + Math.random() * 60),
      presion: (Math.random() < 0.15 ? -1 : 1) * (950 + Math.random() * 100),
    }));
  }

  function handleWorkerError(progressBar, resultEl, btn, err, worker) {
    progressBar.classList.remove("bg-warning", "bg-success");
    progressBar.style.backgroundColor = "#e83e8c"; // cyber-pink
    progressBar.style.width = "100%";
    progressBar.textContent = "Error de Procesamiento";
    resultEl.innerHTML = `<p class="data-label" style="color:#e83e8c;"><i class="bi bi-x-octagon-fill"></i> Error: ${err.message}</p>`;
    btn.disabled = false;
    if (worker) worker.terminate();
  }

  function downloadJSON(data, filename) {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast("Error generando descarga", "error");
    }
  }

  function initRestart() {
    const btn = document.getElementById(DOM.btnRestart);
    if (btn) btn.addEventListener("click", () => location.reload());
  }

  function initApp() {
    updateTrackerDot(1, "active");
    if (window.Nivel1 && typeof window.Nivel1.init === "function") window.Nivel1.init();
    if (window.Nivel2 && typeof window.Nivel2.init === "function") window.Nivel2.init();
    if (window.Nivel3 && typeof window.Nivel3.init === "function") window.Nivel3.init();
    initLevel4();
    initLevel5();
    initRestart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
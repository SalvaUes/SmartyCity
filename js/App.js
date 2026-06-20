

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
    const card = document.getElementById(`card-nivel${n}`);
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

    if (lockOverlay) lockOverlay.classList.add("d-none");
    enableLevelControls(n);
  }





  function setCardCompleted(n) {
    const card = document.getElementById(`card-nivel${n}`);

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
    vs.classList.remove("d-none");
    vs.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ---- NIVEL 4 ----

  function getLevel4Els() {
    const result = document.getElementById(DOM.level4.result);
    return {
      result,
      progressWrap: document.getElementById(DOM.level4.progressWrap),
      progressBar: document.getElementById(DOM.level4.progressBar),
      msgGenerando: result.querySelector("#n4-msg-generando"),
      msgEnviando: result.querySelector("#n4-msg-enviando"),
      stats: result.querySelector("#n4-resultado-stats"),
      tempAvg: result.querySelector("#n4-temp-avg"),
      tempMax: result.querySelector("#n4-temp-max"),
      tempMin: result.querySelector("#n4-temp-min"),
      humAvg: result.querySelector("#n4-hum-avg"),
      humMax: result.querySelector("#n4-hum-max"),
      humMin: result.querySelector("#n4-hum-min"),
      count: result.querySelector("#n4-count"),
      error: result.querySelector("#n4-mensaje-error"),
      errorTexto: result.querySelector("#n4-error-texto"),
    };
  }

  function ocultarEstadosNivel4(e) {
    e.msgGenerando.classList.add("d-none");
    e.msgEnviando.classList.add("d-none");
    e.stats.classList.add("d-none");
    e.error.classList.add("d-none");
  }

  function initLevel4() {
    const btnWorker = document.getElementById(DOM.level4.btnWorker);
    if (!btnWorker) return;
    const e = getLevel4Els();
    if (!e.progressWrap || !e.progressBar || !e.result) return;

    btnWorker.addEventListener("click", function () {
      if (state.completed.has(4)) return;
      btnWorker.disabled = true;

      e.progressWrap.classList.remove("d-none");
      e.result.classList.remove("d-none");
      e.progressBar.classList.remove("progress-bar-error");

      e.progressBar.style.width = "15%";
      ocultarEstadosNivel4(e);
      e.msgGenerando.classList.remove("d-none");

      setTimeout(() => {
        const sensorData = generateSensorData(20000);
        e.progressBar.style.width = "40%";
        ocultarEstadosNivel4(e);
        e.msgEnviando.classList.remove("d-none");

        const worker = new Worker("js/worker-n4.js");
        let fakeProgress = 40;

        const progressInterval = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + 5, 90);
          e.progressBar.style.width = `${fakeProgress}%`;
        }, 200);

        worker.onmessage = function (ev) {
          clearInterval(progressInterval);
          const r = ev.data;

          if (r.error) {
            handleWorkerError(e.progressBar, e, "n4", btnWorker, new Error(r.error), worker);
            return;
          }

          e.progressBar.style.width = "100%";
          e.progressBar.textContent = "¡Completado!";
          renderWorker4Stats(e, r);

          worker.terminate();
          window.AppController.onWorker4Done(r);
        };

        worker.onerror = function (err) {
          clearInterval(progressInterval);
          handleWorkerError(e.progressBar, e, "n4", btnWorker, err, worker);
        };

        worker.postMessage({ data: sensorData });
      }, 100);
    });
  }

  function renderWorker4Stats(e, r) {
    ocultarEstadosNivel4(e);
    e.tempAvg.textContent = `${r.tempAvg.toFixed(2)} °C`;
    e.tempMax.textContent = `${r.tempMax.toFixed(2)} °C`;
    e.tempMin.textContent = `${r.tempMin.toFixed(2)} °C`;
    e.humAvg.textContent = `${r.humAvg.toFixed(2)} %`;
    e.humMax.textContent = `${r.humMax.toFixed(2)} %`;
    e.humMin.textContent = `${r.humMin.toFixed(2)} %`;
    e.count.textContent = r.count.toLocaleString();
    e.stats.classList.remove("d-none");
  }

  function generateSensorData(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      temperatura: 15 + Math.random() * 30,
      humedad: 20 + Math.random() * 60,
    }));
  }

  // ---- NIVEL 5 ----

  function getLevel5Els() {
    const result = document.getElementById(DOM.level5.result);
    return {
      result,
      progressWrap: document.getElementById(DOM.level5.progressWrap),
      progressBar: document.getElementById(DOM.level5.progressBar),
      msgGenerando: result.querySelector("#n5-msg-generando"),
      msgTransfiriendo: result.querySelector("#n5-msg-transfiriendo"),
      stats: result.querySelector("#n5-resultado-stats"),
      validCount: result.querySelector("#n5-valid-count"),
      discardedCount: result.querySelector("#n5-discarded-count"),
      tempAvg: result.querySelector("#n5-temp-avg"),
      humAvg: result.querySelector("#n5-hum-avg"),
      top3Temp: result.querySelector("#n5-top3-temp"),
      top3Press: result.querySelector("#n5-top3-press"),
      error: result.querySelector("#n5-mensaje-error"),
      errorTexto: result.querySelector("#n5-error-texto"),
    };
  }

  function ocultarEstadosNivel5(e) {
    e.msgGenerando.classList.add("d-none");
    e.msgTransfiriendo.classList.add("d-none");
    e.stats.classList.add("d-none");
    e.error.classList.add("d-none");
  }

  function initLevel5() {
    const btnWorker = document.getElementById(DOM.level5.btnWorker);
    const btnDl = document.getElementById(DOM.level5.btnDownload);

    if (!btnWorker || !btnDl) return;
    const e = getLevel5Els();
    if (!e.progressWrap || !e.progressBar || !e.result) return;
    let results5 = null;

    btnWorker.addEventListener("click", function () {
      if (state.completed.has(5)) return;
      btnWorker.disabled = true;

      e.progressWrap.classList.remove("d-none");
      e.result.classList.remove("d-none");
      e.progressBar.classList.remove("progress-bar-error");

      e.progressBar.style.width = "5%";
      ocultarEstadosNivel5(e);
      e.msgGenerando.classList.remove("d-none");

      setTimeout(() => {
        const quantumData = generateQuantumData(250000);
        e.progressBar.style.width = "20%";
        ocultarEstadosNivel5(e);
        e.msgTransfiriendo.classList.remove("d-none");

        const worker = new Worker("js/worker-n5.js");
        let fakeProgress = 20;

        const progressInterval = setInterval(() => {
          fakeProgress = Math.min(fakeProgress + 3, 88);
          e.progressBar.style.width = `${fakeProgress}%`;
        }, 300);

        worker.onmessage = function (ev) {
          clearInterval(progressInterval);
          results5 = ev.data;

          if (results5.error) {
            handleWorkerError(e.progressBar, e, "n5", btnWorker, new Error(results5.error), worker);
            return;
          }

          e.progressBar.style.width = "100%";
          e.progressBar.textContent = "¡Portal Abierto!";
          renderWorker5Stats(e, results5);

          btnDl.classList.remove("d-none");
          worker.terminate();
          window.AppController.onWorker5Done(results5);
        };

        worker.onerror = function (err) {
          clearInterval(progressInterval);
          handleWorkerError(e.progressBar, e, "n5", btnWorker, err, worker);
        };

        worker.postMessage({ data: quantumData });
      }, 150);
    });

    btnDl.addEventListener("click", function () {
      if (!results5) return;
      downloadJSON(results5, "quantum_results.json");
    });
  }

  function renderWorker5Stats(e, r) {
    const top3Temp = r.top10Temps.slice(0, 3).map((x) => x.temperatura.toFixed(1)).join(" / ");
    const top3Press = r.top10Presiones.slice(0, 3).map((x) => x.presion.toFixed(1)).join(" / ");

    ocultarEstadosNivel5(e);
    e.validCount.textContent = r.validCount.toLocaleString();
    e.discardedCount.textContent = r.discardedCount.toLocaleString();
    e.tempAvg.textContent = `${r.tempAvg.toFixed(2)} °C`;
    e.humAvg.textContent = `${r.humAvg.toFixed(2)} %`;
    e.top3Temp.textContent = top3Temp;
    e.top3Press.textContent = top3Press;
    e.stats.classList.remove("d-none");
  }

  function generateQuantumData(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      temperatura: (Math.random() < 0.15 ? -1 : 1) * (15 + Math.random() * 40),
      humedad: (Math.random() < 0.15 ? -1 : 1) * (20 + Math.random() * 60),
      presion: (Math.random() < 0.15 ? -1 : 1) * (950 + Math.random() * 100),
    }));
  }

  function handleWorkerError(progressBar, e, prefix, btn, err, worker) {
    progressBar.classList.remove("bg-warning", "bg-success");
    progressBar.classList.add("progress-bar-error");
    progressBar.style.width = "100%";
    progressBar.textContent = "Error de Procesamiento";

    if (prefix === "n4") ocultarEstadosNivel4(e); else ocultarEstadosNivel5(e);
    e.errorTexto.textContent = err.message;
    e.error.classList.remove("d-none");

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
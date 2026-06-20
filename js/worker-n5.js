
self.onmessage = function (e) {
  try {
    const data = e.data.data;
    if (!data || !Array.isArray(data)) {
      throw new Error('Carga de datos inválida en Nivel 5.');
    }

    const totalRecords = data.length;
    const valid = [];

    // Filtrar valores negativos
    for (let i = 0; i < totalRecords; i++) {
      const rec = data[i];
      if (rec.temperatura >= 0 && rec.humedad >= 0 && rec.presion >= 0) {
        valid.push(rec);
      }
    }

    const validCount = valid.length;
    const discardedCount = totalRecords - validCount;

    if (validCount === 0) {
      self.postMessage({
        validCount: 0,
        discardedCount,
        tempAvg: 0, humAvg: 0, presionAvg: 0,
        top10Temps: [], top10Presiones: [],
      });
      return;
    }

    let tempSum = 0, humSum = 0, presionSum = 0;

    for (let j = 0; j < validCount; j++) {
      tempSum += valid[j].temperatura;
      humSum += valid[j].humedad;
      presionSum += valid[j].presion;
    }

    // Ordenamiento eficiente para los Top 10
    const top10Temps = [...valid].sort((a, b) => b.temperatura - a.temperatura).slice(0, 10);
    const top10Presiones = [...valid].sort((a, b) => b.presion - a.presion).slice(0, 10);

    self.postMessage({
      validCount,
      discardedCount,
      tempAvg: tempSum / validCount,
      humAvg: humSum / validCount,
      presionAvg: presionSum / validCount,
      top10Temps,
      top10Presiones,
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
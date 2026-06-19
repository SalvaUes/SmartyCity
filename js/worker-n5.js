
self.onmessage = function (e) {
  try {
    const data = e.data.data;
 
    if (!data || !Array.isArray(data)) {
      throw new Error('Carga de datos inválida en Nivel 5.');
    }
 
    const totalRecords = data.length;
    const valid = [];
    let discardedTemp = 0, discardedHum = 0, discardedPres = 0;
 
    // Filtrar valores negativos 
    for (let i = 0; i < totalRecords; i++) {
      const rec = data[i];
      const badTemp = rec.temperatura < 0;
      const badHum  = rec.humedad    < 0;
      const badPres = rec.presion    < 0;
 
      if (badTemp || badHum || badPres) {
        // Conteo detallado por sensor, no lo usa App.js pero queda disponible
        if (badTemp) discardedTemp++;
        if (badHum)  discardedHum++;
        if (badPres) discardedPres++;
      } else {
        valid.push(rec);
      }
    }
 
    const validCount     = valid.length;
    const discardedCount = totalRecords - validCount;
 
    if (validCount === 0) {
      self.postMessage({
        // Campos originales
        validCount: 0,
        discardedCount,
        tempAvg: 0, humAvg: 0, presionAvg: 0,
        top10Temps: [], top10Presiones: [],
        // Campos nuevos
        anomalyRate: 100,
        sensorBreakdown: { temp: discardedTemp, hum: discardedHum, pres: discardedPres },
        presionAvgValid: 0
      });
      return;
    }
 
    let tempSum = 0, humSum = 0, presionSum = 0;
 
    for (let j = 0; j < validCount; j++) {
      tempSum    += valid[j].temperatura;
      humSum     += valid[j].humedad;
      presionSum += valid[j].presion;
    }
 
    // Top 10 — igual que antes (App.js los consume igual)
    const top10Temps     = [...valid].sort((a, b) => b.temperatura - a.temperatura).slice(0, 10);
    const top10Presiones = [...valid].sort((a, b) => b.presion     - a.presion    ).slice(0, 10);
 
    self.postMessage({
      //  App.js los usa igual)
      validCount,
      discardedCount,
      tempAvg:    tempSum    / validCount,
      humAvg:     humSum     / validCount,
      presionAvg: presionSum / validCount,
      top10Temps,
      top10Presiones,
 
      //no los usa App.js
      anomalyRate: parseFloat(((discardedCount / totalRecords) * 100).toFixed(2)),
      sensorBreakdown: {
        temp: discardedTemp,
        hum:  discardedHum,
        pres: discardedPres
      },
      presionAvgValid: presionSum / validCount
    });
 
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
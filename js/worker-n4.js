
self.onmessage = function (e) {
  try {
    const data = e.data.data;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Carga de datos inválida o vacía en Nivel 4.');
    }

    const count = data.length;
    let tempSum = 0, tempMax = -Infinity, tempMin = Infinity;
    let humSum  = 0, humMax  = -Infinity, humMin  = Infinity;

    for (let i = 0; i < count; i++) {
      const t = data[i].temperatura;
      const h = data[i].humedad;

      tempSum += t;
      if (t > tempMax) tempMax = t;
      if (t < tempMin) tempMin = t;

      humSum += h;
      if (h > humMax) humMax = h;
      if (h < humMin) humMin = h;
    }

    self.postMessage({
      count,
      tempAvg: tempSum / count,
      tempMax,
      tempMin,
      humAvg: humSum / count,
      humMax,
      humMin,
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
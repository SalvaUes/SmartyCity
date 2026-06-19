
self.onmessage = function (e) {
  try {
    const data = e.data.data;
 
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Carga de datos inválida o vacía en Nivel 4.');
    }
 
    const count = data.length;
    let tempSum = 0, tempMax = -Infinity, tempMin = Infinity;
    let humSum  = 0, humMax  = -Infinity, humMin  = Infinity;
 
    // Histogramas por rangos de 5 en 5 grados / puntos porcentuales
    // Temperatura: rangos de 5 °C entre 15 y 45
    const tempBuckets = [0, 0, 0, 0, 0, 0]; // [15-20, 20-25, 25-30, 30-35, 35-40, 40-45]
    // Humedad: rangos de 10% entre 20 y 80
    const humBuckets  = [0, 0, 0, 0, 0, 0]; // [20-30, 30-40, 40-50, 50-60, 60-70, 70-80]
 
    for (let i = 0; i < count; i++) {
      const t = data[i].temperatura;
      const h = data[i].humedad;
 
      // Estadísticas base 
      tempSum += t;
      if (t > tempMax) tempMax = t;
      if (t < tempMin) tempMin = t;
 
      humSum += h;
      if (h > humMax) humMax = h;
      if (h < humMin) humMin = h;
 
      // Histograma temperatura (rangos de 5 °C desde 15)
      const tBucket = Math.min(Math.floor((t - 15) / 5), 5);
      if (tBucket >= 0) tempBuckets[tBucket]++;
 
      // Histograma humedad (rangos de 10% desde 20)
      const hBucket = Math.min(Math.floor((h - 20) / 10), 5);
      if (hBucket >= 0) humBuckets[hBucket]++;
    }
 
    self.postMessage({
      //  App.js y renderWorker4HTML los usan igual
      count,
      tempAvg: tempSum / count,
      tempMax,
      tempMin,
      humAvg: humSum / count,
      humMax,
      humMin,
      // Campos  los usa el CSS 
      tempHistogram: {
        labels: ['15-20', '20-25', '25-30', '30-35', '35-40', '40-45'],
        values: tempBuckets
      },
      humHistogram: {
        labels: ['20-30', '30-40', '40-50', '50-60', '60-70', '70-80'],
        values: humBuckets
      }
    });
 
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
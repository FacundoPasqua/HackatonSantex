/**
 * Cliente para enviar resultados de tests a la API Python
 */

const API_URL = process.env.API_URL || 'http://localhost:8000';

/**
 * Guarda un resultado de test en la base de datos
 * @param {Object} resultado - Objeto con los datos del resultado
 */
async function guardarResultadoEnBD(resultado) {
  try {
    const payload = {
      test_id: resultado.id,
      categoria: resultado.categoria,
      pregunta: resultado.pregunta,
      palabras_clave: resultado.palabrasClave,
      respuesta_bot: resultado.respuesta,
      validacion_correcta: resultado.validacionCorrecta,
      palabras_encontradas: resultado.palabrasEncontradas,
      resultado_final: resultado.resultadoFinal,
      tiempo_segundos: parseFloat(resultado.tiempo),
      error: resultado.error || null,
      test_type: resultado.testType || 'automotor',
      environment: resultado.environment || 'test',
      sheet_name: resultado.sheetName || null
    };

    console.log(`🔗 [${resultado.id}] Intentando guardar en: ${API_URL}/api/results`);
    
    const response = await fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000) // Aumentado a 30 segundos
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`💾 [${resultado.id}] Resultado guardado en BD: ID ${data.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ [${resultado.id}] Error guardando en BD: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.warn(`⚠️ [${resultado.id}] No se pudo guardar en BD:`, error.message);
    return false;
  }
}

/**
 * Guarda múltiples resultados en lote
 * @param {Array} resultados - Array de resultados
 */
async function guardarResultadosEnLote(resultados) {
  try {
    const payload = resultados.map(resultado => ({
      test_id: resultado.id,
      categoria: resultado.categoria,
      pregunta: resultado.pregunta,
      palabras_clave: resultado.palabrasClave,
      respuesta_bot: resultado.respuesta,
      validacion_correcta: resultado.validacionCorrecta,
      palabras_encontradas: resultado.palabrasEncontradas,
      resultado_final: resultado.resultadoFinal,
      tiempo_segundos: parseFloat(resultado.tiempo),
      error: resultado.error || null,
      test_type: resultado.testType || 'automotor',
      environment: resultado.environment || 'test',
      sheet_name: resultado.sheetName || null
    }));

    const response = await fetch(`${API_URL}/api/results/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`💾 Guardados ${data.length} resultados en BD`);
      return true;
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ Error guardando lote en BD: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.warn(`⚠️ No se pudo guardar lote en BD:`, error.message);
    return false;
  }
}

export { guardarResultadoEnBD, guardarResultadosEnLote };


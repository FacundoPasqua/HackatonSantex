/**
 * Script simple para probar la API
 */

const API_URL = 'https://hackatonsantex-production.up.railway.app';

console.log('🧪 Probando conexión con:', API_URL);

// Test 1: GET básico
fetch(`${API_URL}/`, { 
  signal: AbortSignal.timeout(15000) 
})
  .then(response => {
    console.log('✅ GET / funciona! Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📄 Respuesta:', JSON.stringify(data).substring(0, 200));
    
    // Test 2: POST para guardar
    console.log('\n🧪 Probando POST /api/results...');
    return fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test_id: 'TEST-SIMPLE-001',
        categoria: 'Prueba',
        pregunta: '¿Funciona?',
        palabras_clave: 'test',
        respuesta_bot: 'Sí',
        validacion_correcta: true,
        palabras_encontradas: 'test',
        resultado_final: 'PASS',
        tiempo_segundos: 0.5,
        test_type: 'automotor',
        environment: 'test'
      }),
      signal: AbortSignal.timeout(30000)
    });
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return response.text().then(text => {
        throw new Error(`Status ${response.status}: ${text}`);
      });
    }
  })
  .then(data => {
    console.log('✅ POST /api/results funciona!');
    console.log('📝 ID creado:', data.id);
    console.log('\n🎉 ¡Todo funciona! Los tests deberían poder guardar ahora.');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    if (error.name === 'TimeoutError') {
      console.error('\n💡 El servidor no responde. Verifica:');
      console.error('   1. ¿El backend está desplegado en Railway?');
      console.error('   2. ¿Está activo? (ve a Railway → Backend → Logs)');
      console.error('   3. ¿La URL es correcta?');
    } else if (error.message.includes('CORS')) {
      console.error('\n💡 Error de CORS. Verifica que ALLOWED_ORIGINS esté configurado.');
    } else if (error.message.includes('404')) {
      console.error('\n💡 Endpoint no encontrado. Verifica la URL.');
    } else if (error.message.includes('422')) {
      console.error('\n💡 Error de validación. Revisa el formato de los datos.');
    }
    process.exit(1);
  });


/**
 * Script para probar la conexión con el backend en Railway
 * y verificar que guarde datos correctamente
 */

const API_URL = process.env.API_URL || 'https://hackatonsantex-production-d1dc.up.railway.app';

async function testBackend() {
  console.log('🧪 Probando conexión con backend en Railway...\n');
  console.log(`📍 URL del backend: ${API_URL}\n`);

  // Test 1: Verificar que el backend responde
  console.log('1️⃣ Probando GET /...');
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    console.log('✅ Backend responde correctamente');
    console.log(`   Database: ${data.database}`);
    console.log(`   DB Status: ${data.db_status}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error conectando al backend:', error.message);
    return;
  }

  // Test 2: Verificar que puede guardar un resultado
  console.log('2️⃣ Probando POST /api/results...');
  try {
    const testData = {
      test_id: `TEST-${Date.now()}`,
      categoria: "Prueba Manual",
      pregunta: "¿Funciona el guardado en PostgreSQL?",
      palabras_clave: "test, postgresql, railway",
      respuesta_bot: "Sí, debería funcionar",
      validacion_correcta: true,
      palabras_encontradas: "test, postgresql",
      resultado_final: "PASS",
      tiempo_segundos: 1.5,
      test_type: "automotor",
      environment: "preprod"
    };

    const response = await fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resultado guardado correctamente');
      console.log(`   ID guardado: ${result.id}`);
      console.log(`   Test ID: ${result.test_id}`);
      console.log('');
    } else {
      const errorText = await response.text();
      console.error('❌ Error guardando resultado:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      return;
    }
  } catch (error) {
    console.error('❌ Error en la request:', error.message);
    return;
  }

  // Test 3: Verificar que se puede leer el resultado
  console.log('3️⃣ Probando GET /api/results...');
  try {
    const response = await fetch(`${API_URL}/api/results?limit=5`);
    const results = await response.json();
    console.log(`✅ Se pueden leer resultados`);
    console.log(`   Total de resultados: ${results.length}`);
    if (results.length > 0) {
      console.log(`   Último resultado: ${results[0].test_id} (ID: ${results[0].id})`);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error leyendo resultados:', error.message);
    return;
  }

  // Test 4: Verificar resumen
  console.log('4️⃣ Probando GET /api/summary...');
  try {
    const response = await fetch(`${API_URL}/api/summary`);
    const summary = await response.json();
    console.log('✅ Resumen obtenido correctamente');
    console.log(`   Total: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${summary.success_rate}%`);
    console.log('');
  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error.message);
    return;
  }

  console.log('🎉 Todos los tests pasaron correctamente!');
  console.log('\n💡 Si los tests de Playwright no guardan, verifica:');
  console.log('   1. Que config.env tenga API_URL apuntando a Railway');
  console.log('   2. Que los tests estén ejecutándose');
  console.log('   3. Revisa los logs de los tests para ver errores');
}

testBackend().catch(console.error);


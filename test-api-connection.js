/**
 * Script de diagnóstico para probar la conexión con la API
 * Ejecuta: node test-api-connection.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, 'config.env') });

const API_URL = process.env.API_URL || 'http://localhost:8000';

console.log('🧪 Test de conexión con la API\n');
console.log(`📍 URL configurada: ${API_URL}\n`);

async function testConnection() {
  // Test 1: Verificar que la API responde
  console.log('1️⃣ Probando conexión básica...');
  try {
    const healthCheck = await fetch(`${API_URL}/`, {
      signal: AbortSignal.timeout(10000)
    });
    
    if (healthCheck.ok) {
      const data = await healthCheck.json();
      console.log('   ✅ API responde correctamente');
      console.log(`   📄 Respuesta: ${JSON.stringify(data).substring(0, 100)}...\n`);
    } else {
      console.log(`   ❌ API responde con error: ${healthCheck.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    console.log(`   💡 Verifica que:\n      - La URL sea correcta\n      - El backend esté desplegado\n      - No haya problemas de red/CORS\n`);
    return false;
  }

  // Test 2: Probar guardar un resultado
  console.log('2️⃣ Probando guardar un resultado...');
  try {
    const testResult = {
      test_id: 'TEST-CONNECTION-001',
      categoria: 'Diagnóstico',
      pregunta: '¿La conexión funciona?',
      palabras_clave: 'test, conexión',
      respuesta_bot: 'Sí, funciona correctamente',
      validacion_correcta: true,
      palabras_encontradas: 'test, conexión',
      resultado_final: 'PASS',
      tiempo_segundos: 0.5,
      test_type: 'automotor',
      environment: 'test'
    };

    const response = await fetch(`${API_URL}/api/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testResult),
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Resultado guardado correctamente');
      console.log(`   📝 ID del registro: ${data.id}\n`);
      
      // Test 3: Verificar que se puede leer
      console.log('3️⃣ Verificando que el resultado se puede leer...');
      try {
        const getResponse = await fetch(`${API_URL}/api/results/${data.id}`, {
          signal: AbortSignal.timeout(10000)
        });
        
        if (getResponse.ok) {
          const retrieved = await getResponse.json();
          console.log('   ✅ Resultado recuperado correctamente');
          console.log(`   📊 Test ID: ${retrieved.test_id}`);
          console.log(`   📊 Resultado: ${retrieved.resultado_final}\n`);
          
          console.log('🎉 ¡Todo funciona correctamente!');
          console.log(`\n💡 Los tests deberían poder guardar resultados ahora.`);
          console.log(`   Asegúrate de que config.env tenga: API_URL=${API_URL}\n`);
          return true;
        } else {
          console.log(`   ⚠️ No se pudo recuperar el resultado: ${getResponse.status}`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error al recuperar: ${error.message}`);
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error al guardar: ${response.status}`);
      console.log(`   📄 Detalle: ${errorText.substring(0, 200)}\n`);
      
      if (response.status === 422) {
        console.log('   💡 Error de validación - verifica el formato de los datos');
      } else if (response.status === 500) {
        console.log('   💡 Error del servidor - revisa los logs del backend');
      } else if (response.status === 404) {
        console.log('   💡 Endpoint no encontrado - verifica la URL');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.name === 'TimeoutError') {
      console.log('   💡 Timeout - el servidor tarda mucho en responder');
    } else if (error.message.includes('fetch')) {
      console.log('   💡 Error de red - verifica la conexión y CORS');
    }
    return false;
  }
}

// Ejecutar tests
testConnection()
  .then(success => {
    if (!success) {
      console.log('\n❌ Hay problemas con la conexión.');
      console.log('📋 Revisa SOLUCION_NO_GUARDA_BD.md para más ayuda.\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Error inesperado:', error);
    process.exit(1);
  });



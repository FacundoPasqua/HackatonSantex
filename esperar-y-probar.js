/**
 * Script para esperar y probar la conexión después del deployment
 */

const API_URL = 'https://hackatonsantex-production.up.railway.app';

console.log('⏳ Esperando 30 segundos para que Railway despliegue...\n');

setTimeout(() => {
  console.log('🧪 Probando conexión con la API...\n');
  
  fetch(`${API_URL}/`, { 
    signal: AbortSignal.timeout(15000) 
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Status ${response.status}`);
      }
    })
    .then(data => {
      console.log('✅ ¡La API está funcionando!\n');
      console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
      console.log('\n🎉 El backend está listo. Los tests deberían poder guardar datos ahora.');
      console.log('\n💡 Próximos pasos:');
      console.log('   1. Ejecuta los tests: npm test');
      console.log('   2. Verifica en Railway → PostgreSQL → Database → Data');
      console.log('   3. Deberías ver los resultados guardados en la tabla test_results');
    })
    .catch(error => {
      console.error('❌ Aún hay problemas:', error.message);
      console.error('\n💡 Verifica en Railway:');
      console.error('   1. Ve a Backend → Deploy Logs');
      console.error('   2. Busca errores o mensajes de "Application startup complete"');
      console.error('   3. Si ves errores, compártelos para diagnosticar');
    });
}, 30000);


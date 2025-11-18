/**
 * Script para verificar qué URL está usando api_client.js
 */

// Simular el entorno de los tests
process.env.NODE_ENV = 'development';

// Cargar dotenv como lo hacen los tests
const dotenv = require('dotenv');
const path = require('path');

console.log('🔍 Verificando carga de config.env...\n');

// Intentar cargar desde diferentes paths
const paths = [
  './config.env',
  path.join(__dirname, 'config.env'),
  path.join(__dirname, '../config.env'),
];

let loaded = false;
for (const configPath of paths) {
  try {
    const result = dotenv.config({ path: configPath });
    if (!result.error) {
      console.log(`✅ config.env cargado desde: ${configPath}`);
      loaded = true;
      break;
    }
  } catch (e) {
    console.log(`❌ No se pudo cargar desde: ${configPath}`);
  }
}

if (!loaded) {
  console.log('⚠️ No se pudo cargar config.env desde ningún path');
}

console.log('\n📋 Variables de entorno:');
console.log(`   API_URL: ${process.env.API_URL || '(no definida)'}`);
console.log(`   BOT_URL: ${process.env.BOT_URL || '(no definida)'}`);

if (process.env.API_URL) {
  console.log('\n✅ API_URL está configurada correctamente');
  if (process.env.API_URL.includes('localhost')) {
    console.log('⚠️ ADVERTENCIA: API_URL apunta a localhost, debería apuntar a Railway');
  } else if (process.env.API_URL.includes('railway.app')) {
    console.log('✅ API_URL apunta a Railway (correcto)');
  }
} else {
  console.log('\n❌ API_URL no está configurada');
  console.log('   Verifica que config.env exista y tenga API_URL definida');
}


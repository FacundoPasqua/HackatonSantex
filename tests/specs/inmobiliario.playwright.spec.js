import { test, expect } from '@playwright/test';
import { google } from 'googleapis';
import fs from 'fs';
import XLSX from 'xlsx';
import dotenv from 'dotenv';
import { guardarResultadoEnBD } from '../../utils/api_client.js';

// Cargar variables de entorno desde config.env (en la raíz del proyecto)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Buscar config.env en la raíz del proyecto (subir 2 niveles desde tests/specs/)
dotenv.config({ path: join(__dirname, '../../config.env') });

// CONFIG
const INPUT_FILE = './tests/data/Inmobiliario.xlsx';
const CREDENTIALS_PATH = './tests/credentials/google-credentials.json';
const SPREADSHEET_ID = '1WDfRvcEgJ56wrCaRnAvZC390v39OtWpB8EyhmwjGtm4'; // tu ID
const BOT_URL = process.env.BOT_URL || 'https://preprod.rentascordoba.gob.ar/bot-web';
const MAX_PREGUNTAS = 1000; // Procesar todas las preguntas disponibles
const BLOQUEO_TEXT = 'Lo siento, no puedo procesar tu mensaje';
const TAMANO_LOTE = 2; // Número de preguntas a procesar simultáneamente
const ESPERA_ENTRE_LOTES = 4000; // 4 segundos de espera entre lotes

// Detectar entorno y configurar hoja correspondiente
const isLocalhost = BOT_URL.includes('localhost') || BOT_URL.includes('127.0.0.1');
const isPreprod = BOT_URL.includes('preprod');

// Generar nombre de hoja con fecha y horario más único
function generateSheetName(baseName) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0'); // Milisegundos para mayor unicidad
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Sufijo aleatorio
  return `${baseName}_${dateStr}_${timeStr}_${milliseconds}_${randomSuffix}`;
}

// Generar el nombre de hoja UNA SOLA VEZ para todo el archivo
let BASE_SHEET_NAME = 'Inmobiliario';
if (isLocalhost) {
  BASE_SHEET_NAME = 'Inmobiliario_Local';
} else if (isPreprod) {
  BASE_SHEET_NAME = 'Inmobiliario_Preprod';
}
const SHEET_NAME = generateSheetName(BASE_SHEET_NAME);

// Mostrar información de configuración
console.log(`🌐 URL configurada: ${BOT_URL}`);
console.log(`📊 Hoja de destino: ${SHEET_NAME}`);
console.log(`🏠 Modo: ${isLocalhost ? 'Localhost' : isPreprod ? 'Pre-prod' : 'Web'}`);

async function authSheets() {
  // Verificar si existe el archivo de credenciales
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.warn(`⚠️  Archivo de credenciales no encontrado: ${CREDENTIALS_PATH}`);
    console.warn('⚠️  Los tests se ejecutarán sin guardar en Google Sheets');
    return null;
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const jwtClient = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  await jwtClient.authorize();
  const sheets = google.sheets({ version: 'v4', auth: jwtClient });

  // Verifica acceso
  await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  return sheets;
}

// Función para crear las columnas si no existen
async function crearColumnasSiNoExisten(sheets) {
  try {
    // Primero verificar si la hoja existe
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    
    let sheetExists = existingSheets.includes(SHEET_NAME);
    
    // Si la hoja no existe, crearla
    if (!sheetExists) {
      console.log(`📝 Creando nueva hoja: "${SHEET_NAME}"`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEET_NAME
              }
            }
          }]
        }
      });
      console.log(`✅ Hoja "${SHEET_NAME}" creada exitosamente`);
    }

    // Verificar si la hoja tiene contenido
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:J1`
    });

    // Si no hay datos o la primera fila está vacía, crear las columnas
    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'ID',
        'Categoría',
        'Pregunta',
        'Palabras Clave Esperadas',
        'Respuesta del Bot',
        'Validación Correcta',
        'Palabras Encontradas',
        'Resultado Final',
        'Tiempo (s)',
        'Timestamp'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });

      console.log(`✅ Columnas creadas en la hoja "${SHEET_NAME}"`);
    } else {
      console.log(`✅ Hoja "${SHEET_NAME}" ya tiene columnas configuradas`);
    }
  } catch (error) {
    console.warn(`⚠️ Error al verificar/crear columnas:`, error.message);
  }
}

async function appendToSheet(sheets, fila) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [fila] }
  });
}

function readQuestions() {
  const workbook = XLSX.readFile(INPUT_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return data
    .slice(0, MAX_PREGUNTAS)
    .map((row, idx) => ({
      id: String(row['ID'] || '').trim(),
      categoria: String(row['Categoría'] || '').trim(),
      pregunta: String(row['Pregunta'] || '').trim(),
      palabrasClave: String(row['Resultado Esperado (palabras clave)'] || '').trim(),
      fuente: String(row['Fuente'] || '').trim(),
      añoVigencia: String(row['Año de vigencia'] || '').trim()
    }))
    .filter(r => r.pregunta && r.palabrasClave);
}

// Función para detectar si la respuesta contiene JSON crudo (error)
function contieneJSONCrudo(respuesta) {
  if (!respuesta || respuesta.length < 10) {
    return false;
  }
  
  // Patrones que indican JSON crudo en la respuesta
  const patronesJSON = [
    /\{\s*"action"\s*:/i,  // {"action": ...
    /\{\s*"tool_name"\s*:/i,  // {"tool_name": ...
    /\{\s*"reasoning"\s*:/i,  // {"reasoning": ...
    /\{\s*"parameters"\s*:\s*\{/i,  // {"parameters": { ...
  ];
  
  // Si contiene alguno de estos patrones, es JSON crudo (error)
  return patronesJSON.some(patron => patron.test(respuesta));
}

// Función para detectar si la respuesta es un mensaje de error genérico del bot
function esMensajeErrorGenerico(respuesta) {
  if (!respuesta || respuesta.length < 10) {
    return false;
  }
  
  const respuestaLimpia = respuesta.replace(/^RC\s*/, '').toLowerCase();
  
  // Patrones que indican mensaje de error genérico (bot no puede ayudar con la consulta)
  const patronesError = [
    /lo siento, solo puedo ayudarte con consultas relacionadas con impuestos/i,
    /solo puedo ayudarte con consultas relacionadas con impuestos/i,
    /para otros temas, puedes visitar.*rentascordoba\.gob\.ar/i,
    /no puedo ayudarte con.*consultas relacionadas con impuestos/i
  ];
  
  // Si contiene alguno de estos patrones, es un mensaje de error genérico
  return patronesError.some(patron => patron.test(respuestaLimpia));
}

// Función para detectar si la respuesta es un mensaje de "no encontrado"
function esMensajeNoEncontrado(respuesta) {
  if (!respuesta || respuesta.length < 10) {
    return false;
  }
  
  const respuestaLimpia = respuesta.replace(/^RC\s*/, '').trim();
  
  // Detectar si el mensaje empieza con "No pude encontrar información específica"
  return /^no pude encontrar información específica/i.test(respuestaLimpia);
}

// Función para validar si la respuesta contiene alguna de las palabras clave
function validarRespuestaConPalabrasClave(respuesta, palabrasClave) {
  if (!respuesta || respuesta.length < 5) {
    return { esCorrecta: false, palabrasEncontradas: [], tieneJSON: false, tieneErrorGenerico: false, tieneNoEncontrado: false };
  }
  
  // Si la respuesta contiene JSON crudo, siempre es un error (fallar validación)
  const tieneJSON = contieneJSONCrudo(respuesta);
  if (tieneJSON) {
    console.log(`❌ ERROR CRÍTICO: Respuesta contiene JSON crudo - "${respuesta.substring(0, 100)}..."`);
    return { esCorrecta: false, palabrasEncontradas: [], tieneJSON: true, tieneErrorGenerico: false, tieneNoEncontrado: false };
  }
  
  // Si la respuesta es un mensaje de error genérico, siempre es un error (fallar validación)
  const esErrorGenerico = esMensajeErrorGenerico(respuesta);
  if (esErrorGenerico) {
    console.log(`❌ ERROR: Respuesta es mensaje de error genérico del bot - "${respuesta.substring(0, 100)}..."`);
    return { esCorrecta: false, palabrasEncontradas: [], tieneJSON: false, tieneErrorGenerico: true, tieneNoEncontrado: false };
  }
  
  // Si la respuesta es un mensaje de "no encontrado", siempre es un error (fallar validación)
  const esNoEncontrado = esMensajeNoEncontrado(respuesta);
  if (esNoEncontrado) {
    console.log(`❌ ERROR: Respuesta es mensaje de "no encontrado" - "${respuesta.substring(0, 100)}..."`);
    return { esCorrecta: false, palabrasEncontradas: [], tieneJSON: false, tieneErrorGenerico: false, tieneNoEncontrado: true };
  }
  
  // Limpiar la respuesta (quitar prefijo RC si existe)
  const respuestaLimpia = respuesta.replace(/^RC\s*/, '').toLowerCase();
  
  // Dividir las palabras clave por comas y limpiar espacios
  const palabras = palabrasClave.toLowerCase()
    .split(',')
    .map(palabra => palabra.trim())
    .filter(palabra => palabra.length > 0);
  
  // Buscar qué palabras clave están presentes en la respuesta
  const palabrasEncontradas = palabras.filter(palabra => 
    respuestaLimpia.includes(palabra)
  );
  
  // La validación es exitosa si al menos una palabra clave está presente
  const esCorrecta = palabrasEncontradas.length > 0;
  
  return { esCorrecta, palabrasEncontradas, tieneJSON: false, tieneErrorGenerico: false, tieneNoEncontrado: false };
}

// Función para obtener la respuesta del bot con manejo de errores mejorado
async function obtenerRespuestaBot(page, preguntaId) {
  let respuesta = '';
  let intentos = 0;
  const maxIntentos = 15; // 15 intentos * 5 segundos = 75 segundos máximo
  const intervaloEspera = 5000; // Esperar 5 segundos entre intentos (bot tarda ~25 seg, reducir requests)
  let chatCerrado = false;
  
  while (intentos < maxIntentos && (!respuesta || respuesta.length < 5)) {
    await page.waitForTimeout(intervaloEspera); // Esperar 5 segundos entre intentos
    intentos++;
    
    try {
      // Verificar si la página sigue activa
      const isVisible = await page.isVisible('body');
      if (!isVisible) {
        console.log(`⚠️ Página no visible para pregunta ${preguntaId}`);
        chatCerrado = true;
        break;
      }

      // Verificar si el chat sigue abierto
      const chatFab = await page.locator('button.chat-fab').isVisible();
      const inputVisible = await page.locator('input.message-input').isVisible();
      
      if (!chatFab && !inputVisible) {
        console.log(`⚠️ Chat cerrado para pregunta ${preguntaId}`);
        chatCerrado = true;
        break;
      }
      
      // Esperar a que aparezca al menos un mensaje del bot
      await page.waitForSelector('.message-bubble.bot', { timeout: 1000 }).catch(() => {});
      
      // Buscar mensajes del bot
      const botMessages = await page.locator('.message-bubble.bot').allTextContents();
      console.log(`🔍 Intento ${intentos}: Encontrados ${botMessages.length} mensajes del bot`);
      
      if (botMessages.length > 0) {
        // Esperar un poco más para asegurarse que el mensaje esté completo
        await page.waitForTimeout(500);
        
        // Obtener los mensajes nuevamente después de la espera
        const updatedBotMessages = await page.locator('.message-bubble.bot').allTextContents();
        respuesta = updatedBotMessages[updatedBotMessages.length - 1]?.trim() || '';
        // Eliminar solo el prefijo "RC" y cualquier espacio inicial
        respuesta = respuesta.replace(/^RC\s*/, '');
        console.log(`📥 Respuesta encontrada: "${respuesta}"`);
      }
      
      // También intentar con otros selectors posibles
      if (!respuesta || respuesta.length < 5) {
        const altSelectors = [
          '.bot-message',
          '.chat-message.bot',
          '.message.bot',
          '[data-testid="bot-message"]',
          '.response'
        ];
        
        for (const selector of altSelectors) {
          const altMessages = await page.locator(selector).allTextContents();
          if (altMessages.length > 0) {
            respuesta = altMessages[altMessages.length - 1]?.trim() || '';
            // Eliminar solo el prefijo "RC" y cualquier espacio inicial
            respuesta = respuesta.replace(/^RC\s*/, '');
            if (respuesta && respuesta.length >= 5) {
              console.log(`📥 Respuesta encontrada con selector ${selector}: "${respuesta}"`);
              break;
            }
          }
        }
      }
      
    } catch (error) {
      console.log(`⚠️ Error en intento ${intentos} para pregunta ${preguntaId}:`, error.message);
      
      // Si hay un error de navegación, marcar como chat cerrado
      if (error.message.includes('Target closed') || error.message.includes('Session closed')) {
        console.log(`⚠️ Navegador cerrado para pregunta ${preguntaId}`);
        chatCerrado = true;
        break;
      }
    }
  }
  
  return { respuesta, chatCerrado, sinRespuesta: !respuesta || respuesta.length < 5 };
}

const preguntas = readQuestions();

if (preguntas.length === 0) {
  test('No hay preguntas en el Excel', async () => {
    expect(preguntas.length).toBeGreaterThan(0);
  });
} else {
  const sheetsPromise = authSheets();

  // Crear columnas en la primera ejecución
  test.beforeAll(async () => {
    const sheets = await sheetsPromise;
    if (sheets) {
      await crearColumnasSiNoExisten(sheets);
    }
  });

  // Función para procesar una pregunta individual
  async function procesarPregunta(page, p, sheets) {
    console.log(`\n🚀 ===== INICIANDO PREGUNTA ${p.id} =====`);
    console.log(`📝 Pregunta: ${p.pregunta}`);
    console.log(`🔍 Palabras clave esperadas: ${p.palabrasClave}`);
    
    let resultado = {
      id: p.id,
      categoria: p.categoria,
      pregunta: p.pregunta,
      palabrasClave: p.palabrasClave,
      respuesta: '',
      validacionCorrecta: false,
      palabrasEncontradas: '',
      resultadoFinal: 'FAIL',
      tiempo: '0',
      timestamp: new Date().toISOString(),
      error: null
    };

    try {
      // Navegar a la página
      console.log(`🌐 [${p.id}] Navegando a: ${BOT_URL}`);
      await page.goto(BOT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Verificar que la página cargó correctamente
      const pageTitle = await page.title().catch(() => '');
      const pageUrl = page.url();
      console.log(`🔍 [${p.id}] Título de la página: "${pageTitle}"`);
      console.log(`🔍 [${p.id}] URL actual: ${pageUrl}`);
      
      // Esperar a que la página termine de cargar
      await page.waitForLoadState('networkidle', { timeout: 60000 });
      
      // Esperar adicional para que Angular renderice (Angular puede tardar en renderizar componentes)
      await page.waitForTimeout(5000);
      
      // Debug: Verificar qué hay en el HTML antes de buscar el botón
      const pageContent = await page.content().catch(() => '');
      const hasChatFab = pageContent.includes('chat-fab');
      const hasMatFab = pageContent.includes('mat-fab');
      const hasAngular = pageContent.includes('ng-version') || pageContent.includes('_ngcontent');
      const bodyText = await page.locator('body').textContent().catch(() => '');
      console.log(`🔍 [${p.id}] Debug inicial - HTML contiene 'chat-fab': ${hasChatFab}, 'mat-fab': ${hasMatFab}, 'Angular': ${hasAngular}`);
      console.log(`🔍 [${p.id}] Primeros 200 caracteres del body: "${bodyText?.substring(0, 200)}"`);
      
      // Esperar a que Angular termine de renderizar (el botón tiene mat-fab que es Angular Material)
      // Esperar hasta 60 segundos para que aparezca el botón con class="chat-fab"
      console.log(`⏳ [${p.id}] Esperando a que Angular renderice el botón del chat...`);
      try {
        await page.waitForSelector('button.chat-fab', { state: 'visible', timeout: 60000 });
        console.log(`✅ [${p.id}] Botón chat-fab encontrado y visible`);
      } catch (err) {
        console.log(`⚠️ [${p.id}] Botón chat-fab no apareció después de 60s, intentando otros selectores...`);
        
        // Verificar HTML nuevamente después de la espera
        const pageContentAfter = await page.content().catch(() => '');
        const hasChatFabAfter = pageContentAfter.includes('chat-fab');
        const hasMatFabAfter = pageContentAfter.includes('mat-fab');
        console.log(`🔍 [${p.id}] Debug después de espera - HTML contiene 'chat-fab': ${hasChatFabAfter}, 'mat-fab': ${hasMatFabAfter}`);
        
        // Intentar con aria-label
        try {
          await page.waitForSelector('button[aria-label="Abrir chat"]', { state: 'visible', timeout: 10000 });
          console.log(`✅ [${p.id}] Botón encontrado por aria-label`);
        } catch (err2) {
          // Intentar con mat-fab
          try {
            await page.waitForSelector('button[mat-fab]', { state: 'visible', timeout: 10000 });
            console.log(`✅ [${p.id}] Botón encontrado por mat-fab`);
          } catch (err3) {
            // Intentar esperar cualquier botón que aparezca
            try {
              await page.waitForSelector('button', { state: 'visible', timeout: 10000 });
              const allButtons = await page.locator('button').all();
              console.log(`🔍 [${p.id}] Se encontraron ${allButtons.length} botones en total`);
              if (allButtons.length > 0) {
                for (let i = 0; i < Math.min(allButtons.length, 3); i++) {
                  const btnClass = await allButtons[i].getAttribute('class').catch(() => '');
                  const btnAria = await allButtons[i].getAttribute('aria-label').catch(() => '');
                  console.log(`🔍 [${p.id}] Botón ${i + 1}: class="${btnClass}", aria-label="${btnAria}"`);
                }
              }
            } catch (err4) {
              console.log(`⚠️ [${p.id}] No se encontró ningún botón en la página`);
            }
            
            // Tomar screenshot para debugging
            await page.screenshot({ path: `test-results/error-chat-button-${p.id}.png`, fullPage: true }).catch(() => {});
            throw new Error(`No se pudo encontrar el botón del chat. HTML contiene 'chat-fab': ${hasChatFabAfter}, 'mat-fab': ${hasMatFabAfter}. URL: ${pageUrl}`);
          }
        }
      }
      
      // Esperar un poco más para asegurar que el botón esté completamente interactivo
      await page.waitForTimeout(1000);
      console.log(`✅ [${p.id}] Página cargada correctamente`);
      
      // Buscar el botón con el selector correcto (prioridad: chat-fab, luego aria-label, luego mat-fab)
      let chatButton = null;
      const selectors = [
        'button.chat-fab',
        'button[aria-label="Abrir chat"]',
        'button[aria-label*="chat" i]',
        'button[mat-fab]',
        'button[class*="chat-fab"]',
      ];
      
      console.log(`🔍 [${p.id}] Buscando botón del chat con selectores específicos...`);
      for (const selector of selectors) {
        try {
          const button = page.locator(selector).first();
          const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            console.log(`✅ [${p.id}] Botón encontrado con selector: ${selector}`);
            chatButton = button;
            break;
          }
        } catch (err) {
          // Continuar con el siguiente selector
        }
      }
      
      if (!chatButton) {
        throw new Error(`No se pudo encontrar el botón del chat después de intentar ${selectors.length} selectores específicos`);
      }
      
      // Hacer click en el botón encontrado
      await chatButton.click({ timeout: 15000 });
      console.log(`✅ [${p.id}] Chat abierto`);

      const input = page.locator('input.message-input');
      await input.waitFor({ state: 'visible', timeout: 60000 });
      console.log(`✅ [${p.id}] Input del chat visible`);

      // Limpiar mensajes previos
      await page.evaluate(() => {
        const bubbles = document.querySelectorAll('.message-bubble');
        bubbles.forEach(e => e.remove());
      });
      await page.waitForTimeout(1000);

      // Enviar la pregunta
      const startTime = Date.now();
      await input.fill(p.pregunta);
      await page.keyboard.press('Enter');
      console.log(`📤 [${p.id}] Pregunta enviada`);

      // Obtener respuesta del bot con manejo de errores
      console.log(`⏳ [${p.id}] Esperando respuesta del bot...`);
      const respuestaData = await obtenerRespuestaBot(page, p.id);
      
      const tiempo = ((Date.now() - startTime) / 1000).toFixed(2);
      resultado.tiempo = tiempo;

      // Manejar diferentes escenarios
      if (respuestaData.chatCerrado) {
        console.log(`❌ [${p.id}] Chat cerrado o navegador cerrado`);
        resultado.respuesta = 'CHAT_CERRADO';
        resultado.resultadoFinal = 'FAIL';
        resultado.error = 'Chat cerrado o navegador cerrado';
      } else if (respuestaData.sinRespuesta) {
        console.log(`❌ [${p.id}] Sin respuesta del bot`);
        resultado.respuesta = 'SIN_RESPUESTA';
        resultado.resultadoFinal = 'FAIL';
        resultado.error = 'Sin respuesta del bot';
      } else {
        // Respuesta obtenida exitosamente
        resultado.respuesta = respuestaData.respuesta;
        
        if (respuestaData.respuesta.includes(BLOQUEO_TEXT)) {
          console.warn(`🛑 [${p.id}] Chat bloqueado`);
          resultado.error = 'Chat bloqueado';
        }

        // Validar respuesta con palabras clave
        const validacion = validarRespuestaConPalabrasClave(respuestaData.respuesta, p.palabrasClave);
        resultado.validacionCorrecta = validacion.esCorrecta;
        resultado.palabrasEncontradas = validacion.palabrasEncontradas.join(', ');
        resultado.resultadoFinal = validacion.tieneJSON ? 'FAIL (JSON)' : 
                                    validacion.tieneErrorGenerico ? 'FAIL (ERROR GENÉRICO)' : 
                                    validacion.tieneNoEncontrado ? 'FAIL (NO ENCONTRADO)' :
                                    (validacion.esCorrecta ? 'PASS' : 'FAIL');
        
        console.log(`📥 [${p.id}] Respuesta: "${respuestaData.respuesta.substring(0, 80)}..."`);
        if (validacion.tieneJSON) {
          console.log(`❌ [${p.id}] ERROR CRÍTICO: Respuesta contiene JSON crudo`);
        } else if (validacion.tieneErrorGenerico) {
          console.log(`❌ [${p.id}] ERROR: Respuesta es mensaje de error genérico del bot`);
        } else if (validacion.tieneNoEncontrado) {
          console.log(`❌ [${p.id}] ERROR: Respuesta es mensaje de "no encontrado"`);
        } else {
          console.log(`🎯 [${p.id}] Palabras encontradas: ${validacion.palabrasEncontradas.join(', ')}`);
          console.log(`✅ [${p.id}] Validación: ${validacion.esCorrecta ? 'PASS' : 'FAIL'}`);
        }
      }

    } catch (error) {
      console.error(`❌ [${p.id}] Error ejecutando pregunta:`, error.message);
      console.error(`❌ [${p.id}] Stack trace:`, error.stack);
      resultado.respuesta = 'ERROR_EJECUCION';
      resultado.resultadoFinal = 'FAIL';
      resultado.error = error.message;
      // Asegurar que el tiempo se calcule incluso si hay error
      if (resultado.tiempo === '0') {
        resultado.tiempo = '0.01'; // Tiempo mínimo para indicar que se intentó
      }
    }

    // Guardar resultado en Google Sheets
    try {
      // Marcar respuesta si contiene JSON
      const respuestaConMarcador = contieneJSONCrudo(resultado.respuesta) 
        ? `[ERROR JSON] ${resultado.respuesta}` 
        : resultado.respuesta;
      
      const fila = [
        resultado.id,
        resultado.categoria,
        resultado.pregunta,
        resultado.palabrasClave,
        respuestaConMarcador,
        resultado.validacionCorrecta,
        resultado.palabrasEncontradas,
        resultado.resultadoFinal,
        resultado.tiempo,
        resultado.timestamp
      ];

      if (sheets) {
        await appendToSheet(sheets, fila);
        console.log(`💾 [${p.id}] Resultado guardado en Google Sheets`);
      } else {
        console.log(`📝 [${p.id}] Resultado (sin guardar): ${JSON.stringify(fila)}`);
      }
    } catch (err) {
      console.warn(`❌ [${p.id}] No se pudo guardar resultado:`, err.message);
    }

    // Guardar también en la base de datos Python (SIEMPRE, incluso si hay error)
    try {
      const environment = isLocalhost ? 'localhost' : isPreprod ? 'preprod' : isTest ? 'test' : 'dev';
      const guardado = await guardarResultadoEnBD({
        ...resultado,
        testType: 'inmobiliario',
        environment: environment,
        sheetName: SHEET_NAME
      });
      if (guardado) {
        console.log(`✅ [${p.id}] Resultado guardado en BD Python`);
      } else {
        console.warn(`⚠️ [${p.id}] No se pudo guardar en BD Python (guardarResultadoEnBD retornó false)`);
      }
    } catch (err) {
      console.error(`❌ [${p.id}] Error crítico guardando en BD Python:`, err.message);
      console.error(`❌ [${p.id}] Stack trace:`, err.stack);
      // No lanzar el error, solo loguearlo para que el test continúe
    }

    console.log(`🏁 [${p.id}] FINALIZADA - RESULTADO: ${resultado.resultadoFinal}`);
    return resultado;
  }

  // Ejecutar las pruebas por lotes
  test.describe.serial('Inmobiliario - Procesamiento por Lotes', () => {
    // Dividir preguntas en lotes
    const lotes = [];
    for (let i = 0; i < preguntas.length; i += TAMANO_LOTE) {
      lotes.push(preguntas.slice(i, i + TAMANO_LOTE));
    }

    console.log(`📊 Total de preguntas: ${preguntas.length}`);
    console.log(`📦 Total de lotes: ${lotes.length}`);
    console.log(`🔢 Tamaño de lote: ${TAMANO_LOTE} preguntas`);

    for (let loteIndex = 0; loteIndex < lotes.length; loteIndex++) {
      const lote = lotes[loteIndex];
      
      test(`Lote ${loteIndex + 1}/${lotes.length} - Preguntas ${lote[0].id} a ${lote[lote.length - 1].id}`, async ({ browser }) => {
        test.setTimeout(600000); // 10 minutos por lote (aumentado para evitar timeouts)
        const sheets = await sheetsPromise;

        console.log(`\n🔥 ===== INICIANDO LOTE ${loteIndex + 1}/${lotes.length} =====`);
        console.log(`📋 Preguntas en este lote: ${lote.map(p => p.id).join(', ')}`);

        // Crear contextos y páginas para cada pregunta del lote
        const contextos = [];
        const paginas = [];
        
        for (let i = 0; i < lote.length; i++) {
          const contexto = await browser.newContext();
          const pagina = await contexto.newPage();
          contextos.push(contexto);
          paginas.push(pagina);
        }

        try {
          // Procesar todas las preguntas del lote en paralelo
          const promesas = lote.map((pregunta, index) => 
            procesarPregunta(paginas[index], pregunta, sheets)
          );

          const resultados = await Promise.all(promesas);

          // Mostrar resumen del lote
          const exitosos = resultados.filter(r => r.resultadoFinal === 'PASS').length;
          const fallidos = resultados.filter(r => r.resultadoFinal === 'FAIL').length;
          
          console.log(`\n📊 ===== RESUMEN LOTE ${loteIndex + 1} =====`);
          console.log(`✅ Exitosos: ${exitosos}`);
          console.log(`❌ Fallidos: ${fallidos}`);
          console.log(`📈 Tasa de éxito: ${((exitosos / lote.length) * 100).toFixed(1)}%`);

        } finally {
          // Cerrar todos los contextos
          for (const contexto of contextos) {
            await contexto.close();
          }
        }

        // Esperar entre lotes para evitar saturación
        if (loteIndex < lotes.length - 1) {
          console.log(`⏳ Esperando ${ESPERA_ENTRE_LOTES/1000} segundos antes del siguiente lote...`);
          await new Promise(resolve => setTimeout(resolve, ESPERA_ENTRE_LOTES));
        }
      });
    }
  });
}


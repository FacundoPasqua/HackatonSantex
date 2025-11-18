# Solución para Bloqueo del Sitio en Railway

## Problema
El sitio `preprod.rentascordoba.gob.ar` está bloqueando el acceso desde Railway, mostrando "Sitio Bloqueado" como título de página.

## Cambios Implementados

### 1. Headers HTTP Realistas
- `Accept`, `Accept-Language`, `Accept-Encoding` configurados como un navegador real
- Headers `Sec-Fetch-*` para simular navegación real
- `Connection: keep-alive` y `Upgrade-Insecure-Requests`

### 2. Configuración del Navegador
- User Agent de Chrome real
- Viewport 1920x1080
- Locale: `es-AR`
- Timezone: `America/Argentina/Cordoba`
- Permisos de geolocalización

### 3. Scripts Anti-Detección
- Oculta `navigator.webdriver` (propiedad que delata bots)
- Agrega `window.chrome` object
- Modifica `navigator.plugins` y `navigator.languages`
- Intercepta `navigator.permissions.query`

## Si el Problema Persiste

### Opción 1: Whitelist de IPs de Railway (Recomendado)
Contacta al equipo de infraestructura del sitio para que agreguen las IPs de Railway a la whitelist.

**Cómo obtener las IPs de Railway:**
1. Ve a Railway Dashboard
2. Revisa los logs de la aplicación
3. Busca la IP desde la cual se hacen las requests
4. O contacta a Railway support para obtener el rango de IPs

### Opción 2: Usar un Proxy/VPN
Si no puedes obtener whitelist, puedes usar un servicio de proxy:

```javascript
// En playwright.config.ts o en los tests
const contexto = await browser.newContext({
  // ... otras opciones
  proxy: {
    server: 'http://proxy-server:port',
    username: 'user',
    password: 'pass',
  },
});
```

**Servicios de proxy recomendados:**
- Bright Data (anteriormente Luminati)
- Smartproxy
- Oxylabs

### Opción 3: Ejecutar Tests desde Otro Servicio
Considera ejecutar los tests desde:
- GitHub Actions (puede tener IPs diferentes)
- Tu propio servidor con IP estática
- AWS/GCP con IP whitelisted

### Opción 4: Verificar Firewall/Cloudflare
El sitio puede estar usando:
- **Cloudflare**: Puede bloquear IPs de servicios cloud automáticamente
- **Firewall de aplicación**: Puede detectar patrones de bot
- **Rate limiting**: Demasiadas requests desde la misma IP

**Solución temporal**: Reducir la frecuencia de requests o usar delays más largos entre tests.

## Verificación

Después del deploy, revisa los logs para ver:
1. Si el título sigue siendo "Sitio Bloqueado"
2. Si hay algún mensaje de error específico
3. Si el HTML contiene información sobre el bloqueo

Si el problema persiste después de estos cambios, es muy probable que sea un bloqueo a nivel de IP/firewall que requiere whitelist.


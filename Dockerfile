FROM python:3.11-slim

# Instalar Node.js 20.x
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verificar instalación
RUN node --version && npm --version

# Copiar todo el código
WORKDIR /app
COPY . .

# Debug: Ver qué se copió y dónde está package.json
RUN echo "=== Contenido de /app ===" && ls -la /app && \
    echo "=== Buscando package.json ===" && \
    find /app -name "package.json" -type f 2>/dev/null | head -5 && \
    echo "=== Verificando si existe en raíz ===" && \
    (test -f /app/package.json && echo "✅ package.json encontrado en /app" || echo "❌ package.json NO encontrado en /app") && \
    echo "=== Verificando estructura ===" && \
    ls -la /app/backend 2>/dev/null | head -3 || echo "No hay directorio backend"

# Si package.json no está en /app, intentar crearlo o copiarlo desde otra ubicación
# Primero verificar si está en algún lugar
RUN if [ ! -f /app/package.json ]; then \
        echo "⚠️ package.json no encontrado, buscando en todo el sistema..." && \
        PKG_PATH=$(find /app -name "package.json" -type f 2>/dev/null | head -1) && \
        if [ -n "$PKG_PATH" ]; then \
            echo "📦 Encontrado en: $PKG_PATH, copiando a /app/" && \
            cp "$PKG_PATH" /app/package.json; \
        else \
            echo "❌ ERROR: package.json no encontrado en ningún lugar" && \
            exit 1; \
        fi; \
    fi

# Verificar que ahora existe
RUN test -f /app/package.json && echo "✅ package.json verificado" || (echo "❌ package.json aún no existe" && exit 1)

# Instalar dependencias de Node.js (incluyendo devDependencies para Playwright)
RUN npm install --include=dev

# Instalar Playwright y browsers (solo chromium para ahorrar espacio)
RUN npx playwright install --with-deps chromium

# Instalar dependencias de Python
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Exponer puerto
EXPOSE 8000

# Comando para iniciar
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


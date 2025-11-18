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

# Copiar todo el código (incluyendo package.json)
WORKDIR /app
COPY . .

# Debug: Listar archivos copiados para verificar qué se copió
RUN echo "=== Archivos en /app ===" && ls -la && echo "=== Buscando package.json ===" && find . -name "package.json" -type f 2>/dev/null || echo "package.json no encontrado"

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


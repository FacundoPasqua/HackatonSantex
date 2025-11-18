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

# Instalar dependencias de Python
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar package.json primero para cachear dependencias
WORKDIR /app
COPY package.json package-lock.json* ./

# Instalar dependencias de Node.js (incluyendo devDependencies para Playwright)
RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi

# Instalar Playwright y browsers (solo chromium para ahorrar espacio)
RUN npx playwright install --with-deps chromium

# Copiar todo el código (después de instalar dependencias para mejor cache)
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando para iniciar
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


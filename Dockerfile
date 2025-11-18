FROM python:3.11-slim

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20.x (necesario para ejecutar Playwright tests)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verificar instalación
RUN node --version && npm --version

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json primero (si existe en la raíz)
COPY package.json* ./

# Copiar el resto del código
COPY . .

# Instalar dependencias de Node.js (si package.json existe)
RUN if [ -f package.json ]; then \
        echo "Instalando dependencias de Node.js..." && \
        npm install --include=dev; \
    else \
        echo "⚠️ package.json no encontrado, saltando instalación de Node.js"; \
    fi

# Instalar Playwright y browsers (solo si npm se instaló correctamente)
RUN if [ -f package.json ] && [ -d node_modules ]; then \
        echo "Instalando Playwright..." && \
        npx playwright install --with-deps chromium || echo "⚠️ Error instalando Playwright, continuando..."; \
    else \
        echo "⚠️ Saltando instalación de Playwright (Node.js no disponible)"; \
    fi

# Instalar dependencias de Python
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Exponer puerto
EXPOSE 8000

# Comando para iniciar el backend
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


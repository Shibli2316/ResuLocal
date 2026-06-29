# Dockerfile for Next.js Full Stack Resume Builder
# Installs Chromium dependencies so Puppeteer exports PDFs flawlessly

FROM node:20-slim

# Install Chromium and required font packs for high-fidelity PDF rendering
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Point Puppeteer to the container-installed Chromium binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json* ./

# Install npm packages
RUN npm install

# Copy source repository
COPY . .

# Build the Next.js static asset bundles and API endpoints
RUN npm run build

# Configure execution environment
ENV NODE_ENV=production \
    PORT=3000 \
    APP_URL=http://localhost:3000

EXPOSE 3000

# Spin up the next server
CMD ["npm", "run", "start"]

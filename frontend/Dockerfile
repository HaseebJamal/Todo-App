# ============================================
# Stage 1 — Build React/Vite application
# ============================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY . .

# Build production files
RUN npm run build


# ============================================
# Stage 2 — Nginx
# ============================================

FROM nginx:alpine

# Remove default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
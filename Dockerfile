# ============================================
# Stage 1 — Build React frontend
# ============================================

FROM node:22-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


# ============================================
# Stage 2 — Production Express application
# ============================================

FROM node:22-alpine

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./

RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy React production build
COPY --from=frontend-builder /frontend/dist ./frontend-dist

# Create uploads directory
RUN mkdir -p uploads/profiles

EXPOSE 5000

CMD ["npm", "start"]
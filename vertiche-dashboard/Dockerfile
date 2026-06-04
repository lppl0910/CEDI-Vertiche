# Stage 1: build the React/Vite SPA
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# All VITE_ vars are baked into the JS bundle at build time.
# Pass them as build args from CI (see GitHub Actions workflow).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AUTH_API_URL
ARG VITE_MONITOREO_API_URL
ARG VITE_RFID_API_URL
ARG VITE_VENTAS_API_URL
ARG VITE_CHATBOT_API_URL
ARG VITE_API_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_MONITOREO_API_URL=$VITE_MONITOREO_API_URL \
    VITE_RFID_API_URL=$VITE_RFID_API_URL \
    VITE_VENTAS_API_URL=$VITE_VENTAS_API_URL \
    VITE_CHATBOT_API_URL=$VITE_CHATBOT_API_URL \
    VITE_API_KEY=$VITE_API_KEY

RUN npm run build

# Stage 2: serve with Nginx (tiny Alpine image, ~25MB total)
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

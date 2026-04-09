FROM node:22-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --include=optional
COPY . .

FROM base AS build
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_TELEGRAM_BOT_NAME
ARG VITE_TELEGRAM_CLIENT_ID
ARG VITE_ADMIN_TELEGRAM_IDS
ARG VITE_SITE_NAME
ARG VITE_BASE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_TELEGRAM_BOT_NAME=$VITE_TELEGRAM_BOT_NAME
ENV VITE_TELEGRAM_CLIENT_ID=$VITE_TELEGRAM_CLIENT_ID
ENV VITE_ADMIN_TELEGRAM_IDS=$VITE_ADMIN_TELEGRAM_IDS
ENV VITE_SITE_NAME=$VITE_SITE_NAME
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

FROM nginx:alpine AS prod
# Copy files to a temporary location first (volumes shadow the default location)
COPY --from=build /app/dist /app/static
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Sync files to the volume at runtime and start nginx
CMD ["sh", "-c", "cp -rf /app/static/* /usr/share/nginx/html/ && nginx -g 'daemon off;'"]

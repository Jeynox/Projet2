# syntax=docker/dockerfile:1

# --- Build : adapter-node embarque toutes les dépendances dans build/
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Origine publique figée au build (facultatif : sinon déduite de Host, en https)
ARG ORIGIN
RUN npm run build

# --- Runtime : seulement le bundle
FROM node:24-alpine
ENV NODE_ENV=production \
	PORT=3000 \
	BODY_SIZE_LIMIT=16M
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/build ./build
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
	CMD wget -qO /dev/null http://127.0.0.1:3000/admin/login || exit 1
CMD ["node", "build"]

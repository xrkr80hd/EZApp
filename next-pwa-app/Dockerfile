# Multi-stage Dockerfile for Next.js production build
# Stage 1: install dependencies and build the app
FROM node:18-alpine AS builder

# install build dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# Stage 2: production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy package files and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy built assets and public folder from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

# expose port and run
EXPOSE 3000

CMD ["npm", "start"]

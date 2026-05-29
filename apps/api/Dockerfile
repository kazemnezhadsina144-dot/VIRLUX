FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN npm install -w @virlux/shared -w @virlux/api
RUN npm run build -w @virlux/shared
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build
EXPOSE 3002
ENV PORT=3002
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN npm install -w @virlux/shared -w @virlux/web
RUN npm run build -w @virlux/shared && npm run build -w @virlux/web
WORKDIR /app/apps/web
ENV PORT=3100
EXPOSE 3100
CMD ["npm", "start"]

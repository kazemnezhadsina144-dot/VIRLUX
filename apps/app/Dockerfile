FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared ./packages/shared
COPY apps/app ./apps/app
RUN npm install -w @virlux/shared -w @virlux/app
RUN npm run build -w @virlux/shared && npm run build -w @virlux/app
WORKDIR /app/apps/app
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]

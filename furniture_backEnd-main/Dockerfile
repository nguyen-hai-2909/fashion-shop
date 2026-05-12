FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p public/photos public/imgs

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "app.js"]

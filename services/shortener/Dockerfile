# services/shortener/Dockerfile

FROM node:22-alpine

WORKDIR /app

COPY services/shortener/package*.json ./services/shortener/

RUN cd services/shortener && npm install --only=production

COPY services/shortener ./services/shortener
COPY shared ./shared

WORKDIR /app/services/shortener

ENV NODE_ENV=production

EXPOSE 5002

CMD ["node", "src/index.js"]

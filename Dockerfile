FROM node:12.19.1-alpine3.10

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm install pm2 -g

COPY . .

EXPOSE 6969

CMD ["pm2-runtime", "index.js"]
FROM node:14-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY index.js ./
COPY lib/ ./lib

ENTRYPOINT [ "node", "index.js" ]

FROM node:15.14.0-alpine3.10 AS base

WORKDIR /srv

RUN apk add --no-cache chromium
RUN apk add tzdata

ENV TZ Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY ./src ./src
COPY ./data ./data
COPY ./.env ./.env

CMD npm run start

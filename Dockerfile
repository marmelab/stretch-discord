FROM node:15.14.0-alpine3.10 AS base

WORKDIR /srv

RUN apk add --no-cache chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup -S botuser && adduser -S -g botuser botuser

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

COPY ./src ./src
COPY ./channels_ids ./channels_ids
COPY ./.env ./.env
COPY ./sudoku_data ./sudoku_data

RUN chown -R botuser:botuser /srv

USER botuser

RUN npm install

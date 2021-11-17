FROM node:16-alpine
WORKDIR /usr/src/app

ENV NODE_PORT=4883
ENV SCORE_SERVER_SCHEME=http
ENV SCORE_SERVER_DOMAIN=localhost
ENV SCORE_DIR=/data

RUN mkdir /data

COPY package*.json ./
RUN npm ci --only=production

COPY build-tools.js ./
COPY build-prod.js ./
COPY index.js ./
COPY .babelrc.json ./
COPY static ./static


EXPOSE 4883
RUN node build-prod.js
CMD ["node", "index.js", "--compat"]

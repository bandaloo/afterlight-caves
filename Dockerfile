FROM node:16-alpine
WORKDIR /usr/src/app

RUN mkdir /data

COPY package*.json ./
RUN npm ci --only=production

ENV NODE_PORT=4883
ENV SCORE_SERVER_SCHEME=https
ENV SCORE_SERVER_DOMAIN=afterlightcaves.com
ENV SCORE_DIR=/data

COPY index.js ./
COPY static ./static

EXPOSE 4883
CMD ["node", "index.js"]

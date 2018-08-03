FROM node:9.6.0-stretch

LABEL MAINTAINER="Casey Primozic <me@ameo.link>"

ADD . /app

WORKDIR /app
RUN npm install

CMD ["node", "/app/index.js"]

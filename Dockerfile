FROM node:17.4.0-stretch

LABEL MAINTAINER="Casey Primozic <casey@cprimozic.net>"

ADD . /app

WORKDIR /app
RUN npm install --no-optional

CMD ["./start.sh"]

FROM node:13.6.0-stretch

LABEL MAINTAINER="Casey Primozic <casey@cprimozic.net>"

ADD . /app

WORKDIR /app
RUN npm install --no-optional

CMD ["./start.sh"]

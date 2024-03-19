FROM node:21-bookworm-slim

LABEL MAINTAINER="Casey Primozic <casey@cprimozic.net>"

ADD . /app

WORKDIR /app
RUN npm install --no-optional

CMD ["./start.sh"]

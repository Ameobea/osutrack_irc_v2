docker-build:
  docker build -t osutrack_irc_v2:latest .

build-and-deploy:
  #!/bin/bash

  just docker-build
  docker save osutrack_irc_v2:latest | bzip2 > /tmp/osutrack_irc.tar.bz2
  scp /tmp/osutrack_irc.tar.bz2 debian@ameo.dev:/tmp/osutrack_irc.tar.bz2
  ssh debian@ameo.dev -t 'cat /tmp/osutrack_irc.tar.bz2 | bunzip2 | docker load && (docker kill osutrack_irc || true) && docker container rm osutrack_irc && docker run -d --name osutrack_irc --restart always -v /opt/conf/osutrack/ircPrivConf.js:/app/src/privConf.js osutrack_irc_v2:latest && rm /tmp/osutrack_irc.tar.bz2'

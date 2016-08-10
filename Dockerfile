FROM busybox:latest

RUN  mkdir -p /opt/htdocs/EvaSkeleton.js
COPY . /opt/htdocs/EvaSkeleton.js

VOLUME ["/opt/htdocs/EvaSkeleton.js"]

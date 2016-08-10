FROM node:4

RUN npm install -g nodemon babel-cli gulp sequelize-cli mysql bower coffee-script git://github.com/AlloVince/sequelize-auto#feature/column-comments

WORKDIR "/opt/htdocs/EvaSkeleton.js"
VOLUME ["/opt/htdocs/EvaSkeleton.js"]
VOLUME ["/root/.npm"]

EXPOSE 19000
CMD PORT=19000 node --harmony ./build/app.js

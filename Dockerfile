FROM node:12-alpine

LABEL maintainer="Alex Tkachuk <alex@pagespeed.green>"

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3003
USER node
CMD [ "node", "./src/server.js" ]

# Filename: Dockerfile
FROM node:14-alpine
RUN apk add --no-cache bash
RUN apk add --no-cache curl
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "npm", "start" ]
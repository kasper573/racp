FROM node:alpine
WORKDIR /opt/racp
COPY package.json .
RUN yarn install
COPY ./ ./
FROM node:alpine
ARG RACP_PATH
WORKDIR $RACP_PATH
COPY package.json .
RUN yarn install
COPY ./ ./
FROM node:latest

ENV RACP_PATH "/opt/racp"
ENV rAthenaPath "${RACP_PATH}/node_modules/rathena"
WORKDIR $RACP_PATH
COPY package.json .
RUN yarn install
COPY ./ ./
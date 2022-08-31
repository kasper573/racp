FROM node:alpine

ARG RATHENA_PATH
ARG RACP_PATH
ENV rAthenaPath $RATHENA_PATH

RUN apk update
RUN apk add --no-cache \
    coreutils \
    util-linux \
    git \
    make \
    gcc \
    g++ \
    mariadb-connector-c-dev \
    mariadb-client \
    pcre-dev \
    pcre libstdc++ \
    dos2unix \
    bind-tools \
    zlib-dev \
    linux-headers

RUN git clone https://github.com/rathena/rathena.git $RATHENA_PATH
RUN cd $RATHENA_PATH  \
    && ./configure \
    && make clean \
    && make server \
    && chmod a+x login-server char-server map-server

WORKDIR $RACP_PATH
COPY package.json .
RUN yarn install
COPY ./ ./

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
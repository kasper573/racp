FROM mariadb

RUN apt-get update
RUN apt-get -y install curl git
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get -y install nodejs
RUN npm install -g yarn

ENV RACP_PATH "/opt/racp"
ENV rAthenaPath "${RACP_PATH}/node_modules/rathena"
WORKDIR $RACP_PATH
COPY package.json .
RUN yarn install
COPY ./ ./

# Disabling rathena dependencies & build because RACP currently
# don't need rathena to be running, it just needs its source files on disk.

#RUN apk update
#RUN apk add --no-cache \
#    coreutils \
#    util-linux \
#    git \
#    make \
#    gcc \
#    g++ \
#    mariadb-connector-c-dev \
#    mariadb-client \
#    pcre-dev \
#    pcre libstdc++ \
#    dos2unix \
#    bind-tools \
#    zlib-dev \
#    linux-headers

#RUN cd $RATHENA_PATH  \
#    && ./configure \
#    && make clean \
#    && make server \
#    && chmod a+x login-server char-server map-server

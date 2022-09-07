FROM cypress/included:6.8.0

WORKDIR /opt/cypress/
COPY package.json .
RUN yarn install
COPY ./ ./
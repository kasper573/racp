
FROM cypress/included:9.7.0

WORKDIR /opt/cypress/
COPY package.json .
RUN yarn install
COPY ./ ./
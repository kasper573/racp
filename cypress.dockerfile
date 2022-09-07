
FROM cypress/included:10.7.0

WORKDIR /opt/cypress/
COPY package.json .
RUN yarn install
COPY ./ ./
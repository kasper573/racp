FROM cypress/included:6.8.0

WORKDIR /opt/cypress/
COPY cypress ./
COPY cypress.config.ts ./
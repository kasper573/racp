FROM cypress/included:6.8.0

WORKDIR /opt/e2e-tests/
COPY cypress ./
COPY cypress.config.ts ./
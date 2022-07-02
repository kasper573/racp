# rAthena Control Panel

Not ready for public use. Use at your own risk.

## Getting started

- Clone this repository
- Create a new file `.env.local` in the project root folder
- Add the following to the file, but substitute `<path>` with the absolute path to your rAthena folder:

```
rAthenaPath=<path>
```

## Development

- Make sure you have [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/) installed on your system
- Open a terminal and navigate to the project root
- Run `yarn dev:api` to start the api in dev mode
- Run `yarn dev:app` to start the app in dev mode
- Visit `http://localhost:8080/` in your browser

## Production

TBD

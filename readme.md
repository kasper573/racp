# rAthena Control Panel

A web-based database GUI and control panel for [rAthena](https://github.com/rathena/rathena).

## Design goals

<details>
    <summary>Minimal configuration</summary>
    
> Just install and run. RACP will read all data from either the rAthena data files or mysql database.

</details>

<details>
    <summary>Total abstraction</summary>

> RACP contains no data. No fixtures, no enums, nothing. RACP will read all data from either the rAthena data files or mysql database and the RO client files.

</details>

<details>
    <summary>Integration stability</summary>

> Unit and E2E tests run on each commit and tests run against a real rathena instance.

</details>

<details>
    <summary>Function over form</summary>

> The UI prioritizes functionality over aesthetics. Does not support theming, keeps things simple.

</details>

## Caveats

This is a pet project of mine, so it contains a lot of experimental code that I wrote for fun and practice and that would be inadvisable to use in a professional project.

Here's a list of what's experimental:

- [A custom frontend router](src/lib/tsr) (I just wanted to build one, the project really had no need for this)
- [A custom logger](src/lib/logger.ts) (Extremely pointless, I just wanted to code this. There's a million libraries that do exactly this)
- [A custom resource library](src/lib/repo) (born out of necessity and inexperience with what's available off the shelf. I needed some abstraction around all the various static data formats rAthena provides)

Everything else however is pretty much industry standard.

## Prerequisites

To run RACP you will need the following software installed on your machine:

- [Node.js](https://nodejs.org/en/) + [Yarn](https://yarnpkg.com/)
- [Mysql](https://www.mysql.com/)
- [Java](https://www.java.com/)
- [rAthena](https://github.com/rathena/) (Or a fork)

## Development

- Clone this repository on a machine matching the [prerequisites](#prerequisites)
- Open a terminal and navigate to the project root
- Run `yarn install`
- Run `yarn api:dev` to start the api in dev mode.
- Run `yarn app:dev` to start the app in dev mode.
- Visit `http://localhost:8080/` in your browser.
- (Optional) Run `yarn test:unit` to run the unit tests (add `--watch` to keep the runner active).
- (Optional) Run `cypress open` to run open the E2E test development tool.

### Developing against a custom rAthena instance

- Install rAthena on the same machine as RACP.
- Create a new file `.env.local` in the project root folder
- Add the following to the file, but substitute `<path>` with the absolute path to your rAthena folder:

```
rAthenaPath=<path>
```

### Branching strategy

All development happens in branches. The `main` branch gets deployed to the demo site listed above.
No branch is allowed to merge unless all tests pass.

### Testing practices

All major features should be covered by E2E tests.
As for unit tests, they are not required, but are encouraged for more complex units.

## Deployment

This is a fairly standard React + Express.js application, so you can use the provided [scripts](package.json) to manually manage a production deployment if you have the technical experience to do so:

- Clone this repository on a server matching the [prerequisites](#prerequisites)
- Create a `.env.local` file in the project root folder with your desired settings (see below)
- Run `yarn install` to install latest dependencies
- Run `yarn db:deploy` to deploy database migrations
- Run `yarn build` to build both the API and app, or `yarn (api|app):build` to build one.
- Run `yarn serve` to serve both the API and app, or `yarn (api|app):serve` to serve one.
- (Optional but recommended): Instead of `yarn serve` you can use [PM2](https://pm2.keymetrics.io/) for better stability and monitoring: `pm2 restart ecosystem.config.json`

This `.env.local` configuration will work for most users:

```text
NODE_ENV=production
reactRefresh=false
hostname=<your servers hostname>
apiPort=<your desired port for the api>
apiBaseUrl="//<hostname>/<apiPort>"
appPort=<your desired port for the app>
rAthenaPath="<path to your rAthena folder>"
jwtSecret=<your secret>
```

You can see which configuration options are available:

- For the Api: run `yarn api:serve --help`.
- For the App: see the `env` variable in [webpack.config.ts](webpack.config.ts).

## Assets

Once you have RACP running in production, you will need to populate it with data for the best user experience.
If you do not do this things like item descriptions, monster and map images, etc. will not be available.

To do this, simply sign in to your admin account and go to the Assets page and use the asset uploader.
Additional instructions are available on the page.

## High level technical details

> This information is intended for developers of RACP. None of this is relevant if you are simply forking/cloning RACP and running it for your server as-is.

- All rAthena specific code is abstracted away and located in the [rathena](src/api/rathena) folder. All API services are agnostic to the underlying data source.
- The rAthena version we integrate towards is a fixed commit hash in package.json.
- The rAthena database is interfaced with using [knex](https://knexjs.org/) and an introspected type definition generated with `yarn codegen:rathena`. Use this command and commit the changes to keep the knex bindings up to date whenever bumping the rAthena version.
- The RACP database is defined using a standard [prisma](https://www.prisma.io/) setup.

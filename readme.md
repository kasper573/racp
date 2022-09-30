# rAthena Control Panel

Not ready for public use. Use at your own risk.

[Demo](http://139.59.197.170)

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

> Unit and E2E tests run on each commit and will run against the latest rathena version.

</details>

<details>
    <summary>Function over form</summary>

> The UI prioritizes functionality over aesthetics. Does not support theming, keeps things simple.

</details>

## Prerequisites

To run RACP you will need the following software installed on your machine:

- [Node.js](https://nodejs.org/en/)
- [Mysql](https://www.mysql.com/)
- [Java](https://www.java.com/)
- [rAthena](https://github.com/rathena/) (Or a fork)

## Development

- Install rAthena on the same machine as RACP.
- Create a new file `.env.local` in the project root folder
- Add the following to the file, but substitute `<path>` with the absolute path to your rAthena folder:

```
rAthenaPath=<path>
```

- Open a terminal and navigate to the project root
- Run `yarn dev:api` to start the api in dev mode
- Run `yarn dev:app` to start the app in dev mode
- Visit `http://localhost:8080/` in your browser

## Production

TBD

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotEnvFlowPlugin = require("cypress-dotenv-flow");

function plugins(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
) {
  return dotEnvFlowPlugin(config, undefined, true);
}

export default plugins;

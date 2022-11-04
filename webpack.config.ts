import "dotenv-flow/config";
import "webpack-dev-server";
import * as path from "path";
import * as webpack from "webpack";
import { pick } from "lodash";
import ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import HtmlWebpackPlugin = require("html-webpack-plugin");
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { WebpackPluginInstance } from "webpack";
import { defined } from "./src/lib/std/defined";
import { rootId } from "./src/app/layout/globalStyles";
import { readCliArgs } from "./src/cli";

const env = readCliArgs({
  NODE_ENV: { type: "string", default: "development" },
  reactRefresh: { type: "boolean", default: false },
  apiBaseUrl: { type: "string", required: true },
  appPort: { type: "number", required: true },
  analyzeBundles: { type: "boolean", default: false },
  enableErrorBoundary: { type: "boolean", default: false },
  showDetailsInErrorBoundary: { type: "boolean", default: false },
});

console.log("Building app with options", env);

const appDirectory = path.resolve(__dirname, "src", "app");
const isDevBuild = env.NODE_ENV === "development";

const config: webpack.Configuration = {
  entry: path.resolve(appDirectory, "index.tsx"),
  output: {
    path: path.resolve(__dirname, "./dist/app"),
    publicPath: "/",
    filename: "bundle.js",
  },
  devtool: isDevBuild ? "source-map" : undefined,
  mode: isDevBuild ? "development" : "production",
  plugins: defined([
    new webpack.EnvironmentPlugin(
      pick(
        env,
        "NODE_ENV",
        "apiBaseUrl",
        "showDetailsInErrorBoundary",
        "enableErrorBoundary"
      )
    ),
    new HtmlWebpackPlugin({
      favicon: path.resolve(appDirectory, "favicon.png"),
      template: path.resolve(appDirectory, "index.html"),
      templateParameters: { rootId },
    }),
    isDevBuild && new ForkTsCheckerWebpackPlugin(),
    env.reactRefresh && new ReactRefreshWebpackPlugin(),
    env.analyzeBundles &&
      (new BundleAnalyzerPlugin() as unknown as WebpackPluginInstance),
  ]),
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.[tj]sx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                  refresh: env.reactRefresh,
                },
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  devServer: {
    historyApiFallback: true,
    port: env.appPort,
  },
};

export default config;

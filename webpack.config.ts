import "dotenv-flow/config";
import "webpack-dev-server";
import * as path from "path";
import * as webpack from "webpack";
import { load as loadEnv } from "ts-dotenv";
import { omit } from "lodash";
import ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import HtmlWebpackPlugin = require("html-webpack-plugin");
import { defined } from "./src/lib/defined";
import { rootId } from "./src/app/layout/globalStyles";

const env = loadEnv({
  NODE_ENV: { type: String, default: "development" },
  reactRefresh: { type: Boolean, optional: true },
  apiBaseUrl: String,
  appTitle: String,
  port: { type: Number, default: 8080 },
});

const appDirectory = path.resolve(__dirname, "src", "app");
const isDevBuild = env.NODE_ENV === "development";

const config: webpack.Configuration = {
  entry: path.resolve(appDirectory, "index.tsx"),
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
    filename: "bundle.js",
  },
  devtool: isDevBuild ? "source-map" : undefined,
  mode: isDevBuild ? "development" : "production",
  plugins: defined([
    new webpack.EnvironmentPlugin(omit(env, "reactRefresh")),
    new HtmlWebpackPlugin({
      favicon: path.resolve(appDirectory, "favicon.png"),
      template: path.resolve(appDirectory, "index.html"),
      templateParameters: { rootId },
    }),
    isDevBuild && new ForkTsCheckerWebpackPlugin(),
    env.reactRefresh && new ReactRefreshWebpackPlugin(),
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
    port: env.port,
  },
};

export default config;

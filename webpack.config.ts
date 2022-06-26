import "webpack-dev-server";
import * as path from "path";
import * as webpack from "webpack";
import ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import HtmlWebpackPlugin = require("html-webpack-plugin");
import { defined } from "./src/lib/defined";
import { loadEnvVars } from "./env";
import { rootId } from "./src/app/layout/globalStyles";

const env = loadEnvVars(/^app_/);
const appDirectory = path.resolve(__dirname, "src", "app");
const NODE_ENV = process.env.NODE_ENV ?? "development";
const isRefreshEnabled = Boolean(process.env.REACT_REFRESH ?? "false");
const isDevBuild = NODE_ENV === "development";
const webpackMode = NODE_ENV === "production" ? "production" : "development";

const config: webpack.Configuration = {
  entry: path.resolve(appDirectory, "index.tsx"),
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/",
    filename: "bundle.js",
  },
  devtool: isDevBuild ? "source-map" : undefined,
  mode: webpackMode,
  plugins: defined([
    new webpack.EnvironmentPlugin(env),
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, "index.html"),
      templateParameters: {
        title: env.app_title,
        rootId,
      },
    }),
    isDevBuild && new ForkTsCheckerWebpackPlugin(),
    isRefreshEnabled && new ReactRefreshWebpackPlugin(),
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
                  refresh: isRefreshEnabled,
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
  },
};

export default config;

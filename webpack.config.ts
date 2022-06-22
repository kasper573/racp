import * as path from "path";
import * as webpack from "webpack";
import ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
import ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
import HtmlWebpackPlugin = require("html-webpack-plugin");
import "webpack-dev-server";
import DotenvWebpackPlugin = require("dotenv-webpack");
import { defined } from "./src/utils/defined";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isRefreshEnabled = Boolean(process.env.REACT_REFRESH ?? "false");
const isDevBuild = NODE_ENV === "development";
const webpackMode = NODE_ENV === "production" ? "production" : "development";

const config: webpack.Configuration = {
  entry: path.resolve(__dirname, "src", "app", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  devtool: isDevBuild ? "source-map" : undefined,
  mode: webpackMode,
  plugins: defined([
    new DotenvWebpackPlugin(),
    new webpack.EnvironmentPlugin({ NODE_ENV }),
    new HtmlWebpackPlugin(),
    isDevBuild && new ForkTsCheckerWebpackPlugin(),
    isRefreshEnabled && new ReactRefreshWebpackPlugin(),
  ]),
  module: {
    rules: [
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
};

export default config;

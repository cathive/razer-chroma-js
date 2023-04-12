import * as path from "node:path";

import {Configuration} from "webpack";

const commonConfig: Configuration = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
}

const webConfig: Configuration = {
  ...commonConfig,
  target: "web",
  entry: "./src/main-web.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "lib.web.js",
  },
  //…
};

const nodeConfig: Configuration = {
    ...commonConfig,
    target: "node",
    entry: "./src/main-node.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "lib.node.js",
    },
    //…
  };

const allConfigurations = [
    webConfig,
    nodeConfig
];

export default allConfigurations;

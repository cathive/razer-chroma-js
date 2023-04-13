import * as path from "node:path";

import {Configuration} from "webpack";

const commonConfig: Configuration = {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
}

const webConfig: Configuration = {
  ...commonConfig,
  target: "web",
  entry: {
    main: "./lib/main-web.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "razer-chroma.web.dist.js",
  }
};

const allConfigurations = [
    webConfig,
];

export default allConfigurations;

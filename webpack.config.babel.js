import { HotModuleReplacementPlugin } from "webpack";
import * as Path from "path";

export default {
  entry: "./src/main.ts",
  output: {
    filename: "main.bundle.js",
    path: Path.resolve("./dist"),
    publicPath: "/"
  },
  mode: "development",
  module: {
    rules: [{ test: /\.ts/, use: ["babel-loader", "ts-loader"] }]
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  plugins: [new HotModuleReplacementPlugin()],
  devServer: {
    port: 8080,
    contentBase: "./public",
    inline: true,
    hot: true
  }
};

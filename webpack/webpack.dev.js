const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HookShellScriptPlugin = require('hook-shell-script-webpack-plugin')

module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
  plugins: [
    new HookShellScriptPlugin({
        afterEmit: ["open -a 'Google Chrome' http://reload.extensions"],
    }),
  ],
});

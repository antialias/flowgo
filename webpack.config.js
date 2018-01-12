const localModuleRegexBuilder = require('local-module-regex')
const path = require('path')
module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js',
    library: 'commonjs2',
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: localModuleRegexBuilder(__dirname), loader: "babel-loader" }
    ]
  },
  externals:[
    'react'
  ]
}

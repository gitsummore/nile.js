<<<<<<< HEAD
// webpack.config.js
const webpack = require('webpack')
const path = require('path')

const config = {
  context: path.resolve(__dirname, 'client'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, include: path.resolve(__dirname, 'client'), loader: 'babel-loader' },
      { test: /\.css$/, include: path.resolve(__dirname, 'client'), loader: 'style-loader!css-loader' },
    ]
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'client'),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }]
    }, {
      test: /\.css$/,
      include: path.resolve(__dirname, 'client'),
      use: [{

      }]
    }]
  }
}

module.exports = config
=======
module.exports = {
  entry: './client/module',
  output: {
    filename: './dist/nile-bundle.js',
    libraryTarget: 'umd',
    library: 'nile'
  }
}
>>>>>>> 5b764ab5fe7b70861db335d691d196195ef63674

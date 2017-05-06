// webpack.config.js
const webpack = require('webpack')
const path = require('path')
const glob = require('glob')

module.exports = {
  // entry: path.resolve(__dirname, 'client/module/broadcaster.js'),
  // entry: {
  //   js: glob.sync(path.resolve(__dirname, 'client/module/*.js'))
  // },
  entry: {
    // Broadcaster: path.resolve(__dirname, 'client/module/broadcaster.js'),
    Viewer: path.resolve(__dirname, 'client/module/viewer.js')
    // Webworker: path.resolve(__dirname, 'client/module/web-worker.js')
  },
  // target: 'web',
  output: {
    publicPath: 'dist',
    path: path.resolve(__dirname, 'client/dist'),
    filename: 'nile.[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015']
          ]
        }
      }
    ]
  }
}
//   },
//   module: {
//     loaders: [
//       {
//         test: /\.js$/,
//         include: path.resolve(__dirname, 'client'),
//         loader: 'babel-loader',
//       },
//       { test: /\.css$/, include: path.resolve(__dirname, 'client'), loader: 'style-loader!css-loader' },
//     ]
//   }
// }


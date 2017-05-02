const webpack = require('webpack')
const path = require('path')

// const config = {
//   // context: path.resolve(__dirname, 'src'),
//   entry: __dirname,
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: './bundle.js'
//   },
//   module: {
//     loaders: [
//       {
//         test: /\.(js|jsx)$/,
//         loader: 'babel-loader',
//         exclude: /node_modules/,
//         include: path.join(__dirname),
//       },
//       {
//         test: /(\.css|\.scss)$/,
//         include: [path.resolve(__dirname, 'client')],
//         loaders: ['style-loader', 'css-loader', 'sass-loader']
//       },
//     ]
//   }
// }

// module.exports = config;
module.exports = {
  entry: path.join(__dirname, 'client'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: path.join(__dirname)
      },
      {
        test: /.css$/,
        include: path.join(__dirname, 'src/stylesheets'),
        loader: 'style-loader!css-loader'
      },
      {
        test: /.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      }
    ]
  }
}
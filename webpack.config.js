module.exports = {
  entry: './client/module',
  output: {
    filename: './dist/nile-bundle.js',
    libraryTarget: 'umd',
    library: 'nile'
  }
}
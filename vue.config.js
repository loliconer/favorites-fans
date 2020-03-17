module.exports = {
  configureWebpack: {
    externals: {
      vue: 'Vue'
    },
    resolve: {
      extensions: ['*', '.js', '.vue', '.json']
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
}

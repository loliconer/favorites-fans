module.exports = {
  css: {
    loaderOptions: {
      less: {
        strictMath: 'on'
      }
    }
  },
  configureWebpack: {
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

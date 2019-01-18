module.exports = {
  lintOnSave: false,
  pages: {
    index: 'src/main.js'
  },
  css: {
    loaderOptions: {
      less: {
        strictMath: 'on'
      }
    }
  },
  configureWebpack: {
    resolve: {
      // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
      extensions: ['*', '.mjs', '.js', '.vue', '.json', '.gql', '.graphql']
    },
    module: {
      rules: [ // fixes https://github.com/graphql/graphql-js/issues/1272
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8021',
        changeOrigin: true
      }
    }
  }
}

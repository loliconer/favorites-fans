import Vue from 'vue'
import 'lovue'
import 'lovue/dist/lovue.min.css'
import 'lovue/dist/lovue.extension.min.css'
import '../less/community.less'
import '../less/layout.less'
import './lib/iconfont'
import utils from 'lovue/dist/utils.esm'
import ApolloClient from 'apollo-boost'
import gql from 'graphql-tag'
import errorMessages from './lib/errorMessages'

window.utils = utils
window.$fetch = utils.fetch
window.gql = gql
window.apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
})

Vue.config.productionTip = false

Vue.prototype.error2 = function (error) {
  // graphQLErrors, networkError
  let text, code
  if (error.networkError) {
    // name, response, statusCode, result
    code = error.networkError.statusCode

    const result = error.networkError.result
    if (result.errors && result.errors.length) {
      code = result.errors[0].extensions.code
      console.error(result.errors[0].message)
    }

    text = errorMessages[code] || '未知错误'
  }

  Vue.prototype.error(text)
}

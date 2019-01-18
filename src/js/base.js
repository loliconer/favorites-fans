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

window.utils = utils
window.$fetch = utils.fetch
window.gql = gql
window.apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql'
})

Vue.config.productionTip = false

Vue.prototype.error2 = function (error) {
  Vue.prototype.error(error.networkError ? error.networkError.statusCode : '未知错误')
}

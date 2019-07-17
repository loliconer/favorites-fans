import Vue from 'vue'
import lovue from 'lovue'
import 'lovue/dist/lovue.min.css'
import 'lovue/src/less/extension/Tag.less'
import '../less/community.less'
import '../less/layout.less'
import './lib/iconfont'
import {$fetch} from 'lovue/dist/utils.esm'

Vue.use(lovue)
Vue.config.productionTip = false

window.$fetch = $fetch

import Vue from 'vue'
import '../less/community.less'
import '../less/layout.less'
import './lib/iconfont'
import {$fetch} from '@lovue/utils'

Vue.config.productionTip = false

window.$fetch = $fetch

import '../less/community.less'
import '../less/layout.less'
import {$fetch} from '@lovue/utils'

$fetch.setHeader('x-access-token', localStorage.accessToken || '')
window.$fetch = $fetch

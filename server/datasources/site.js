const { DataSource } = require('apollo-datasource')

class SiteAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async get() {
    const body = await this.store.site.select()
    if (body === undefined) return []
    return body
  }

  async post(site) {
    const body = await this.store.site.insert(site)
    if (body === undefined) return -1
    return body
  }
}

module.exports = SiteAPI

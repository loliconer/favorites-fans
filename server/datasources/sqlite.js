const { DataSource } = require('apollo-datasource')

class CategoryAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async get(modal) {
    const body = await this.store[modal].select()
    if (body === undefined) return []

    return body
  }

  async post(modal, obj) {
    const body = await this.store[modal].insert(obj)
    if (body === undefined) return -1

    return body
  }

  async put(id, name) {
    const body = await this.store.category.where(`id=${id}`).update({ name })
    if (body === undefined) return -1
    return body
  }

  async del(modal, id) {
    let clause = `id=${id}`
    if (modal === 'category') clause = `id=${id} OR parentId=${id}`
    const body = await this.store[modal].where(clause).del()
    if (body === undefined) return -1
    return body
  }
}

module.exports = CategoryAPI


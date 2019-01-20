const { DataSource } = require('apollo-datasource')

class CategoryAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  async get() {
    console.log(222)
    console.log(this.store.category)
    const body = await this.store.category.select()
    if (body === undefined) return []

    return body
  }

  async post(name, parentId) {
    const row = { name }
    parentId !== undefined && (row.parentId = parentId)
    const body = await this.store.category.insert(row)
    if (body === undefined) return -1

    return body
  }

  async put(id, name) {
    console.log(333)
    console.log(this.store.category)
    const body = await this.store.category.where(`id=${id}`).update({ name })
    if (body === undefined) return -1
    return body
  }

  async del(id) {
    const body = await ModalAPI.del()
    if (body === undefined) return -1
    return body
  }
}

module.exports = CategoryAPI

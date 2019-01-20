const { DataSource } = require('apollo-datasource')
const Category = require('../models/Category')
const Site = require('../models/Site')
const modals = {
  Category,
  Site
}

module.exports = class ModalAPI extends DataSource {
  constructor() {
    super()
  }

  initialize(config) {
    this.context = config.context
  }

  async get(modal) {
    const body = await new modals[modal]().select()
    if (body === undefined) return []

    return body
  }

  async post(modal, obj) {
    const body = await new modals[modal]().insert(obj)
    if (body === undefined) return -1

    return body
  }

  async put(modal, id, obj) {
    const body = await new modals[modal]().where(`id=${id}`).update(obj)
    if (body === undefined) return -1
    return body
  }

  async del(modal, id) {
    let clause = `id=${id}`
    if (modal === 'Category') clause = `id=${id} OR parentId=${id}`

    const body = await new modals[modal]().where(clause).del()
    if (body === undefined) return -1
    return body
  }
}


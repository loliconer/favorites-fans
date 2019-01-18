const Modal = require('./Modal')

module.exports = class Category extends Modal {
  constructor() {
    super('categories')
    this.columns = 'id, serialNo, name, parentId, Datetime(createTime, "+8 hours") createTime'
  }
}

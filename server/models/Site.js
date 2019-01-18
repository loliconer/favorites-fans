const Modal = require('./Modal')

module.exports = class Site extends Modal {
  constructor() {
    super('sites')
    this.columns = 'id, serialNo, title, description, url, categoryId, category, likers, Datetime(createTime, "+8 hours") createTime'
  }
}

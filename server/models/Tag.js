const Modal = require('./Modal')

module.exports = class Tag extends Modal {
  constructor() {
    super('tags')
    this.columns = 'id, name, type, hot, color, Datetime(createTime, "+8 hours") createTime'
  }
}

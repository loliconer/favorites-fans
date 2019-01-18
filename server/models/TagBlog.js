const Modal = require('./Modal')

module.exports = class TagBlog extends Modal {
  constructor() {
    super('tagBlog')
    this.columns = 'id, tagId, blogId'
  }
}

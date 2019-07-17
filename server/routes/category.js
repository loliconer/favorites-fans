import {Category} from './models'

export default {
  async getAll(req, res, next) {
    const body = await Category.findAll({ raw: true }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async post(req, res, next) {
    const { name, parentId } = req.body
    const body = await Category.create({ name, parentId }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async put(req, res, next) {
    const id = +req.params.id
    const { name } = req.body
    const body = await Category.update({ name }, { where: { id } }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async del(req, res, next) {
    const id = +req.params.id
    const body = await Category.destroy({ where: { id } }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  }
}

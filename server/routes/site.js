import {Site} from './models'

export default {
  async getAll(req, res, next) {
    const body = await Site.findAll({ raw: true }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async post(req, res, next) {
    const { categoryId, title, url, serialNo } = req.body
    const body = await Site.create({ categoryId, title, url, serialNo }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async put(req, res, next) {
    const id = +req.params.id
    const { categoryId, title, url } = req.body
    const body = await Site.update({ categoryId, title, url }, { where: { id } }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async del(req, res, next) {
    const id = +req.params.id
    const body = await Site.destroy({ where: { id } }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  },
  async putOrder(req, res, next) {
    const { sites } = req.body
    const body = await Site.bulkCreate(sites.map(site => {
      site.title = 'test'
      return site
    }), {
      updateOnDuplicate: ['serialNo']
    }).catch(next)
    if (body !== undefined) res.json({ code: 0, data: body })
  }
}

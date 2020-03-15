import restify from 'restify'
import routes from './routes'
import {auth} from './lib/guard'
import {makeSequelizeError} from './lib/util'

const server = restify.createServer({
  name: 'Server',
  version: '1.0.0'
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.get('/api/categories', routes.category.getAll)
server.post('/api/categories', auth, routes.category.post)
server.put('/api/categories/:id', auth, routes.category.put)
server.del('/api/categories/:id', auth, routes.category.del)

server.get('/api/sites', routes.site.getAll)
server.post('/api/sites', auth, routes.site.post)
server.put('/api/sites/:id', auth, routes.site.put)
server.del('/api/sites/:id', auth, routes.site.del)
server.put('/api/sites-order', routes.site.putOrder)

server.on('restifyError', function (req, res, err, callback) {
  res.json(makeSequelizeError(err))
})

server.listen(4000, () => console.log('%s listening at %s', server.name, server.url))

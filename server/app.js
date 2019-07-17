import restify from 'restify'
import routes from './routes'
import {makeSequelizeError} from './lib/util'

const server = restify.createServer({
  name: 'Server',
  version: '1.0.0'
})

server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.get('/api/categories', routes.category.getAll)
server.post('/api/categories', routes.category.post)
server.put('/api/categories/:id', routes.category.put)
server.del('/api/categories/:id', routes.category.del)

server.get('/api/sites', routes.site.getAll)
server.post('/api/sites', routes.site.post)
server.put('/api/sites/:id', routes.site.put)
server.del('/api/sites/:id', routes.site.del)

server.on('restifyError', function (req, res, err, callback) {
  res.json(makeSequelizeError(err))
})

server.listen(4000, () => console.log('%s listening at %s', server.name, server.url))

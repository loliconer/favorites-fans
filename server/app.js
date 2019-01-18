const restify = require('restify')
const routes = require('./routes')
const verify = require('./lib/verify')

const server = restify.createServer({
  name: 'fullStack',
  version: '1.0.0'
})

server.pre([
  (req, res, next) => {
    res.charSet('utf-8')
    console.log(req.method, req.url)
    return next()
  }
])
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser({
  multiples: true,
  keepExtensions: true,
  uploadDir: './upload',
  hash: 'sha1'
}))

server.get('/api/user', verify, function (req, res) {
  res.json({ code: 0, data: req.user })
})
server.post('/api/users', routes.user.register)
server.post('/api/session', routes.user.login)

server.post('/api/password', routes.user.resetPassword)

server.post('/api/files', routes.system.upload)
server.post('/api/verifyCode', routes.system.sendVerifyCode)

server.get('/api/auth/github', routes.auth.github)

server.listen(8021, () => console.log('%s listening at %s', server.name, server.url))

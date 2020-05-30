export function auth(req, res, next) {
  const token = req.headers['x-access-token']
  if (token !== process.env.ACCESS_TOKEN) return res.json({ code: 114, msg: 1 })
  next()
}

const app = require('express')()

app.get('/api/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end('Hello About API')
})

module.exports = app

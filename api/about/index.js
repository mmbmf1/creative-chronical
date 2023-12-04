const app = require('express')()

app.get('/api/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.send('<h1>Hello About API</h1>')
})

module.exports = app

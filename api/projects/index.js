const app = require('express')()

// Add some personal projects
// Add some github metrics
// Add some work projects
// Add some tech

app.get('/api/projects', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.end('Hello Projects API')
})

module.exports = app

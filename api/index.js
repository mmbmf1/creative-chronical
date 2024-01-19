const express = require('express')
const app = express()
const path = require('path')
const pug = require('pug')
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

function getData(data, id) {
  return data.find(({ id: project_id }) => Number(project_id) === Number(id))
}

app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('index')
})

app.get('/api/nav', (req, res) => {
  const { id } = req.query

  const nav = pug.compileFile('views/nav.pug')

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.send(nav({ id }))
})

app.get('/api/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('about')
})

app.get('/api/projects', async (req, res) => {
  const { page } = req.query

  let { data: projects, error } = await supabase.from('projects').select('*')

  const itemsPerPage = 6
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = page * itemsPerPage
  const pagedProjects = projects.slice(startIndex, endIndex)

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const paginationLinks = Array.from({ length: totalPages }, (_, i) => i + 1)

  const projectsArray = pug.compileFile('views/projects.pug')

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')

  res.send(
    projectsArray({
      projects: pagedProjects,
      pagination: paginationLinks,
      current_page: page,
    })
  )
})

app.get('/api/details', async (req, res) => {
  const { id, page } = req.query

  let { data: details, error: details_error } = await supabase
    .from('details')
    .select('*')

  let data = getData(details, id)

  if (!data) {
    console.log('There was a problem getting the project details.')
  }

  let { data: projects, error: projects_error } = await supabase
    .from('projects')
    .select('*')

  const { name, image_url } = getData(projects, id)

  if (req.query.image) {
    const image = pug.compileFile('views/image.pug')
    res.send(image(image_url))
    return
  }

  data.name = name
  data.image_url = image_url
  data.current_page = page

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')

  const project = pug.compileFile('views/details.pug')

  res.send(project(data))
})

app.get('/api/image', async (req, res) => {
  const { id, page } = req.query

  let { data: projects, error } = await supabase.from('projects').select('*')

  const { image_url } = getData(projects, id)

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')

  const image = pug.compileFile('views/image.pug')

  res.send(image({ image_url, id, current_page: page }))
})

app.get('/api/contact', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('contact')
})

module.exports = app

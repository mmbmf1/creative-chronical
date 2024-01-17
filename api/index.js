const express = require('express')
const app = express()
const path = require('path')
const pug = require('pug')
import projects from '../assets/projects'
import details from '../assets/details'

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

function getData(data, id) {
  return data.find(({ id: project_id }) => project_id === Number(id))
}

app.get('/api', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('index')
})

app.get('/api/nav', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('nav')
})

app.get('/api/about', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('about')
})

app.get('/api/projects', (req, res) => {
  const { page } = req.query

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

app.get('/api/project', (req, res) => {
  const { id } = req.query

  const last_project_id = projects[projects.length - 1].id

  let data = getData(projects, id)

  if (!data) {
    console.log('There was a problem getting the project.')
  }

  data.next_id = Number(id) + 1
  data.prev_id = Number(id) - 1

  if (Number(id) === 1) {
    data.prev_id = last_project_id
  }

  if (Number(id) === last_project_id) {
    data.next_id = 1
  }

  const project = pug.compileFile('views/project.pug')

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')

  res.send(project(data))
})

app.get('/api/details', (req, res) => {
  const { id, page } = req.query

  let data = getData(details, id)

  if (!data) {
    console.log('There was a problem getting the project details.')
  }

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

app.get('/api/image', (req, res) => {
  const { id, page } = req.query

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

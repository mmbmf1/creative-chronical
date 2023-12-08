const express = require('express')
const app = express()
const path = require('path')
const pug = require('pug')
import projects from '../assets/projects'
import details from '../assets/details'

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

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

app.get('/api/project', (req, res) => {
  const { id } = req.query

  const last_project_id = projects[projects.length - 1].id

  let data = projects.find((project) => project.id === Number(id))

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
  const { id } = req.query

  let data = details.find(({ id: project_id }) => project_id === Number(id))

  if (!data) {
    console.log('There was a problem getting the project details.')
  }

  const { name } = projects.find(
    ({ id: project_id }) => project_id === Number(id)
  )

  data.name = name

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')

  const project = pug.compileFile('views/details.pug')

  res.send(project(data))
})

app.get('/api/contact', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('contact')
})

module.exports = app

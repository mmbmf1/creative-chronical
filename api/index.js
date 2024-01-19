const express = require('express')
const app = express()
const path = require('path')
const pug = require('pug')
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

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

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let { data: projects, error: projects_error } = await supabase
      .from('projects')
      .select('*')

    if (projects_error) throw new Error(projects_error)

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
  } catch (error) {
    console.log('👀 🔍 ~ app.get ~ error:', error)
    throw new Error(error)
  }
})

app.get('/api/details', async (req, res) => {
  const { id, page, image } = req.query

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let { data: details, error: details_error } = await supabase
      .from('details')
      .select('*')
      .eq('id', id)

    if (details_error) throw new Error(details_error)

    let { data: projects, error: projects_error } = await supabase
      .from('projects')
      .select('name, image_url')
      .eq('id', id)

    if (projects_error) throw new Error(projects_error)

    if (image) {
      const image = pug.compileFile('views/image.pug')
      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
      res.send(image(projects[0].image_url))
    }

    details[0].name = projects[0].name
    details[0].image_url = projects[0].image_url
    details[0].current_page = page

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
    const project = pug.compileFile('views/details.pug')
    res.send(project(details[0]))
  } catch (error) {
    console.log('👀 🔍 ~ app.get ~ error:', error)
    throw new Error(error)
  }
})

app.get('/api/image', async (req, res) => {
  const { id, page } = req.query

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    let { data: projects, error: projects_error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)

    if (projects_error) throw new Error(projects_error)

    const { image_url } = projects[0]

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
    const image = pug.compileFile('views/image.pug')
    res.send(image({ image_url, id, current_page: page }))
  } catch (error) {
    console.log('👀 🔍 ~ app.get ~ error:', error)
    throw new Error(error)
  }
})

app.get('/api/contact', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate')
  res.render('contact')
})

module.exports = app

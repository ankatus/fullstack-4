const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (req) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7)
  }
  return null
}

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { id: 1, username: 1, name: 1 })
  res.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (req, res) => {
  const newBlog = req.body

  try {
    const token = jwt.verify(getTokenFrom(req), process.env.SECRET)

    const user = await User.findById(token.id)
    console.log(user)
    newBlog.user = user._id

    if (newBlog.likes === undefined) {
      newBlog.likes = 0
    }

    if (newBlog.title === undefined && newBlog.url === undefined) {
      return res.sendStatus(400).end()
    }

    const blog = new Blog(newBlog)
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    res.status(201).json(result)
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError' ) {
      res.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      res.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.delete('/:id', async (req, res) => {
  const deleteId = req.params.id
  try {
    await Blog.findByIdAndRemove(deleteId)
    res.status(200).end()
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong' })
  }
})

blogsRouter.put('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, req.body)
    res.status(200).end()
  } catch (exception) {
    console.log(exception)
    res.status(500).json({ error: 'something went wrong' })
  }
})

module.exports = blogsRouter
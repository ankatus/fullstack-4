const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

const initialBlogs = [
    {
        'title': 'blogi1',
        'author': 'kirjoittaja1',
        'url': 'url1',
        'likes': 1
    },
    {
        'title': 'blogi2',
        'author': 'kirjoittaja2',
        'url': 'url2',
        'likes': 2
    }
]

const initialUsers = [
    {
        'username': 'user1',
        'password': 'password1',
        'name': 'name1',
        'adult': true
    }
]

beforeEach(async () => {
    await Blog.remove({})
    await User.remove({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const userObjects = initialUsers.map(user => new User(user))
    const blogPromises = blogObjects.map(blog => blog.save())
    const userPromises = userObjects.map(user => user.save())
    await Promise.all(blogPromises)
    await Promise.all(userPromises)
})

describe('GET /api/blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('correct number of blogs returned', async () => {
        const response = await api
            .get('/api/blogs')
        expect(response.body.length).toBe(initialBlogs.length)
    })
})

describe('POST /api/blogs', () => {
    test('new blog is added', async () => {
        const newBlog = {
            'title': 'blogi',
            'author': 'blogitus',
            'url': 'asdf',
            'likes': 5
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const response = await api
            .get('/api/blogs')
        const titles = response.body.map(blog => blog.title)
        expect(titles).toContain('blogi')
        expect(response.body.length).toBe(initialBlogs.length + 1)
    })
    test('default of likes is 0', async () => {
        const newBlog = {
            'title': 'blogi',
            'author': 'blogitus',
            'url': 'asdf'
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
        const response = await api.get('/api/blogs')
        const added = response.body.find(blog => blog.title === 'blogi')
        expect(added.likes).toBe(0)
    })
    test('no title and url returns 400', async () => {
        const newBlog = {
            'author': 'blogitus',
            'likes': 5
        }
        await api.post('/api/blogs').send(newBlog).expect(400)
    })
})

describe('DELETE /api/blogs/:id', () => {
    test('blog is deleted from database', async () => {
        let response = await api.get('/api/blogs')
        const blogsInDB = response.body
        const deleteId = blogsInDB[0].id
        await api.delete('/api/blogs/' + deleteId)
        response = await api.get('/api/blogs')
        expect(response.body.find(blog => blog.id === deleteId)).toBe(undefined)
    })
})

describe('PUT /api/blogs/:id', () => {
    test('all blog fieds are updated', async () => {
        let response = await api.get('/api/blogs')
        const blogsInDB = response.body
        const idToUpdate = blogsInDB[0].id
        let updatedBlog = {
            'title': 'blogi12',
            'author': 'kirjoittaja12',
            'url': 'url12',
            'likes': 12
        }
        await api
            .put('/api/blogs/' + idToUpdate)
            .send(updatedBlog)
        response = await api.get('/api/blogs')
        updatedBlog = response.body.find(blog => blog.id === idToUpdate)
        expect(updatedBlog.title).toBe('blogi12')
        expect(updatedBlog.author).toBe('kirjoittaja12')
        expect(updatedBlog.url).toBe('url12')
        expect(updatedBlog.likes).toBe(12)
    })
})

describe('POST /api/users', () => {
    test('new user is added to DB', async () => {
        const newUser = {
            'username': 'newUser',
            'password': 'newPass',
            'name': 'user',
            'adult': false
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

    })
    test('adult defaults to true', async () => {
        const newUser = {
            'username': 'newUser',
            'password': 'newPass',
            'name': 'user'
        }
        const response =
            await api
                .post('/api/users')
                .send(newUser)
        expect(response.body.adult).toBe(true)
    })
    test('too short password returns error', async () => {
        const newUser = {
            'username': 'newUser',
            'password': 'ab',
            'name': 'user',
            'adult': false
        }
        const response =
            await api
                .post('/api/users')
                .send(newUser)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('password too short')
    })
    test('non-unique username returns error', async () => {
        const newUser = {
            'username': 'user1',
            'password': 'newPass',
            'name': 'user',
            'adult': false
        }
        const response =
            await api
                .post('/api/users')
                .send(newUser)
        expect(response.status).toBe(400)
        expect(response.body.error).toBe('username not unique')
    })
})

afterAll(() => {
    server.close()
})
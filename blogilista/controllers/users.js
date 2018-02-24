const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('blogs')
    res.json(users.map(User.format))
})

usersRouter.post('/', async (req, res) => {
    const body = req.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    if (body.adult === undefined) {
        body.adult = true
    }

    if (body.password.length < 3) {
        return res.status(400).json({ error: 'password too short' })
    }

    const sameUserName = await User.find({'username': body.username})

    if (sameUserName.length !== 0) {
        return res.status(400).json({error: 'username not unique'})
    }

    const newUser = new User({
        username: body.username,
        passwordHash,
        name: body.name,
        adult: body.adult
    })

    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (exception) {
        console.log(exception)
        res.status(500).json({ error: 'something went wrong' })
    }

})

module.exports = usersRouter
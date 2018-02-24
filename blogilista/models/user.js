const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    'username': String,
    'passwordHash': String,
    'name': String,
    'adult': Boolean,
    'blogs': [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = (user) => {
    return {
        username: user.username,
        name: user.name,
        adult: user.adult,
        blogs: user.blogs,
        id: user.id
    }
}

const User = mongoose.model('User', userSchema)

module.exports = User
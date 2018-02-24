const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => {
        return sum + blog.likes
    }, 0)
}

const favouriteBlog = (blogs) => {
    return blogs.length == 0 ? {} : blogs[blogs.reduce((maxIndex, blog, index, arr) => {
        return blog.likes > arr[maxIndex].likes ? index : maxIndex
    },0)]

}
module.exports = {
    dummy,
    totalLikes,
    favouriteBlog
}
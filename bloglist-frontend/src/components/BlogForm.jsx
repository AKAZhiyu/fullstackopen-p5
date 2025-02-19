import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlogTitle, setNewBlogTitle] = useState('')
  const [newBlogUrl, setNewBlogUrl] = useState('')
  const [newBlogAuthor, setNewBlogAuthor] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      author: newBlogAuthor,
      url: newBlogUrl,
      title: newBlogTitle
    })
    setNewBlogAuthor('')
    setNewBlogTitle('')
    setNewBlogUrl('')
  }

  return (
    <div>
      <h2>Create New Blog</h2>
      <form onSubmit={addBlog}>
        <div>
                    title:
          <input
            type="text"
            value={newBlogTitle}
            name="Title"
            onChange={({ target }) => setNewBlogTitle(target.value)}
          />
        </div>

        <div>
                    author:
          <input
            type="text"
            value={newBlogAuthor}
            name="Author"
            onChange={({ target }) => setNewBlogAuthor(target.value)}
          />
        </div>
        <div>
                    url:
          <input
            type="text"
            value={newBlogUrl}
            name="Url"
            onChange={({ target }) => setNewBlogUrl(target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )

}

export default BlogForm

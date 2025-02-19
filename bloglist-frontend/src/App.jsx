import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [errorMessage, setErrorMessage] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)
    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      setUser(user)
      blogService.setToken(user.token)
      setUsername('')
      setPassword('')

      setInfoMessage(`Logged in as ${username}`)
      setTimeout(() => {
        setInfoMessage(null)
      }, 5000)

    } catch (exception) {

      if (exception.response) {
        setErrorMessage(exception.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      } else {
        setErrorMessage('something went wrong')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }

    }
  }

  const handleCreate = async (blogObj) => {
    blogFormRef.current.toggleVisibility()
    console.log('creating blog')
    try {
      const savedBlog = await blogService.create(blogObj)
      setBlogs(blogs.concat(savedBlog))
      setInfoMessage(`Blog created`)
      setTimeout(() => {
        setInfoMessage(null)
      }, 5000)
    } catch (exception) {

      if (exception.response) {
        setErrorMessage(exception.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      } else {
        setErrorMessage('something went wrong')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      }
    }
  }

  const handleLogout = () => {
    setUser(null)
    setInfoMessage(`Logged out`)
    setTimeout(() => {
      setInfoMessage(null)
    }, 5000)
    window.localStorage.removeItem('loggedNoteappUser')
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const blogFrom = () => {
    return blogs.map(blog =>
      <Blog key={blog.id} blog={blog} />
    )
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={errorMessage} type={"error"} />
        <Notification message={infoMessage} type={"info"} />
        {loginForm()}
      </div>
    )
  }


  return (
    <div>

      <h2>blogs</h2>
      <Notification message={errorMessage} type={"error"} />
      <Notification message={infoMessage} type={"info"} />
      <p>{user.username} logged in <button onClick={handleLogout}>log out</button></p>

      <Togglable buttonLabel={"Create a blog"} ref={blogFormRef}>
        <BlogForm createBlog={handleCreate}/>
      </Togglable>

      {blogFrom()}
    </div>
  )
}

export default App
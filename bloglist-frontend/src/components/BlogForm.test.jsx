import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'


test('the form calls the event handler correctly', async () => {
    const newBlog = {
        author: 'newBlogAuthor',
        url: 'www.newblog.com',
        title: 'new blog only display title and author by default'
    }

    const mockHandler = vi.fn()
    const { container } = render(<BlogForm createBlog={mockHandler} />)
    const div = container.querySelector('.blogForm')
    const user = userEvent.setup()

    const titleInput = screen.getByPlaceholderText('title here...')
    const urlInput = screen.getByPlaceholderText('url here...')
    const authorInput = screen.getByPlaceholderText('author here...')
    const createButton = screen.getByText('create')

    // userEvent.type(titleInput, newBlog.title)
    // userEvent.type(urlInput, newBlog.url)
    // userEvent.type(authorInput, newBlog.author)

    await userEvent.type(titleInput, newBlog.title)
    await userEvent.type(urlInput, newBlog.url)
    await userEvent.type(authorInput, newBlog.author)
    // await userEvent.click(createButton)

    await user.click(createButton)

    expect(mockHandler.mock.calls).toHaveLength(1)

    // expect(mockHandler.mock.calls[0][0].).toHaveLength(1)
    expect(mockHandler.mock.calls[0][0].author).toBe(newBlog.author)
    expect(mockHandler.mock.calls[0][0].url).toBe(newBlog.url)
    expect(mockHandler.mock.calls[0][0].title).toBe(newBlog.title)
})
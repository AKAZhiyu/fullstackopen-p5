import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import userEvent from '@testing-library/user-event'

test('only renders the blog\'s title and author by default', () => {
  const blog = {
    author: 'newBlogAuthor',
    url: 'www.newblog.com',
    title: 'new blog only display title and author by default',
    user: {
        name: "tester"
    }
  }

  const { container } = render(<Blog blog={blog}/>)

//   screen.debug()
  const div = container.querySelector('.blog')

  expect(div).toHaveTextContent(
    'new blog only display title and author by default newBlogAuthor'
  )

  expect(div).not.toHaveTextContent(
    'www.newblog.com like tester'
  )


})

test('the blog\'s URL and likes are shown when the button clicked', async () => {
    const blog = {
      author: 'newBlogAuthor',
      url: 'www.newblog.com',
      title: 'new blog only display title and author by default',
      user: {
          name: "tester"
      },
      likes: 11
    }
    const { container } = render(<Blog blog={blog}/>)

    const div = container.querySelector('.blog')

    expect(div).not.toHaveTextContent(
        'www.newblog.com like tester'
    )
    // screen.debug(div)
    // const mockHandler = vi.fn()
    const user = userEvent.setup()
  
    const button = screen.getByText('view')
    await user.click(button)
    expect(div).toHaveTextContent(
        '11 like'
    )

    // expect(mockHandler.mock.calls).toHaveLength(1)
})

test('the blog\'s URL and likes are shown when the button clicked', async () => {
    const blog = {
      author: 'newBlogAuthor',
      url: 'www.newblog.com',
      title: 'new blog only display title and author by default',
      user: {
          name: "tester"
      },
      likes: 11
    }

    const mockHandler = vi.fn()
    const { container } = render(<Blog blog={blog} updateBlog={mockHandler}/>)
    const div = container.querySelector('.blog')
    
    const user = userEvent.setup()
  
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
})
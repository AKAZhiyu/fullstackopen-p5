const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('')
  })

  test('Login form is shown', async ({ page }) => {
    const form_locator = await page.getByTestId('login_form')
    await expect(form_locator).toBeVisible()
    await expect(page.getByText('Log in to application')).toBeVisible()
  })

  describe('Login', () => {
    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('wrong credentials')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })

    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      const infoDiv = await page.locator('.info')
      await expect(infoDiv).toContainText('Logged in as mluukkai')
      await expect(infoDiv).toHaveCSS('border-style', 'solid')
      await expect(infoDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
      await expect(page.getByText('wrong credentials')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'blog title', 'blog author', 'www.blog.com')
      await expect(page.getByText('Blog created')).toBeVisible()
      await expect(page.getByText('blog title blog author')).toBeVisible()
    })


    test('a new blog can be liked', async ({ page }) => {
      await createBlog(page, 'blog title1', 'blog author1', 'www.blog.com')
      // await page.getByRole('button', { name: 'login' }).click()
      // await expect(page.getByText('Blog created')).toBeVisible()
      // await expect(page.getByText('blog title blog author')).toBeVisible()
      const blogDiv = await page.locator('.blog').filter({ hasText: 'blog title1 blog author1' })
      await blogDiv.getByRole('button', { name: 'view' }).click()

      await expect(page.getByText('www.blog.com')).toBeVisible()

      const likeButton = blogDiv.getByRole('button', { name: 'like' })
      await expect(likeButton).toBeVisible()
      await likeButton.click()

      await expect(blogDiv.getByText('1')).toBeVisible()
    })

    test('a blog can be delete by the creator', async ({ page }) => {
      await createBlog(page, 'blog to delete', 'blog author1', 'www.blog.com')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'blog to delete blog author1' })
      await blogDiv.getByRole('button', { name: 'view' }).click()

      await expect(page.getByText('www.blog.com')).toBeVisible()

      const removeButton = blogDiv.getByRole('button', { name: 'remove' })
      await expect(removeButton).toBeVisible()
      page.on('dialog', dialog => {
        // console.log(`Dialog message: ${dialog.message()}`)
        dialog.accept()
      })
      await removeButton.click()

      await expect(page.getByText('blog to delete blog author1')).not.toBeVisible()
      await expect(page.getByText('Blog deleted')).toBeVisible()
    })

    test('only the user who added the blog sees the blog\'s delete button', async ({ page, request }) => {
      await createBlog(page, 'blog not to delete', 'blog author1', 'www.blog.com')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'blog not to delete blog author1' })
      await page.getByRole('button', { name: 'log out' }).click()
      //Logged out
      await page.getByText('Logged out').click()
      await request.post('/api/users', {
        data: {
          name: 'Zhang Zhiyu',
          username: 'Zhiyu',
          password: 'mengmeng'
        }
      })
      await loginWith(page, 'Zhiyu', 'mengmeng')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('www.blog.com')).toBeVisible()
      const removeButton = blogDiv.getByRole('button', { name: 'remove' })
      await expect(removeButton).not.toBeVisible()
    })

    test.only('the blogs are arranged in the order according to the likes', async ({ page, request }) => {
      const blogNum = 3
      for (let i = 1; i < blogNum + 1; i++) {
        const blogTitle = `blog ${i}`
        await createBlog(page, blogTitle, 'blog author', 'www.blog.com')
        const blogDiv = page.locator('.blog', { has: page.getByText(`${blogTitle} blog author`) })
        await blogDiv.getByRole('button', { name: 'view' }).click()
        const likeButton = await blogDiv.getByRole('button', { name: 'like' })
        for (let j = 1; j < i + 1; j++) {
          await likeButton.click()
        }
        await blogDiv.getByRole('button', { name: 'hide' }).click()
      }

      const blogElements = page.locator('.blog')
      const blogCount = await blogElements.count()
      expect(blogCount).toBe(blogNum)

      const likesArray = []
      for (let i = 0; i < blogCount; i++) {
        const blogDiv = blogElements.nth(i)
        await blogDiv.getByRole('button', { name: 'view' }).click()
        const likesText = await blogDiv.locator('div').filter({ has: page.getByRole('button', { name: 'like' }) }).textContent()
        const likes = parseInt(likesText.match(/\d+/)[0], 10)
        likesArray.push(likes)
        await blogDiv.getByRole('button', { name: 'hide' }).click()
      }

      const sortedLikes = [...likesArray].sort((a, b) => b - a)
      expect(likesArray).toEqual(sortedLikes)
    })
  })
})
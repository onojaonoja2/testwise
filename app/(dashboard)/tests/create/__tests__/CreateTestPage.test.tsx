import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import CreateTestPage from '../page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('CreateTestPage', () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      push: jest.fn(),
    })
  })

  it('renders the create test page', () => {
    render(<CreateTestPage />)

    expect(screen.getByRole('heading', { name: /create new test/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/test title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create test/i })).toBeInTheDocument()
  })

  it('allows the user to fill out the form', () => {
    render(<CreateTestPage />)

    fireEvent.change(screen.getByLabelText(/test title/i), {
      target: { value: 'My new test' },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'This is a test' },
    })
    fireEvent.change(screen.getByLabelText(/duration/i), {
      target: { value: '30' },
    })

    expect(screen.getByLabelText(/test title/i)).toHaveValue('My new test')
    expect(screen.getByLabelText(/description/i)).toHaveValue('This is a test')
    expect(screen.getByLabelText(/duration/i)).toHaveValue(30)
  })
})

  it('allows the user to add and remove questions', async () => {
    render(<CreateTestPage />)

    const addQuestionButton = screen.getByRole('button', { name: /add question/i })
    fireEvent.click(addQuestionButton)

    const questions = await screen.findAllByLabelText(/question text/i)
    expect(questions).toHaveLength(2)

    const questionCards = screen.getAllByRole('heading', { name: /question/i }).map(h => h.parentElement.parentElement)
    const removeButton = within(questionCards[1]).getByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getAllByLabelText(/question text/i)).toHaveLength(1)
    })
  })

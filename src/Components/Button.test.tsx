import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByText('Click me'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply correct variant styles', () => {
    const { rerender } = render(<Button variant='primary'>Primary</Button>)
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700')

    rerender(<Button variant='secondary'>Secondary</Button>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200', 'text-gray-800', 'hover:bg-gray-300')

    rerender(<Button variant='danger'>Danger</Button>)
    expect(screen.getByText('Danger')).toHaveClass('text-red-600', 'hover:text-red-700', 'dark:text-red-400', 'dark:hover:text-red-300')

    rerender(<Button className='px-2'>None</Button>)
    expect(screen.getByText('None')).not.toHaveClass('bg-blue-600')
    expect(screen.getByText('None')).not.toHaveClass('bg-gray-200')
    expect(screen.getByText('None')).not.toHaveClass('text-red-600')

    //should have the inline custom classes
    expect(screen.getByText('None')).toHaveClass('px-2')
  })

  it('should disable button when disabled is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })

  it('should show loading state when loading is true', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
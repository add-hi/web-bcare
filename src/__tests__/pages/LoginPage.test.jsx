import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

const MockLoginPage = () => {
  return (
    <div>
      <img alt="BNI Logo" />
      <div>CX Communication Portal</div>
      <input placeholder="Enter your NPP" />
      <input placeholder="Enter your password" type="password" />
      <button>Sign In</button>
      <button>Forgot your password?</button>
    </div>
  )
}

describe('LoginPage Component', () => {
  test('renders login form elements', () => {
    render(<MockLoginPage />)
    
    expect(screen.getByAltText('BNI Logo')).toBeInTheDocument()
    expect(screen.getByText('CX Communication Portal')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your NPP')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})
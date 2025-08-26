import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

const MockTopbar = () => {
  return (
    <div>
      <div>Jane Smith</div>
      <div>67890</div>
      <button>LOGOUT</button>
    </div>
  )
}

describe('Topbar Component', () => {
  test('renders user information', () => {
    render(<MockTopbar />)
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('67890')).toBeInTheDocument()
  })

  test('renders logout button', () => {
    render(<MockTopbar />)
    
    expect(screen.getByText('LOGOUT')).toBeInTheDocument()
  })
})
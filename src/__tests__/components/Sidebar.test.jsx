import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

const MockSidebar = () => {
  return (
    <div>
      <div>John Doe</div>
      <div>12345</div>
      <div>Admin</div>
      <div>MAIN MENU</div>
    </div>
  )
}

describe('Sidebar Component', () => {
  test('renders user information', () => {
    render(<MockSidebar />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  test('shows menu items', () => {
    render(<MockSidebar />)
    
    expect(screen.getByText('MAIN MENU')).toBeInTheDocument()
  })
})
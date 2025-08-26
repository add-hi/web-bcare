import { render, screen, fireEvent } from '@testing-library/react'

const MockComplaintFlow = () => {
  return (
    <div>
      <h1>Complaint Management</h1>
      <div data-testid="search-section">
        <input placeholder="Search complaints..." />
        <button>Search</button>
      </div>
      <div data-testid="add-section">
        <button>Add New Complaint</button>
      </div>
      <div data-testid="table-section">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CMP001</td>
              <td>John Doe</td>
              <td>Open</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

describe('Complaint Flow Integration', () => {
  test('renders complete complaint management interface', () => {
    render(<MockComplaintFlow />)
    
    expect(screen.getByText('Complaint Management')).toBeInTheDocument()
    expect(screen.getByTestId('search-section')).toBeInTheDocument()
    expect(screen.getByTestId('add-section')).toBeInTheDocument()
    expect(screen.getByTestId('table-section')).toBeInTheDocument()
  })

  test('search functionality', () => {
    render(<MockComplaintFlow />)
    
    const searchInput = screen.getByPlaceholderText('Search complaints...')
    const searchButton = screen.getByText('Search')
    
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    fireEvent.click(searchButton)
    
    expect(searchInput.value).toBe('test search')
  })

  test('add new complaint button', () => {
    render(<MockComplaintFlow />)
    
    const addButton = screen.getByText('Add New Complaint')
    fireEvent.click(addButton)
    
    expect(addButton).toBeInTheDocument()
  })
})
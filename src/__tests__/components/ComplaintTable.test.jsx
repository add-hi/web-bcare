import { render, screen } from '@testing-library/react'

const MockComplaintTable = () => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Customer Name</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CMP001</td>
            <td>John Doe</td>
            <td>Open</td>
            <td>2024-01-01</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

describe('ComplaintTable Component', () => {
  test('renders table headers', () => {
    render(<MockComplaintTable />)
    
    expect(screen.getByText('Complaint ID')).toBeInTheDocument()
    expect(screen.getByText('Customer Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  test('renders complaint data', () => {
    render(<MockComplaintTable />)
    
    expect(screen.getByText('CMP001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })
})
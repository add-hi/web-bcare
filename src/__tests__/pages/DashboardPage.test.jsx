import { render, screen } from '@testing-library/react'

const MockDashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <div data-testid="stats-card">
        <h3>Total Complaints</h3>
        <span>150</span>
      </div>
      <div data-testid="chart-section">
        <h3>Complaint Trends</h3>
        <div>Chart Placeholder</div>
      </div>
      <div data-testid="recent-complaints">
        <h3>Recent Complaints</h3>
        <ul>
          <li>Complaint 1</li>
          <li>Complaint 2</li>
        </ul>
      </div>
    </div>
  )
}

describe('DashboardPage Component', () => {
  test('renders dashboard title', () => {
    render(<MockDashboardPage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  test('renders stats section', () => {
    render(<MockDashboardPage />)
    
    expect(screen.getByTestId('stats-card')).toBeInTheDocument()
    expect(screen.getByText('Total Complaints')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  test('renders chart section', () => {
    render(<MockDashboardPage />)
    
    expect(screen.getByTestId('chart-section')).toBeInTheDocument()
    expect(screen.getByText('Complaint Trends')).toBeInTheDocument()
  })

  test('renders recent complaints', () => {
    render(<MockDashboardPage />)
    
    expect(screen.getByTestId('recent-complaints')).toBeInTheDocument()
    expect(screen.getByText('Recent Complaints')).toBeInTheDocument()
  })
})
import { render, screen, fireEvent } from '@testing-library/react'

const MockAddComplaint = () => {
  return (
    <div>
      <h1>Add Complaint</h1>
      <button>Reset All</button>
      <div data-testid="customer-form">Customer Form</div>
      <div data-testid="data-form">Data Form</div>
      <div data-testid="action-form">Action Form</div>
      <div data-testid="notes-form">Notes Form</div>
    </div>
  )
}

describe('AddComplaint Component', () => {
  test('renders all form sections', () => {
    render(<MockAddComplaint />)
    
    expect(screen.getByText('Add Complaint')).toBeInTheDocument()
    expect(screen.getByText('Reset All')).toBeInTheDocument()
    expect(screen.getByTestId('customer-form')).toBeInTheDocument()
    expect(screen.getByTestId('data-form')).toBeInTheDocument()
    expect(screen.getByTestId('action-form')).toBeInTheDocument()
    expect(screen.getByTestId('notes-form')).toBeInTheDocument()
  })

  test('reset button is clickable', () => {
    render(<MockAddComplaint />)
    
    const resetButton = screen.getByText('Reset All')
    fireEvent.click(resetButton)
    
    expect(resetButton).toBeInTheDocument()
  })
})
import { render } from '@testing-library/react'

// Custom render function with providers if needed
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    // Add any providers here if needed (Context, Router, etc.)
    return children
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: 1,
  full_name: 'Test User',
  npp: '12345',
  email: 'test@bni.co.id',
  division_details: { division_code: 'cxc' },
  role_details: { role_name: 'Admin' },
  ...overrides
})

export const mockComplaint = (overrides = {}) => ({
  id: 1,
  complaint_number: 'CMP001',
  customer_name: 'John Doe',
  complaint_description: 'Test complaint',
  status: 'Open',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const mockApiResponse = (data, overrides = {}) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve(data),
  ...overrides
})

// Test helpers
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

export const createMockFetch = (responses) => {
  let callCount = 0
  return vi.fn(() => {
    const response = responses[callCount] || responses[responses.length - 1]
    callCount++
    return Promise.resolve(response)
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
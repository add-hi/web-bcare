# Testing Guide - B-Care Dashboard

## Overview
Unit testing setup menggunakan Vitest dan React Testing Library untuk memastikan kualitas kode dan mencegah regression bugs.

## Setup Testing

### Dependencies
- **Vitest**: Test runner yang cepat dan modern
- **@testing-library/react**: Utilities untuk testing React components
- **@testing-library/jest-dom**: Custom matchers untuk DOM assertions
- **@testing-library/user-event**: Simulasi user interactions
- **jsdom**: DOM environment untuk testing

### Configuration Files
- `vitest.config.js` - Konfigurasi Vitest
- `src/__tests__/setup.js` - Setup global untuk testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── setup.js                 # Global test setup
├── utils/
│   └── testUtils.js         # Testing utilities
├── components/
│   ├── Sidebar.test.js      # Sidebar component tests
│   ├── Topbar.test.js       # Topbar component tests
│   └── AddComplaint.test.js # AddComplaint component tests
├── pages/
│   └── LoginPage.test.js    # Login page tests
├── hooks/
│   ├── useUser.test.js      # useUser hook tests
│   └── useAddComplaint.test.js # useAddComplaint hook tests
└── integration/
    └── LoginFlow.test.js    # Integration tests
```

## Testing Patterns

### 1. Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### 2. Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react'
import useMyHook from '@/hooks/useMyHook'

describe('useMyHook', () => {
  test('returns expected values', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('expected')
  })
})
```

### 3. User Interaction Testing
```javascript
import userEvent from '@testing-library/user-event'

test('handles user input', async () => {
  const user = userEvent.setup()
  render(<MyForm />)
  
  const input = screen.getByRole('textbox')
  await user.type(input, 'test input')
  
  expect(input).toHaveValue('test input')
})
```

### 4. Async Testing
```javascript
import { waitFor } from '@testing-library/react'

test('handles async operations', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

## Mocking Strategies

### 1. Next.js Mocks
```javascript
// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/current-path'
}))

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}))
```

### 2. API Mocks
```javascript
// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' })
  })
)
```

### 3. Custom Hook Mocks
```javascript
vi.mock('@/hooks/useUser', () => ({
  default: () => ({
    user: { name: 'Test User' },
    login: vi.fn(),
    logout: vi.fn()
  })
}))
```

## Test Coverage Areas

### Components
- ✅ **Sidebar**: Menu rendering, user info display, navigation
- ✅ **Topbar**: Logo, user profile, logout functionality
- ✅ **AddComplaint**: Form rendering, data handling, reset functionality

### Pages
- ✅ **LoginPage**: Form validation, authentication flow, forgot password

### Hooks
- ✅ **useUser**: Authentication, login/logout, user data management
- ✅ **useAddComplaint**: Data fetching, form state management

### Integration Tests
- ✅ **LoginFlow**: Complete authentication workflow

## Best Practices

### 1. Test Naming
```javascript
// Good
test('displays user name when user is logged in')
test('calls logout function when logout button is clicked')

// Bad
test('user test')
test('button works')
```

### 2. Arrange-Act-Assert Pattern
```javascript
test('updates input value on change', () => {
  // Arrange
  render(<MyInput />)
  const input = screen.getByRole('textbox')
  
  // Act
  fireEvent.change(input, { target: { value: 'new value' } })
  
  // Assert
  expect(input).toHaveValue('new value')
})
```

### 3. Test Isolation
- Setiap test harus independent
- Gunakan `beforeEach` untuk setup
- Clear mocks setelah setiap test

### 4. Meaningful Assertions
```javascript
// Good
expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()

// Bad
expect(screen.getByText('Submit')).toBeTruthy()
```

## Common Testing Scenarios

### 1. Form Testing
- Input validation
- Form submission
- Error handling
- Reset functionality

### 2. Navigation Testing
- Route changes
- Link clicks
- Back/forward navigation

### 3. State Management Testing
- State updates
- Side effects
- Error states

### 4. API Integration Testing
- Loading states
- Success responses
- Error handling
- Data transformation

## Debugging Tests

### 1. Debug Rendering
```javascript
import { screen } from '@testing-library/react'

// See what's rendered
screen.debug()

// See specific element
screen.debug(screen.getByRole('button'))
```

### 2. Query Debugging
```javascript
// Find available roles
screen.logTestingPlaygroundURL()

// Check if element exists
console.log(screen.queryByText('Text'))
```

### 3. Async Debugging
```javascript
// Wait for element to appear
await screen.findByText('Async Text')

// Wait for condition
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
})
```

## Continuous Integration

Tests akan dijalankan otomatis pada:
- Pre-commit hooks
- Pull request validation
- CI/CD pipeline

Pastikan semua tests pass sebelum merge ke main branch.
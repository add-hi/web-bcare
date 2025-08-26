import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: (props) => {
    return 'img'
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
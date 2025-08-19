// src/__tests__/components/Profile.test.js
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// --- mock hook useAuth ---
vi.mock('@/hooks/useUser', () => ({
  __esModule: true,
  default: vi.fn(),
}))
import useAuth from '@/hooks/useUser'

// --- komponen yang dites ---
import Profile from '@/app/dashboard/profile/page'

describe('Profile page', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('menampilkan loading saat status=loading atau user belum ada', () => {
    useAuth.mockReturnValue({ user: null, status: 'loading' })
    render(<Profile />)
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument()
  })

  test('menampilkan data user lengkap dan foto dari user.picture', () => {
    useAuth.mockReturnValue({
      status: 'authenticated',
      user: {
        full_name: 'Alice Jones',
        npp: 'NPP-777',
        email: 'alice@corp.com',
        role_details: { role_name: 'Manager' },
        picture: '/pic.png',
      },
    })

    render(<Profile />)

    // Name, NPP, Email, Role
    expect(screen.getByText('Alice Jones')).toBeInTheDocument()
    expect(screen.getByText('NPP-777')).toBeInTheDocument()
    expect(screen.getByText('alice@corp.com')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()

    // Image pakai picture user
    const img = screen.getByRole('img', { name: /Alice Jones/i })
    expect(img).toHaveAttribute('src', '/pic.png')
  })

  test('mapping fallback: name→email, id→id, role→role, dan foto fallback /images/profile.jpg', () => {
    useAuth.mockReturnValue({
      status: 'authenticated',
      user: {
        // tidak ada full_name / name -> fallback ke email
        email: 'user@x.com',
        // tidak ada npp -> pakai id
        id: 'EMP-123',
        // tidak ada role_details -> pakai role
        role: 'Staff',
        // tidak ada picture -> fallback default
      },
    })

    render(<Profile />)

    // 'user@x.com' muncul 2x (sebagai Name & Email) -> gunakan getAllByText untuk hindari multiple error
    expect(screen.getAllByText('user@x.com').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('EMP-123')).toBeInTheDocument()
    expect(screen.getByText('Staff')).toBeInTheDocument()

    // img fallback
    const img = screen.getByRole('img', { name: /user@x\.com/i })
    expect(img).toHaveAttribute('src', '/images/profile.jpg')
  })
})

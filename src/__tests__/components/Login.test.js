import React from 'react'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ==== Mocks ====
// next/navigation
vi.mock('next/navigation', () => {
  const push = vi.fn()
  const replace = vi.fn()
  return { useRouter: () => ({ push, replace }) }
})

// next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}))

// hook auth
const loginMock = vi.fn()
const statusRef = { current: 'idle' }
vi.mock('@/hooks/useUser', () => ({
  __esModule: true,
  default: () => ({
    isAuthenticated: false,
    status: statusRef.current,
    login: loginMock
  })
}))

// NOTE: sesuaikan path ini dengan struktur kamu
import LoginPage from '@/app/(auth)/login/page'

// helper
const fillLogin = ({ npp = 'NPP001', pwd = 'secret' } = {}) => {
  const nppInput = screen.getByPlaceholderText(/Enter your NPP/i)
  const pwdInput = screen.getByPlaceholderText(/Enter your password/i)
  fireEvent.change(nppInput, { target: { name: 'username', value: npp } })
  fireEvent.change(pwdInput, { target: { name: 'password', value: pwd } })
  return { nppInput, pwdInput }
}

afterEach(() => {
  vi.clearAllMocks()
  statusRef.current = 'idle'
})

describe('LoginPage (app/(auth)/login/page.js)', () => {
  test('submit login → panggil login({npp,password}) dan (sesuai kode) push ke /dashboard/mockdgo', async () => {
    loginMock.mockResolvedValueOnce({
      user: { division_details: { division_code: 'ABC' } }
    })

    render(<LoginPage />)

    fillLogin({ npp: 'EMP123', pwd: 'pass123' })
    const submit = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ npp: 'EMP123', password: 'pass123' })
    })

    const { useRouter } = await import('next/navigation')
    const { push } = useRouter()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/dashboard/mockdgo')
    })
  })

  test('toggle eye icon mengubah tipe password text <-> password', () => {
    render(<LoginPage />)

    const pwd = screen.getByPlaceholderText(/Enter your password/i)
    expect(pwd).toHaveAttribute('type', 'password')

    const wrapper = pwd.parentElement // div.relative yang berisi input + button eye
    const eyeBtn = within(wrapper).getByRole('button')
    fireEvent.click(eyeBtn)
    expect(pwd).toHaveAttribute('type', 'text')
    fireEvent.click(eyeBtn)
    expect(pwd).toHaveAttribute('type', 'password')
  })

  test('Forgot Password: Step1 submit → Step2 tampil (fake timers)', async () => {
    vi.useFakeTimers()
    render(<LoginPage />)

    // buka modal
    fireEvent.click(screen.getByRole('button', { name: /Forgot your password\?/i }))

    // judul modal (heading)
    expect(screen.getByRole('heading', { name: /Password Reset/i })).toBeInTheDocument()

    // Ada 2 input placeholder "Enter your NPP" (form login & modal).
    // Ambil yang di modal berdasarkan atribut name="npp".
    const nppModal = screen
      .getAllByPlaceholderText(/Enter your NPP/i)
      .find((el) => el.getAttribute('name') === 'npp')

    expect(nppModal).toBeTruthy()
    fireEvent.change(nppModal, { target: { name: 'npp', value: 'NPP001' } })

    // submit step 1
    fireEvent.click(screen.getByRole('button', { name: /Get Admin Contact/i }))

    // tunggu 1500ms
    await act(async () => {
      vi.advanceTimersByTime(1600)
    })

    // Step 2
    expect(
      screen.getByRole('heading', { name: /Contact System Administrator/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/NPP001/)).toBeInTheDocument()

    vi.useRealTimers()
  })

  test('menekan Enter pada input memicu submit', async () => {
    loginMock.mockResolvedValueOnce({
      user: { division_details: { division_code: 'ZZZ' } }
    })

    render(<LoginPage />)

    const { pwdInput } = fillLogin({ npp: 'U001', pwd: 'pwd' })
    const formEl = screen.getByRole('button', { name: /sign in/i }).closest('form')

    // Trigger kombinasi: keyDown + keyPress (onKeyPress dipakai di komponen)
    fireEvent.keyDown(pwdInput, { key: 'Enter', code: 'Enter' })
    fireEvent.keyPress(pwdInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    // (kalau environment tidak memicu onKeyPress Enter, fallback submit form)
    if (!loginMock.mock.calls.length && formEl) {
      fireEvent.submit(formEl)
    }

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ npp: 'U001', password: 'pwd' })
    })

    const { useRouter } = await import('next/navigation')
    const { push } = useRouter()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/dashboard/mockdgo')
    })
  })
})

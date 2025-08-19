// src/__tests__/pages/Complaint.page.test.js
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// --- Mock child components so we don't depend on their internals ---
vi.mock('@/components/form/ComplaintList', () => ({
  default: () => <div data-testid="complaint-list">Mock ComplaintList</div>,
}))
vi.mock('@/components/ComplaintTable', () => ({
  default: () => <div data-testid="complaint-table">Mock ComplaintTable</div>,
}))

// ⚠️ Sesuaikan path ini jika struktur berbeda
import ComplaintPage from '@/app/dashboard/complaint/page'

describe('Complaint Page (app/dashboard/complaint/page.js)', () => {
  test('default tab "List Agent" aktif dan render ComplaintList', () => {
    render(<ComplaintPage />)

    // dua tombol tab tersedia
    const agentTab = screen.getByRole('button', { name: /List Agent/i })
    const eskalasiTab = screen.getByRole('button', { name: /List Eskalasi/i })
    expect(agentTab).toBeInTheDocument()
    expect(eskalasiTab).toBeInTheDocument()

    // default content = ComplaintList
    expect(screen.getByTestId('complaint-list')).toBeInTheDocument()
    expect(screen.queryByTestId('complaint-table')).not.toBeInTheDocument()
  })

  test('klik tab "List Eskalasi" menampilkan ComplaintTable dan menyembunyikan ComplaintList', () => {
    render(<ComplaintPage />)

    // pindah tab
    fireEvent.click(screen.getByRole('button', { name: /List Eskalasi/i }))

    // content berubah
    expect(screen.getByTestId('complaint-table')).toBeInTheDocument()
    expect(screen.queryByTestId('complaint-list')).not.toBeInTheDocument()
  })

  test('bolak-balik tab: eskalasi -> agent', () => {
    render(<ComplaintPage />)

    // ke Eskalasi
    fireEvent.click(screen.getByRole('button', { name: /List Eskalasi/i }))
    expect(screen.getByTestId('complaint-table')).toBeInTheDocument()
    expect(screen.queryByTestId('complaint-list')).not.toBeInTheDocument()

    // kembali ke Agent
    fireEvent.click(screen.getByRole('button', { name: /List Agent/i }))
    expect(screen.getByTestId('complaint-list')).toBeInTheDocument()
    expect(screen.queryByTestId('complaint-table')).not.toBeInTheDocument()
  })
})

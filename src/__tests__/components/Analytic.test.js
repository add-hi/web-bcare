// src/__tests__/components/Analytic.test.js
import React from 'react'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// ==== Mock Recharts agar tidak gagal di JSDOM ====
vi.mock('recharts', () => {
  const React = require('react')
  const Box = ({ children }) => <div data-testid="recharts-mock">{children}</div>
  const Cell = (props) => <div data-testid="recharts-cell" {...props} />
  return {
    ResponsiveContainer: Box,
    BarChart: Box,
    LineChart: Box,
    PieChart: Box,
    CartesianGrid: Box,
    XAxis: Box,
    YAxis: Box,
    Tooltip: Box,
    Bar: Box,
    Line: Box,
    Pie: Box,
    Cell,
  }
})

// ==== Sesuaikan path komponen di bawah ini ====
import Analytic from '@/app/dashboard/analytic/page'

// helper: ambil kontrol (input/textarea/select) di <div> yang sama dengan <label> tertentu
const getControlNextToLabel = (labelRegex, tagName /* 'input' | 'textarea' | 'select' */) => {
  const all = screen.getAllByText(labelRegex)
  const labelEl = all.find((el) => el.tagName.toLowerCase() === 'label') || all[0]
  if (!labelEl) throw new Error('Label not found: ' + labelRegex)
  const container = labelEl.closest('div')
  const el = container?.querySelector(tagName)
  if (!el) throw new Error(`Control <${tagName}> not found next to label: ` + labelRegex)
  return el
}

beforeAll(() => {
  // hindari popup di test
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('Analytic', () => {
  test('Overview default: KPI tampil sesuai sample data', async () => {
    render(<Analytic />)

    // data di-set via useEffect; tunggu render selesai
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Dashboard Customer Service/i }),
      ).toBeInTheDocument(),
    )

    // Total Complaints = 5
    const totalCard = screen.getByText(/Total Complaints/i).closest('div')
    expect(within(totalCard).getByText('5')).toBeInTheDocument()

    // Open Issues = 2
    const openCard = screen.getByText(/Open Issues/i).closest('div')
    expect(within(openCard).getByText('2')).toBeInTheDocument()

    // Resolved = 2
    const resolvedCard = screen.getByText(/^Resolved$/i).closest('div')
    expect(within(resolvedCard).getByText('2')).toBeInTheDocument()

    // Avg Rating = 4.5  (ratings 4 & 5)
    const avgCard = screen.getByText(/Avg Rating/i).closest('div')
    expect(within(avgCard).getByText('4.5')).toBeInTheDocument()
  })

  test('Complaints tab: filter & ubah status (Mark Resolved) bekerja', async () => {
    render(<Analytic />)
    // buka tab Complaints
    fireEvent.click(screen.getByRole('button', { name: /Complaints/i }))

    // tunggu list muncul (heading salah satu complaint)
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /Aplikasi sering crash/i }),
      ).toBeInTheDocument(),
    )

    // Filter: Open => harusnya 2 items (Aplikasi sering crash, Promo tidak berlaku)
    const statusSelect = screen.getByRole('combobox')
    fireEvent.change(statusSelect, { target: { value: 'open' } })

    const h3sOpen = screen.getAllByRole('heading', { level: 3 })
    expect(h3sOpen.length).toBe(2)
    expect(
      screen.getByRole('heading', { name: /Aplikasi sering crash/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Promo tidak berlaku/i }),
    ).toBeInTheDocument()

    // Kembalikan ke 'all' dulu supaya kartu tidak hilang setelah di-resolve
    fireEvent.change(statusSelect, { target: { value: 'all' } })

    // Ambil kartu "Aplikasi sering crash", klik "Mark Resolved", status berubah
    const title = screen.getByRole('heading', { name: /Aplikasi sering crash/i })
    const flexRow = title.closest('div').parentElement // div.flex-1 -> parent flex row
    const card = flexRow.parentElement // container card

    // awalnya ada chip "open" di kartu itu
    expect(within(card).getByText(/open/i)).toBeInTheDocument()

    // klik tombol "Mark Resolved" di kartu itu
    fireEvent.click(
      within(card).getByRole('button', { name: /Mark Resolved/i }),
    )

    // sekarang chip "resolved" muncul dan tombol aksi hilang
    await waitFor(() => {
      expect(within(card).getByText(/resolved/i)).toBeInTheDocument()
    })
    expect(
      within(card).queryByRole('button', { name: /Mark Resolved/i }),
    ).not.toBeInTheDocument()
    expect(
      within(card).queryByRole('button', { name: /Mark In Progress/i }),
    ).not.toBeInTheDocument()
  })

  test('Submit Complaint: isi form → submit → alert terpanggil & item baru muncul di list', async () => {
    render(<Analytic />)

    // buka tab Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit Complaint/i }))
    expect(
      screen.getByRole('heading', { name: /Submit New Complaint/i }),
    ).toBeInTheDocument()

    // ===== ambil field TANPA getByLabelText (karena label tidak terasosiasi langsung) =====
    const titleInput   = getControlNextToLabel(/^Title$/i, 'input')
    const descInput    = getControlNextToLabel(/^Description$/i, 'textarea')
    const prioritySel  = getControlNextToLabel(/^Priority$/i, 'select')
    const categorySel  = getControlNextToLabel(/^Category$/i, 'select')

    fireEvent.change(titleInput, { target: { value: 'Mesin error saat checkout' } })
    fireEvent.change(descInput,  { target: { value: 'Stacktrace muncul ketika klik bayar' } })
    fireEvent.change(prioritySel, { target: { value: 'high' } })
    fireEvent.change(categorySel, { target: { value: 'payment' } })

    // submit (scope ke kartu form supaya tidak kena tombol tab)
    const formCard = screen
      .getByRole('heading', { name: /Submit New Complaint/i })
      .closest('div')
    const submitBtn = within(formCard).getByRole('button', {
      name: /^Submit Complaint$/i,
    })
    fireEvent.click(submitBtn)

    expect(window.alert).toHaveBeenCalled()

    // pindah ke Complaints dan cek item baru ada (total = 6 dan judul baru ketemu)
    fireEvent.click(screen.getByRole('button', { name: /Complaints/i }))

    await waitFor(() => {
      const allH3 = screen.getAllByRole('heading', { level: 3 })
      expect(allH3.length).toBe(6)
    })
    expect(
      screen.getByRole('heading', { name: /Mesin error saat checkout/i }),
    ).toBeInTheDocument()

    // pastikan status default item baru = open
    const newCardHeading = screen.getByRole('heading', {
      name: /Mesin error saat checkout/i,
    })
    const flexRow = newCardHeading.closest('div').parentElement
    const card = flexRow.parentElement
    expect(within(card).getByText(/open/i)).toBeInTheDocument()
  })
})

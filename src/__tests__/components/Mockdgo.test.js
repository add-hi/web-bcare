// src/__tests__/components/Mockdgo.test.js
import React from 'react'
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import DivisionComplaintHandler from '@/app/dashboard/mockdgo/page'

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DivisionComplaintHandler (app/dashboard/mockdgo/page.js)', () => {
  test('List view default: header, cards, dan jumlah baris tampil benar', () => {
    render(<DivisionComplaintHandler />)

    expect(
      screen.getByRole('heading', { name: /My Complaint Queue/i }),
    ).toBeInTheDocument()

    const totalCard = screen.getByText(/Total Assigned/i).closest('div')
    expect(within(totalCard).getByText('5')).toBeInTheDocument()

    const inProgressCard = screen.getByText(/In Progress/i).closest('div')
    expect(within(inProgressCard).getByText('4')).toBeInTheDocument()

    // "Completed" ada di card & juga badge tabel → ambil elemen <p> milik card
    const completedLabelP = screen
      .getAllByText(/^Completed$/i)
      .find((el) => el.tagName.toLowerCase() === 'p')
    const completedCard = completedLabelP.closest('div')
    expect(within(completedCard).getByText('1')).toBeInTheDocument()

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.length).toBe(5)
  })

  test('Sorting: klik sort di kolom Date mengurutkan asc → desc', () => {
    render(<DivisionComplaintHandler />)

    const thDate = screen.getByText(/^Date$/i).closest('th')
    // Di header ada 2 button (sort & filter) → ambil yang pertama (sort)
    const [sortBtn] = within(thDate).getAllByRole('button')

    // Klik 1: ASC → tanggal paling awal di atas
    fireEvent.click(sortBtn)
    let firstRowDate =
      screen.getAllByRole('row')[1].querySelectorAll('td')[1].textContent
    expect(firstRowDate).toBe('08/08/2025')

    // Klik 2: DESC → tanggal paling baru di atas
    fireEvent.click(sortBtn)
    firstRowDate =
      screen.getAllByRole('row')[1].querySelectorAll('td')[1].textContent
    expect(firstRowDate).toBe('12/08/2025')
  })

  test('Filtering: Status=Completed → 1 entri; Clear All Filters → kembali 5 entri', () => {
    render(<DivisionComplaintHandler />)

    const thStatus = screen.getByText(/^Status$/i).closest('th')
    const [, filterBtn] = within(thStatus).getAllByRole('button') // tombol ke-2 = filter
    fireEvent.click(filterBtn)

    const searchInput = screen.getByPlaceholderText(/Search\.\.\./i)
    const dropdownRoot = searchInput.closest('div').parentElement.parentElement

    const completedLabel = within(dropdownRoot)
      .getByText(/^Completed$/i)
      .closest('label')
    fireEvent.click(completedLabel)

    fireEvent.click(within(dropdownRoot).getByRole('button', { name: /Apply/i }))

    const filteredRows = screen.getAllByRole('row').slice(1)
    expect(filteredRows.length).toBe(1)

    const clearAll = screen.getByRole('button', { name: /Clear All Filters/i })
    fireEvent.click(clearAll)

    const allRows = screen.getAllByRole('row').slice(1)
    expect(allRows.length).toBe(5)
  })

  test(
    'Klik baris → detail view, modal Mark as Done (mock setTimeout tertarget), dan Add Note memicu alert',
    async () => {
      render(<DivisionComplaintHandler />)

      // Masuk detail view
      fireEvent.click(screen.getByText('123456778'))
      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: /Handle Complaint - 123456778/i }),
        ).toBeInTheDocument(),
      )

      // Buka modal
      fireEvent.click(screen.getByRole('button', { name: /Mark as Done/i }))
      expect(screen.getByText(/Mark Complaint as Done/i)).toBeInTheDocument()

      // Patch setTimeout HANYA untuk delay >= 1900ms (punya komponen) → percepat jadi 0ms.
      const realSetTimeout = global.setTimeout
      const stSpy = vi
        .spyOn(global, 'setTimeout')
        .mockImplementation((cb, delay, ...args) => {
          if (typeof delay === 'number' && delay >= 1900) {
            // jalankan callback secepatnya tapi tetap lewat timer asli agar tidak bentrok dgn RTL waitFor
            return realSetTimeout(() => cb?.(...args), 0)
          }
          return realSetTimeout(cb, delay, ...args)
        })

      // Isi optional note dan Confirm
      fireEvent.change(
        screen.getByPlaceholderText(/Enter any additional notes/i),
        { target: { value: 'Ok done' } },
      )
      fireEvent.click(screen.getByRole('button', { name: /Confirm/i }))

      // Modal harus tertutup
      await waitFor(() =>
        expect(
          screen.queryByText(/Mark Complaint as Done/i),
        ).not.toBeInTheDocument(),
      )

      // Pulihkan setTimeout spy
      stSpy.mockRestore()

      // Add Division Note → alert
      fireEvent.change(screen.getByPlaceholderText(/Add your note here/i), {
        target: { value: 'catatan division' },
      })
      const addBtn = screen.getByRole('button', { name: /Add Note/i })
      expect(addBtn).toBeEnabled()
      fireEvent.click(addBtn)

      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/Note added successfully/i),
      )
    },
    20000,
  )
})

// src/__tests__/components/ComplaintTable.test.js
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import ComplaintTable from '../../components/ComplaintTable'

/* helpers */
const getHeaderCell = (label) => {
  const headers = screen.getAllByRole('columnheader')
  const th = headers.find(h => within(h).queryByText(new RegExp(`^${label}$`, 'i')))
  if (!th) throw new Error(`Header "${label}" not found`)
  return th
}
const clickSortOn = (label) => {
  const th = getHeaderCell(label)
  const [sortBtn] = within(th).getAllByRole('button') // [0]=sort, [1]=filter
  fireEvent.click(sortBtn)
}
const openFilterOn = (label) => {
  const th = getHeaderCell(label)
  const btns = within(th).getAllByRole('button')
  const filterBtn = btns[btns.length - 1] // tombol paling kanan = filter
  fireEvent.click(filterBtn)
}
const firstBodyRow = () => document.querySelector('tbody tr')

describe('ComplaintTable', () => {
  test('render table & header info', () => {
    render(<ComplaintTable />)
    ;['Date','Ticket #','Status','Customer','Channel','Category','SLA','Account #','Current Unit']
      .forEach(lbl => expect(getHeaderCell(lbl)).toBeInTheDocument())
    expect(screen.getAllByText(/Showing 5 of 5 entries/i).length).toBeGreaterThan(0)
  })

  test('sorting: klik sort pada Date → urutan berubah (asc lalu desc)', () => {
    render(<ComplaintTable />)
    clickSortOn('Date')
    expect(within(firstBodyRow()).getByText('08/08/2025')).toBeInTheDocument()
    clickSortOn('Date')
    expect(within(firstBodyRow()).getByText('12/08/2025')).toBeInTheDocument()
  })

  test('filter Channel=ATM → chip muncul & jumlah berubah; Clear All Filters menghapus', () => {
    render(<ComplaintTable />)

    openFilterOn('Channel')

    // Pilih opsi "ATM" dari dropdown filter (cari node yang berada DI DALAM <label>)
    const atmSpan = screen.getAllByText(/^ATM$/i).find(el => el.closest('label'))
    const atmCheckbox = atmSpan.closest('label').querySelector('input[type="checkbox"]')
    fireEvent.click(atmCheckbox)

    // Apply pada popup filter
    fireEvent.click(screen.getByRole('button', { name: /^Apply$/i }))

    expect(screen.getByText(/Channel:/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Showing 2 of 5 entries/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Clear All Filters/i }))
    expect(screen.getAllByText(/Showing 5 of 5 entries/i).length).toBeGreaterThan(0)
  })

  test('filter tanggal (Specific Date 2025-08-10) → tampil 1 of 5 & chip Date Specific', () => {
    render(<ComplaintTable />)

    openFilterOn('Date')

    // Container dropdown tanggal
    const dd = screen.getByText(/Filter by Date/i).closest('div')

    // Pilih radio "Specific Date" dengan aksesibel role
    const specificRadio = within(dd).getByRole('radio', { name: /Specific Date/i })
    fireEvent.click(specificRadio)

    // Isi input date untuk "Select Date"
    const selectDateLabel = within(dd).getByText(/^Select Date$/i)
    const dateInput = selectDateLabel.parentElement.querySelector('input[type="date"]')
    fireEvent.change(dateInput, { target: { value: '2025-08-10' } })

    fireEvent.click(within(dd).getByRole('button', { name: /Apply Filter/i }))

    expect(screen.getByText(/Date:/i)).toBeInTheDocument()
    expect(screen.getByText(/Specific:\s*2025-08-10/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Showing 1 of 5 entries/i).length).toBeGreaterThan(0)
  })

  test('row click → masuk Detail; klik Attachments → masuk view lampiran; Back ke Detail lalu Back ke Table', () => {
    render(<ComplaintTable />)

    fireEvent.click(screen.getByText('123456778').closest('tr'))
    expect(screen.getByRole('heading', { level: 2, name: /Complaint Detail - 123456778/i }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Attachments/i }))
    expect(screen.getByRole('button', { name: /Back to Detail|Back to List/i }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Back to Detail|Back to List/i }))
    expect(screen.getByRole('heading', { level: 2, name: /Complaint Detail - 123456778/i }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Back to Table/i }))
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0)
  })
})

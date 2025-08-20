// src/__tests__/components/AddComplaint.test.js
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Ganti path jika berbeda
import AddComplaint from '../../components/AddComplaint'

// util: ambil <select> yang berada dalam container <div> yang sama dengan <label> berteks tertentu
const getSelectByLooseLabel = (labelRegex) => {
  const candidates = screen.getAllByText(labelRegex)
  const labelEl =
    candidates.find((el) => el.tagName.toLowerCase() === 'label') ||
    candidates[0]
  if (!labelEl) throw new Error('Label not found for ' + labelRegex)
  const container = labelEl.closest('div')
  const select = container?.querySelector('select')
  return select
}

describe('AddComplaint', () => {
  test('render section heading > menampilkan judul Customer Info, Data, Notes, Action', () => {
    render(<AddComplaint />)

    // Hindari bentrok: target H2 saja
    expect(
      screen.getByRole('heading', { level: 2, name: /^Customer Info$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /^Data$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /^Notes$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /^Action$/i })
    ).toBeInTheDocument()

    // Indikasi InputFormRow: jangan getByText (bisa nabrak <option>), cukup pastikan ada label "Input Type"
    const inputTypeTexts = screen.getAllByText(/^Input Type/i)
    expect(
      inputTypeTexts.some((el) => el.tagName.toLowerCase() === 'label')
    ).toBe(true)
  })

  test('InputFormRow – alur pemilihan & field dinamis > memilih Nasabah → Source Type aktif → pilih Debit → muncul Exp Date & label berubah', () => {
    render(<AddComplaint />)

    // Pilih Input Type = Nasabah
    const inputTypeSelect = getSelectByLooseLabel(/^Input Type/i)
    expect(inputTypeSelect).toBeInTheDocument()
    fireEvent.change(inputTypeSelect, { target: { value: 'nasabah' } })

    // Setelah Nasabah, Source Type enable
    const sourceTypeSelect = getSelectByLooseLabel(/^Source Type/i)
    expect(sourceTypeSelect).toBeEnabled()

    // Pilih Debit → Exp Date muncul & label berubah jadi "Debit Card Number"
    fireEvent.change(sourceTypeSelect, { target: { value: 'debit' } })
    expect(screen.getByText(/^Exp Date$/i)).toBeInTheDocument()
    // Exact match untuk menghindari "List Debit Card Number"
    expect(
      screen.getByText(/^Debit Card Number(\s*\*)?$/i)
    ).toBeInTheDocument()

    // Ganti ke Account → Exp Date hilang & label kembali "Number"
    fireEvent.change(sourceTypeSelect, { target: { value: 'account' } })
    expect(screen.queryByText(/^Exp Date$/i)).not.toBeInTheDocument()
    expect(screen.getByText(/^Number(\s*\*)?$/i)).toBeInTheDocument()
  })

  test('InputFormRow – alur pemilihan & field dinamis > state awal: Input Type belum dipilih → Source Type disabled', () => {
    render(<AddComplaint />)
    const sourceTypeSelect = getSelectByLooseLabel(/^Source Type/i)
    expect(sourceTypeSelect).toBeDisabled()
  })

  test('CustomerInfo & DataForm – smoke check beberapa field > label penting terlihat & kontrol ada di container yang sama', () => {
    render(<AddComplaint />)

    // Customer Info: Gender → label & <select> di container yang sama
    const genderLabel =
      screen.getAllByText(/^Gender/i).find((el) => el.tagName.toLowerCase() === 'label') ||
      screen.getAllByText(/^Gender/i)[0]
    expect(genderLabel).toBeInTheDocument()
    expect(genderLabel.closest('div')?.querySelector('select')).toBeTruthy()

    // Customer Info: Address → label & <textarea>
    const addressLabel =
      screen.getAllByText(/^Address/i).find((el) => el.tagName.toLowerCase() === 'label') ||
      screen.getAllByText(/^Address/i)[0]
    expect(addressLabel).toBeInTheDocument()
    expect(addressLabel.closest('div')?.querySelector('textarea')).toBeTruthy()

    // DataForm: Commited Date (type=date)
    const commited = screen.getByText(/Commited Date/i)
    expect(commited.closest('div')?.querySelector('input[type="date"]')).toBeTruthy()

    // DataForm: Service (select)
    const service = screen.getByText(/^Service$/i)
    expect(service.closest('div')?.querySelector('select')).toBeTruthy()
  })

  test('ActionForm – field kondisional & save > Action=Closed → "Solution"; Action=Decline → "Reason"; Save memanggil console.log', () => {
    render(<AddComplaint />)

    // Ambil select Action via label container (hindari bentrok dengan H2)
    const actionSelect = getSelectByLooseLabel(/^Action$/i)
    expect(actionSelect).toBeInTheDocument()

    // Closed → Solution muncul
    fireEvent.change(actionSelect, { target: { value: 'Closed' } })
    expect(screen.getByText(/^Solution$/i)).toBeInTheDocument()

    // Decline → Reason muncul, Solution hilang
    fireEvent.change(actionSelect, { target: { value: 'Decline' } })
    expect(screen.getByText(/^Reason$/i)).toBeInTheDocument()
    expect(screen.queryByText(/^Solution$/i)).not.toBeInTheDocument()

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))

    // Verifikasi argumen log: [ "Saving data:", { action: 'Decline', ... } ]
    expect(spy).toHaveBeenCalled()
    const [msg, payload] = spy.mock.calls[0]
    expect(msg).toMatch(/Saving data:/i)
    expect(payload).toMatchObject({ action: 'Decline' })
    spy.mockRestore()
  })

  test('NotesForm – tambah catatan > input textarea lalu klik Add Note → item bertambah & textarea kosong', async () => {
    vi.useFakeTimers()
    render(<AddComplaint />)

    expect(screen.getByText(/0 messages/i)).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText(/Add your communication note here/i)
    fireEvent.change(textarea, { target: { value: 'Catatan baru' } })
    fireEvent.click(screen.getByRole('button', { name: /Add Note/i }))

    await act(async () => {
      vi.advanceTimersByTime(600)
    })

    expect(screen.getByText(/1 messages/i)).toBeInTheDocument()
    expect(textarea).toHaveValue('')
    vi.useRealTimers()
  })

  test('NotesForm – empty state > tombol DEV: Load Mock Data menampilkan 2 note contoh', () => {
    render(<AddComplaint />)
    const devBtn = screen.getByRole('button', { name: /DEV: Load Mock Data/i })
    fireEvent.click(devBtn)

    expect(screen.getByText(/Complaint received/i)).toBeInTheDocument()
    expect(screen.getByText(/Initial review/i)).toBeInTheDocument()
    expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
  })
})

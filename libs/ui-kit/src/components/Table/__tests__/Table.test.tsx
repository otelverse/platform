import { render, screen } from '@testing-library/react'
import { Table } from '../Table'

const data = [
  { name: 'Alice', role: 'Engineer' },
  { name: 'Bob', role: 'Designer' },
]

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
]

describe('Table', () => {
  it('renders column headers and data rows', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})

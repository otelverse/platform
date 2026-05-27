import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RoboticsDashboardPage } from './RoboticsDashboardPage'

jest.mock('@otelverse/ui-kit', () => ({
  Card: ({ title, children }: any) => <div data-testid="card">{title}{children}</div>,
  Table: ({ data }: any) => <div data-testid="table">{data.map((r: any) => <div key={r.name} onClick={r._onClick}>{r.name}{r.status}</div>)}</div>,
  Spinner: () => <div data-testid="spinner" />,
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}))

describe('RoboticsDashboardPage', () => {
  it('renders dashboard with simulations', () => {
    render(<RoboticsDashboardPage />)
    
    expect(screen.getByText('Robotics & IoT Simulator')).toBeInTheDocument()
    expect(screen.getByText('TurtleBot3 Env')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('selects a robot and shows digital twin correlation', () => {
    render(<RoboticsDashboardPage />)
    
    // Not selected initially
    expect(screen.queryByText('Digital Twin Correlation: sim-1')).not.toBeInTheDocument()
    
    // Click on row (sim-1)
    const row = screen.getByText('TurtleBot3 Env')
    fireEvent.click(row)
    
    expect(screen.getByText('Digital Twin Correlation: sim-1')).toBeInTheDocument()
    expect(screen.getByText('gazebo.physics.step')).toBeInTheDocument()
  })
})

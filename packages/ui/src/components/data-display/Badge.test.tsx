import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Active')).toHaveClass('bg-primary')
  })

  it('renders different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-foreground')

    rerender(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-success')
  })

  it('renders dot indicator when dot prop is true', () => {
    render(<Badge dot>Status</Badge>)
    const dot = screen.getByText('Status').querySelector('[aria-hidden="true"]')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveClass('animate-pulse')
  })

  it('does not render dot when dot prop is false', () => {
    render(<Badge>No Dot</Badge>)
    const dot = screen.getByText('No Dot').querySelector('[aria-hidden="true"]')
    expect(dot).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Styled</Badge>)
    expect(screen.getByText('Styled')).toHaveClass('custom-badge')
  })
  it('soft appearance keeps the variant colour as text, outline and tint', () => {
    render(<Badge variant="info" appearance="soft">2 days</Badge>)
    const chip = screen.getByText('2 days')
    expect(chip).toHaveClass('text-info', 'border-info/40', 'bg-info/10')
    expect(chip).not.toHaveClass('bg-info')
    expect(chip.style.color).toContain('--color-info')
    expect(chip.style.backgroundColor).toContain('color-mix')
  })

  it('solid stays the default appearance', () => {
    render(<Badge variant="warning">Solid</Badge>)
    expect(screen.getByText('Solid')).toHaveClass('bg-warning')
    expect(screen.getByText('Solid')).not.toHaveClass('bg-warning/10')
  })

  it('soft has no effect on the outline variant', () => {
    render(<Badge variant="outline" appearance="soft">Plain</Badge>)
    expect(screen.getByText('Plain')).toHaveClass('text-foreground')
  })
})

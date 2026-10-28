import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { HeroBlock } from './Hero'

describe('HeroBlock', () => {
  // jsdom has no IntersectionObserver; framer-motion's whileInView needs one.
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    })
  })

  it('renders a CTA with href as a link to that href', () => {
    render(<HeroBlock headline="H" description="D" primaryCta={{ label: 'Log in', href: '/login' }} secondaryCta={{ label: 'Docs', href: '/docs' }} />)
    expect(screen.getByRole('link', { name: /Log in/ })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('renders a CTA without href as a button that calls onClick', () => {
    const onClick = vi.fn()
    render(<HeroBlock headline="H" description="D" primaryCta={{ label: 'Start', onClick }} />)
    fireEvent.click(screen.getByRole('button', { name: /Start/ }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

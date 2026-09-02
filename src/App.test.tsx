import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/api/items')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      }

      if (url.includes('/api/bids')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    }) as typeof fetch;
  });

  it('renders the public showroom for guest users', async () => {
    render(<App />);

    expect(await screen.findByText(/rare pieces/i)).toBeInTheDocument();
    expect(screen.getAllByText(/fitcheck/i).length).toBeGreaterThan(0);
  });

  it('shows a helpful empty state when a search has no matches', async () => {
    render(<App />);

    const searchInput = await screen.findByLabelText(/search vintage garments/i);
    fireEvent.change(searchInput, { target: { value: 'zzzz-not-a-real-item' } });

    expect(await screen.findByText(/no pieces match your search/i)).toBeInTheDocument();
  });
});

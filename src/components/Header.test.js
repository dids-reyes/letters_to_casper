import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Header from './Header';

// Mock typewriter-effect since it uses timers/DOM manipulations
jest.mock('typewriter-effect', () => () => <div data-testid="mock-typewriter" />);

describe('Header component', () => {
  it('renders search input with placeholder and search icon', () => {
    render(
      <Header
        searchTerm=""
        handleSearchChange={jest.fn()}
        handleClearSearch={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search for your name or a letter');
    expect(input).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /clear search/i})).not.toBeInTheDocument();
  });

  it('shows clear button when searchTerm is non-empty', () => {
    render(
      <Header
        searchTerm="Casper"
        handleSearchChange={jest.fn()}
        handleClearSearch={jest.fn()}
      />
    );

    const clearButton = screen.getByRole('button', {name: /clear search/i});
    expect(clearButton).toBeInTheDocument();
  });

  it('calls handleClearSearch and focuses input when clear button is clicked', () => {
    const handleClearSearch = jest.fn();
    const handleSearchChange = jest.fn();

    render(
      <Header
        searchTerm="Casper"
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for your name or a letter');
    const clearButton = screen.getByRole('button', {name: /clear search/i});

    fireEvent.click(clearButton);

    expect(handleClearSearch).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
  });

  it('falls back to handleSearchChange with empty string if handleClearSearch is not provided', () => {
    const handleSearchChange = jest.fn();

    render(
      <Header
        searchTerm="Casper"
        handleSearchChange={handleSearchChange}
      />
    );

    const input = screen.getByPlaceholderText('Search for your name or a letter');
    const clearButton = screen.getByRole('button', {name: /clear search/i});

    fireEvent.click(clearButton);

    expect(handleSearchChange).toHaveBeenCalledWith(
      expect.objectContaining({target: {value: ''}})
    );
    expect(document.activeElement).toBe(input);
  });

  it('clears search when Escape key is pressed in the input', () => {
    const handleClearSearch = jest.fn();

    render(
      <Header
        searchTerm="Casper"
        handleSearchChange={jest.fn()}
        handleClearSearch={handleClearSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for your name or a letter');
    fireEvent.keyDown(input, {key: 'Escape'});

    expect(handleClearSearch).toHaveBeenCalledTimes(1);
  });

  it('does not trigger clear on Escape key if search is already empty', () => {
    const handleClearSearch = jest.fn();

    render(
      <Header
        searchTerm=""
        handleSearchChange={jest.fn()}
        handleClearSearch={handleClearSearch}
      />
    );

    const input = screen.getByPlaceholderText('Search for your name or a letter');
    fireEvent.keyDown(input, {key: 'Escape'});

    expect(handleClearSearch).not.toHaveBeenCalled();
  });

  it('keeps both full and compact logos mounted with fixed dimensions so switching is instant without reloading', () => {
    const {container, rerender} = render(
      <Header
        searchTerm=""
        handleSearchChange={jest.fn()}
        handleClearSearch={jest.fn()}
        isCompact={false}
      />
    );

    const fullLogo = container.querySelector('.logo--full');
    const compactLogo = container.querySelector('.logo--compact-mark');

    expect(fullLogo).toBeInTheDocument();
    expect(compactLogo).toBeInTheDocument();
    expect(fullLogo).toHaveAttribute('width', '400');
    expect(fullLogo).toHaveAttribute('height', '70');
    expect(fullLogo).toHaveAttribute('decoding', 'sync');
    expect(compactLogo).toHaveAttribute('width', '48');
    expect(compactLogo).toHaveAttribute('height', '48');
    expect(compactLogo).toHaveAttribute('decoding', 'sync');

    expect(fullLogo).not.toHaveAttribute('hidden');
    expect(compactLogo).toHaveAttribute('hidden');
    expect(screen.getByAltText('Letters to Casper')).toBe(fullLogo);

    const initialFullSrc = fullLogo.getAttribute('src');
    const initialCompactSrc = compactLogo.getAttribute('src');

    rerender(
      <Header
        searchTerm=""
        handleSearchChange={jest.fn()}
        handleClearSearch={jest.fn()}
        isCompact={true}
      />
    );

    expect(container.querySelector('.logo--full')).toBe(fullLogo);
    expect(container.querySelector('.logo--compact-mark')).toBe(compactLogo);
    expect(fullLogo.getAttribute('src')).toBe(initialFullSrc);
    expect(compactLogo.getAttribute('src')).toBe(initialCompactSrc);
    expect(fullLogo).toHaveAttribute('hidden');
    expect(compactLogo).not.toHaveAttribute('hidden');
    expect(screen.getByAltText('Letters to Casper')).toBe(compactLogo);
  });
});


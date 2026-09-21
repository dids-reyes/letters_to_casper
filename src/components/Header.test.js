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
});


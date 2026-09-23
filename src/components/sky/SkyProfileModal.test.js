import React, { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SkyProfileModal from './SkyProfileModal';
import * as avatarModule from './avatar';

describe('SkyProfileModal', () => {
  test('renders modal with title, subtitle, and disabled submit button initially', () => {
    render(<SkyProfileModal onSubmit={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: /Create Your Temporary Profile/i })).toBeInTheDocument();
    expect(screen.getByText(/This is a temporary profile for this session only/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Step Into the Sky/i });
    expect(submitBtn).toBeDisabled();
  });

  test('validates username, age, and gender before enabling submission', () => {
    const handleSubmit = jest.fn();
    render(<SkyProfileModal onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Step Into the Sky/i });
    const usernameInput = screen.getByLabelText(/Username/i);
    const ageInput = screen.getByLabelText(/Age/i);
    const maleBtn = screen.getByRole('radio', { name: 'Male' });

    // Fill in username
    fireEvent.change(usernameInput, { target: { value: 'Orion' } });
    expect(submitBtn).toBeDisabled();

    // Fill in invalid age (< 13)
    fireEvent.change(ageInput, { target: { value: '12' } });
    fireEvent.click(maleBtn);
    expect(submitBtn).toBeDisabled();

    // Fix age to valid (13-99)
    fireEvent.change(ageInput, { target: { value: '25' } });
    expect(submitBtn).toBeEnabled();

    // Submit form
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'Orion',
      age: 25,
      gender: 'male',
      avatar: null,
      status: '',
    });
  });

  test('supports non-binary gender icon and optional avatar upload', async () => {
    jest.spyOn(avatarModule, 'processTemporaryAvatar').mockResolvedValue('data:image/webp;base64,mockAvatar');

    const handleSubmit = jest.fn();
    const { container } = render(<SkyProfileModal onSubmit={handleSubmit} />);

    const usernameInput = screen.getByLabelText(/Username/i);
    const ageInput = screen.getByLabelText(/Age/i);
    const nonBinaryBtn = screen.getByRole('radio', { name: 'Non-binary' });
    const fileInput = container.querySelector('input[type="file"]');

    fireEvent.change(usernameInput, { target: { value: 'StarGazer' } });
    fireEvent.change(ageInput, { target: { value: '19' } });
    fireEvent.click(nonBinaryBtn);

    // Upload avatar
    const fakeFile = new File(['pixels'], 'me.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    await waitFor(() => {
      expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', 'data:image/webp;base64,mockAvatar');
    });

    const submitBtn = screen.getByRole('button', { name: /Step Into the Sky/i });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'StarGazer',
      age: 19,
      gender: 'non-binary',
      avatar: 'data:image/webp;base64,mockAvatar',
      status: '',
    });

    avatarModule.processTemporaryAvatar.mockRestore();
  });

  test('loads an avatar preview under React Strict Mode', async () => {
    jest.spyOn(avatarModule, 'processTemporaryAvatar').mockResolvedValue('data:image/webp;base64,strictAvatar');

    const { container } = render(
      <StrictMode>
        <SkyProfileModal onSubmit={jest.fn()} />
      </StrictMode>
    );
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File(['pixels'], 'strict.png', { type: 'image/png' })] },
    });

    await waitFor(() => {
      expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', 'data:image/webp;base64,strictAvatar');
    });

    avatarModule.processTemporaryAvatar.mockRestore();
  });

  test('renders pixel-perfect vector GenderSymbol SVGs for male, female, and non-binary', () => {
    const { container } = render(<SkyProfileModal onSubmit={jest.fn()} />);
    const maleSvg = container.querySelector('.sky-gender-btn[aria-label="Male"] svg');
    const femaleSvg = container.querySelector('.sky-gender-btn[aria-label="Female"] svg');
    const nonBinarySvg = container.querySelector('.sky-gender-btn[aria-label="Non-binary"] svg');

    expect(maleSvg).toBeInTheDocument();
    expect(femaleSvg).toBeInTheDocument();
    expect(nonBinarySvg).toBeInTheDocument();

    expect(maleSvg).toHaveAttribute('width', '20');
    expect(femaleSvg).toHaveAttribute('width', '20');
    expect(nonBinarySvg).toHaveAttribute('width', '20');
  });

  test('pre-fills initialData and allows closing via close button or Escape key', () => {
    const handleClose = jest.fn();
    const handleSubmit = jest.fn();
    const initialData = {
      username: 'Nova',
      age: 22,
      gender: 'female',
      avatar: null,
      status: 'peaceful',
    };

    render(<SkyProfileModal onSubmit={handleSubmit} onClose={handleClose} initialData={initialData} />);

    // Pre-filled values
    expect(screen.getByLabelText(/Username/i)).toHaveValue('Nova');
    expect(screen.getByLabelText(/Age/i)).toHaveValue(22);
    expect(screen.getByRole('radio', { name: 'Female' })).toHaveAttribute('aria-checked', 'true');

    // Close button dismisses modal
    const closeBtn = screen.getByRole('button', { name: 'Close profile editor' });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Pressing Escape also closes
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

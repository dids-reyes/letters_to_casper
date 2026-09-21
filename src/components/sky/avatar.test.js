import { GENDER_ICONS, VALID_GENDERS, processTemporaryAvatar } from './avatar';

describe('avatar module & processTemporaryAvatar', () => {
  test('defines valid gender options and icons', () => {
    expect(VALID_GENDERS).toEqual(['male', 'female', 'non-binary']);
    expect(GENDER_ICONS.male).toBe('♂');
    expect(GENDER_ICONS.female).toBe('♀');
    expect(GENDER_ICONS['non-binary']).toBe('⚧');
  });

  test('rejects non-image files with clear error message', async () => {
    const textFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    await expect(processTemporaryAvatar(textFile)).rejects.toThrow('Please upload a valid image file.');
  });

  test('compresses and crops valid image file using HTML5 canvas', async () => {
    // Mock canvas and context
    const mockDrawImage = jest.fn();
    const mockToDataURL = jest.fn().mockReturnValue('data:image/webp;base64,sampleCompressedAvatarData');
    const mockGetContext = jest.fn().mockReturnValue({
      drawImage: mockDrawImage,
    });

    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName.toLowerCase() === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: mockGetContext,
          toDataURL: mockToDataURL,
        };
      }
      return originalCreateElement(tagName);
    });

    // Mock Image load
    const originalImage = global.Image;
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.width = 400;
          this.height = 300;
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const imageFile = new File(['fake-bytes'], 'avatar.png', { type: 'image/png' });
    const result = await processTemporaryAvatar(imageFile);

    expect(result).toBe('data:image/webp;base64,sampleCompressedAvatarData');
    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockDrawImage).toHaveBeenCalled();

    // Restore mocks
    document.createElement.mockRestore();
    global.Image = originalImage;
  });

  test('rejects image if payload exceeds 70,000 characters limit even after second compression', async () => {
    const hugePayload = 'data:image/jpeg;base64,' + 'A'.repeat(75000);
    const mockToDataURL = jest.fn().mockReturnValue(hugePayload);
    const mockGetContext = jest.fn().mockReturnValue({ drawImage: jest.fn() });

    jest.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName.toLowerCase() === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: mockGetContext,
          toDataURL: mockToDataURL,
        };
      }
      return document.createElement(tagName);
    });

    const originalImage = global.Image;
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.width = 1000;
          this.height = 1000;
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const imageFile = new File(['huge-bytes'], 'huge.jpg', { type: 'image/jpeg' });
    await expect(processTemporaryAvatar(imageFile)).rejects.toThrow('Image payload too large. Choose another image.');

    document.createElement.mockRestore();
    global.Image = originalImage;
  });
});


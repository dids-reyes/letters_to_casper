export const GENDER_ICONS = {
  male: '♂',
  female: '♀',
  'non-binary': '⚧',
};

export const VALID_GENDERS = ['male', 'female', 'non-binary'];

/**
 * Compresses and center-crops an uploaded avatar image file to a 128x128px square.
 * Enforces a strict < 50 KB (~70,000 base64 chars) payload size limit.
 *
 * @param {File} file
 * @returns {Promise<string>} base64 data URL
 */
export async function processTemporaryAvatar(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const TARGET_SIZE = 128;
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // 1:1 square center-crop
          const minEdge = Math.min(img.width, img.height);
          const sourceX = (img.width - minEdge) / 2;
          const sourceY = (img.height - minEdge) / 2;

          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            minEdge,
            minEdge,
            0,
            0,
            TARGET_SIZE,
            TARGET_SIZE
          );

          // Convert to lightweight WebP (fallback to JPEG if unsupported)
          let base64 = canvas.toDataURL('image/webp', 0.75);
          if (!base64.startsWith('data:image/webp')) {
            base64 = canvas.toDataURL('image/jpeg', 0.75);
          }

          // Hard payload check (< 50 KB / ~70,000 chars)
          if (base64.length > 70000) {
            base64 = canvas.toDataURL('image/jpeg', 0.5);
            if (base64.length > 70000) {
              reject(new Error('Image payload too large. Choose another image.'));
              return;
            }
          }

          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to parse image.'));
      img.src = event.target?.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}


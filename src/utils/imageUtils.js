/** @format */

// Helper to convert different image representations from backend
// into a URL usable in `background-image: url(...)` in browser.
const computeImageUrl = (img) => {
  if (!img) return null;
  try {
    // if already a usable URL or data URL
    if (typeof img === 'string') {
      if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/')) {
        return img;
      }
      // assume raw base64 string
      return `data:image/jpeg;base64,${img}`;
    }

    // buffer-like object { data: [...] }
    if (img.data && Array.isArray(img.data)) {
      try {
        const bytes = img.data;
        const uint8 = new Uint8Array(bytes);

        // Try to decode bytes as UTF-8 text (some backends store a data URL string inside a Buffer)
        try {
          const text = typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(uint8) : null;
          if (text) {
            // if the decoded text looks like a data URL or an URL, return it
            if (text.startsWith('data:') || text.startsWith('http') || text.startsWith('/')) {
              return text;
            }
            // if it contains base64 payload but without data: prefix, try to normalize
            if (text.indexOf('base64,') !== -1) {
              // likely already a data URL-like string
              return text;
            }
          }
        } catch (e) {
          // fall through to treating as binary
        }

        // treat as binary image bytes -> create blob URL
        const blob = new Blob([uint8], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      } catch (e) {
        return null;
      }
    }

    // nested structures
    if (typeof img === 'object') {
      if (img.image) return computeImageUrl(img.image);
      if (img.buffer && img.buffer.data) return computeImageUrl(img.buffer.data);
    }
  } catch (e) {
    return null;
  }
  return null;
};

export default computeImageUrl;

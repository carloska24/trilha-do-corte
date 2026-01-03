export const getOptimizedImageUrl = (
  url: string | null | undefined,
  width: number = 200,
  height: number = 200,
  fit: 'crop' | 'fill' | 'scale' = 'fill'
): string => {
  if (!url) return '';

  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Find the insertion point (after /upload/)
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const prefix = url.substring(0, uploadIndex + 8); // include '/upload/'
    const suffix = url.substring(uploadIndex + 8);

    // Construct transformation string
    // f_auto: auto format (webp/avif)
    // q_auto: auto quality
    // c_{fit}: crop mode
    const mutation = `w_${width},h_${height},c_${fit},f_auto,q_auto`;

    return `${prefix}${mutation}/${suffix}`;
  }

  // Return original for non-cloudinary images (or implement other providers if needed)
  return url;
};

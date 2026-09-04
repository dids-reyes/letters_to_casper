export const getOptimizedPhotoUrl = (url, width = 1200) => {
  if (!url || !url.includes('/image/upload/')) return url;

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto:eco,c_limit,w_${width}/`,
  );
};

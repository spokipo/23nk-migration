// src/lib/imageUtils.ts (или src/utils/imageUtils.ts)

/**
 * Превращает сырую ссылку Wix в оптимизированную картинку.
 * @param url Исходная ссылка (wix:image://...)
 * @param width Ширина (по умолчанию 1200)
 * @param height Высота (по умолчанию 1200)
 */
export const getOptimizedWixImage = (url?: string | null, width: number = 1200, height: number = 1200) => {
  if (!url) return '';
  
  if (url.startsWith('wix:image://v1/')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)/);
    if (match) {
      const fileName = match[1];
      // Просим Wix сжать фотку, отформатировать в WebP (enc_auto) и установить качество 85%
      return `https://static.wixstatic.com/media/${fileName}/v1/fit/w_${width},h_${height},al_c,q_85,enc_auto/${fileName}`;
    }
  }
  
  // Если это обычная ссылка (не Wix), просто возвращаем её
  return url;
};

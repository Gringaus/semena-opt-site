export interface CompressedImage {
  base64: string;
  dataUrl: string;
  filename: string;
  contentType: string;
}

const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export async function compressImage(file: File): Promise<CompressedImage> {
  const isJpegLike = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!isJpegLike) {
    return fileToDataUrl(file);
  }

  try {
    const img = await loadImage(file);
    const { width, height } = fitSize(img.naturalWidth, img.naturalHeight, MAX_SIDE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return fileToDataUrl(file);
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl: string = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('compress failed'));
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    });

    const base64 = dataUrl.split(',')[1] || '';
    const safeName = file.name.replace(/\.(png|webp|jpeg|jpg)$/i, '') + '.jpg';
    return { base64, dataUrl, filename: safeName, contentType: 'image/jpeg' };
  } catch {
    return fileToDataUrl(file);
  }
}

function fitSize(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const k = w > h ? max / w : max / h;
  return { width: Math.round(w * k), height: Math.round(h * k) };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function fileToDataUrl(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, dataUrl, filename: file.name, contentType: file.type || 'application/octet-stream' });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

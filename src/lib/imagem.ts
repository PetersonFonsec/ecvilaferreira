import type { Imagem } from '@/lib/types';

const larguras = [400, 640, 960, 1280, 1600];

/** Imagens do Prismic são servidas pelo imgix, que redimensiona e converte via parâmetros na URL. */
const ehPrismic = (url: string) => url.includes('images.prismic.io');

export function urlImagem(img: Imagem, params: Record<string, string | number>) {
  if (!ehPrismic(img.url)) return img.url;
  const url = new URL(img.url);
  for (const [chave, valor] of Object.entries(params)) url.searchParams.set(chave, String(valor));
  return url.toString();
}

export function srcsetImagem(img: Imagem, params: Record<string, string | number> = {}) {
  if (!ehPrismic(img.url)) return undefined;
  return larguras
    .filter((w) => !img.width || w <= img.width)
    .map((w) => `${urlImagem(img, { ...params, w, auto: 'format,compress' })} ${w}w`)
    .join(', ');
}

/** Imagem 1200×630 para Open Graph (WhatsApp, Facebook, X). */
export const imagemCompartilhamento = (img: Imagem) =>
  urlImagem(img, { w: 1200, h: 630, fit: 'crop', fm: 'jpg', q: 70 });

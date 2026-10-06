import { quandoVisivel } from './movimento';

/**
 * Divide o texto de um elemento em palavras (<span class="palavra"><span>…</span></span>),
 * mantendo os espaços como texto para que leitores de tela leiam a frase normalmente.
 * Só mexe em elementos que contêm apenas texto.
 */
export function dividirEmPalavras(el: HTMLElement) {
  if (el.dataset.dividido || el.children.length > 0) return [];
  const texto = el.textContent ?? '';
  el.textContent = '';
  const palavras: HTMLElement[] = [];
  texto
    .trim()
    .split(/(\s+)/)
    .forEach((parte) => {
      if (/^\s+$/.test(parte)) {
        el.append(' ');
        return;
      }
      const externo = document.createElement('span');
      externo.className = 'palavra';
      const interno = document.createElement('span');
      interno.textContent = parte;
      externo.style.setProperty('--i', String(palavras.length));
      externo.append(interno);
      el.append(externo);
      palavras.push(externo);
    });
  el.dataset.dividido = 'true';
  return palavras;
}

/**
 * Revela elementos ao entrarem na tela:
 * - [data-revelar]: sobe e aparece (as variações ficam no CSS: "grupo", "mascara", "zoom"...).
 * - [data-dividir]: títulos que entram palavra por palavra.
 * - .ilustracao: os traços se desenham.
 */
export function iniciarRevelar(animar: boolean) {
  const alvos = document.querySelectorAll<HTMLElement>('[data-revelar], [data-dividir], .ilustracao');

  if (animar) {
    document.querySelectorAll<HTMLElement>('[data-dividir]').forEach(dividirEmPalavras);
  }

  document.querySelectorAll<HTMLElement>('[data-revelar="grupo"]').forEach((grupo) => {
    Array.from(grupo.children).forEach((filho, i) => (filho as HTMLElement).style.setProperty('--i', String(i)));
  });

  if (!animar) {
    alvos.forEach((el) => el.classList.add('revelado'));
    return;
  }

  const observador = quandoVisivel(
    alvos,
    (el, visivel) => {
      if (!visivel) return;
      el.classList.add('revelado');
      observador.unobserve(el);
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );
}

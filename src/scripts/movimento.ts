/** Utilidades compartilhadas pelos efeitos de movimento. */

export const reduzMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Mouse ou trackpad (não toque). Só nesses casos faz sentido seguir o cursor. */
export const ponteiroFino = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export const limitar = (valor: number, min = 0, max = 1) => Math.min(max, Math.max(min, valor));

export const interpolar = (de: number, para: number, fator: number) => de + (para - de) * fator;

/** Interpolação independente da taxa de quadros: `fator` é o quanto anda em 1/60 s. */
export const suavizar = (de: number, para: number, fator: number, deltaMs: number) =>
  interpolar(de, para, 1 - Math.pow(1 - fator, deltaMs / (1000 / 60)));

type Tique = (tempo: number, deltaMs: number) => void;

const tiques = new Set<Tique>();
let rodando = false;
let anterior = 0;

function quadro(tempo: number) {
  const delta = Math.min(tempo - anterior, 64);
  anterior = tempo;
  for (const tique of tiques) tique(tempo, delta);
  requestAnimationFrame(quadro);
}

/** Um único requestAnimationFrame para todos os efeitos. Devolve a função que cancela. */
export function aCadaQuadro(tique: Tique) {
  tiques.add(tique);
  if (!rodando) {
    rodando = true;
    anterior = performance.now();
    requestAnimationFrame(quadro);
  }
  return () => tiques.delete(tique);
}

/** Observa quando elementos entram e saem da tela. */
export function quandoVisivel(
  elementos: Iterable<Element>,
  aoMudar: (elemento: Element, visivel: boolean) => void,
  opcoes: IntersectionObserverInit = {},
) {
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) aoMudar(entrada.target, entrada.isIntersecting);
  }, opcoes);
  for (const el of elementos) observador.observe(el);
  return observador;
}

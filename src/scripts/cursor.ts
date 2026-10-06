import { aCadaQuadro, suavizar } from './movimento';

const SELETOR_INTERATIVO = 'a, button, summary, label, [data-cursor], input[type="submit"]';

/**
 * Cursor próprio: um ponto dourado que segue o mouse na hora e um anel que vem atrás, suave.
 * Em links o anel cresce; em elementos com data-cursor="Texto" ele vira um selo com o texto.
 */
export function iniciarCursor() {
  const raiz = document.createElement('div');
  raiz.className = 'cursor';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = '<div class="cursor__anel"><span class="cursor__rotulo"></span></div><div class="cursor__ponto"></div>';
  document.body.append(raiz);

  const anel = raiz.querySelector<HTMLElement>('.cursor__anel')!;
  const ponto = raiz.querySelector<HTMLElement>('.cursor__ponto')!;
  const rotulo = raiz.querySelector<HTMLElement>('.cursor__rotulo')!;

  const alvo = { x: innerWidth / 2, y: innerHeight / 2 };
  const anelPos = { ...alvo };
  let apareceu = false;

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      alvo.x = e.clientX;
      alvo.y = e.clientY;
      if (!apareceu) {
        apareceu = true;
        anelPos.x = alvo.x;
        anelPos.y = alvo.y;
        raiz.classList.add('cursor--visivel');
      }
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => raiz.classList.remove('cursor--visivel'));
  document.addEventListener('pointerenter', () => apareceu && raiz.classList.add('cursor--visivel'));
  addEventListener('pointerdown', () => raiz.classList.add('cursor--pressionado'));
  addEventListener('pointerup', () => raiz.classList.remove('cursor--pressionado'));

  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest<HTMLElement>(SELETOR_INTERATIVO);
    const texto = el?.dataset.cursor ?? '';
    raiz.classList.toggle('cursor--link', Boolean(el) && !texto);
    raiz.classList.toggle('cursor--rotulo', Boolean(texto));
    raiz.classList.toggle('cursor--escuro', Boolean((e.target as Element).closest('[data-cursor-escuro]')));
    if (texto) rotulo.textContent = texto;
  });

  aCadaQuadro((_, delta) => {
    anelPos.x = suavizar(anelPos.x, alvo.x, 0.2, delta);
    anelPos.y = suavizar(anelPos.y, alvo.y, 0.2, delta);
    ponto.style.transform = `translate3d(${alvo.x}px, ${alvo.y}px, 0)`;
    anel.style.transform = `translate3d(${anelPos.x}px, ${anelPos.y}px, 0)`;
  });

  document.documentElement.classList.add('cursor-proprio');
}

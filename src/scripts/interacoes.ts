import { aCadaQuadro, limitar, quandoVisivel, suavizar } from './movimento';
import { velocidadeRolagem } from './rolagem';
import { dividirEmPalavras } from './revelar';

/** [data-parallax="0.2"]: o elemento anda mais devagar (ou mais rápido, se negativo) que a rolagem. */
export function iniciarParallax() {
  const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!elementos.length) return;
  const visiveis = new Set<HTMLElement>();
  quandoVisivel(elementos, (el, v) => (v ? visiveis.add(el as HTMLElement) : visiveis.delete(el as HTMLElement)), {
    rootMargin: '20% 0px',
  });
  const deslocamento = new WeakMap<HTMLElement, number>();
  aCadaQuadro(() => {
    for (const el of visiveis) {
      const atual = deslocamento.get(el) ?? 0;
      const caixa = el.getBoundingClientRect();
      const centro = caixa.top - atual + caixa.height / 2 - innerHeight / 2;
      const y = -centro * Number(el.dataset.parallax || 0.15);
      deslocamento.set(el, y);
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    }
  });
}

/** [data-magnetico]: botões que são "puxados" pelo cursor quando ele chega perto. */
export function iniciarMagnetico() {
  document.querySelectorAll<HTMLElement>('[data-magnetico]').forEach((el) => {
    const forca = Number(el.dataset.magnetico || 0.35);
    const alvo = { x: 0, y: 0 };
    const atual = { x: 0, y: 0 };
    let cancelar: (() => void) | null = null;

    const animar = () => {
      cancelar ??= aCadaQuadro((_, delta) => {
        atual.x = suavizar(atual.x, alvo.x, 0.18, delta);
        atual.y = suavizar(atual.y, alvo.y, 0.18, delta);
        el.style.transform = `translate3d(${atual.x.toFixed(2)}px, ${atual.y.toFixed(2)}px, 0)`;
        if (alvo.x === 0 && alvo.y === 0 && Math.abs(atual.x) + Math.abs(atual.y) < 0.1) {
          el.style.transform = '';
          cancelar?.();
          cancelar = null;
        }
      });
    };

    el.addEventListener('pointermove', (e) => {
      const caixa = el.getBoundingClientRect();
      alvo.x = (e.clientX - (caixa.left + caixa.width / 2)) * forca;
      alvo.y = (e.clientY - (caixa.top + caixa.height / 2)) * forca;
      animar();
    });
    el.addEventListener('pointerleave', () => {
      alvo.x = 0;
      alvo.y = 0;
      animar();
    });
  });
}

/** [data-inclinar]: cards que inclinam em 3D na direção do cursor, com um brilho dourado. */
export function iniciarInclinar() {
  document.querySelectorAll<HTMLElement>('[data-inclinar]').forEach((el) => {
    const max = Number(el.dataset.inclinar || 6);
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const caixa = el.getBoundingClientRect();
      const x = (e.clientX - caixa.left) / caixa.width;
      const y = (e.clientY - caixa.top) / caixa.height;
      el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      el.classList.add('inclinado');
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('inclinado');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/** [data-contar]: números que contam de zero até o valor quando aparecem. O valor final já está no HTML. */
export function iniciarContadores() {
  const elementos = document.querySelectorAll<HTMLElement>('[data-contar]');
  const observador = quandoVisivel(
    elementos,
    (alvo, visivel) => {
      if (!visivel) return;
      observador.unobserve(alvo);
      const el = alvo as HTMLElement;
      const final = Number(el.dataset.contar);
      const duracao = 1800;
      const inicio = performance.now();
      const cancelar = aCadaQuadro((tempo) => {
        const t = limitar((tempo - inicio) / duracao);
        const suave = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = String(Math.round(final * suave));
        if (t === 1) cancelar();
      });
    },
    { threshold: 0.6 },
  );
}

/** [data-letreiro]: faixa de texto infinita que acelera e muda de sentido conforme a rolagem. */
export function iniciarLetreiros() {
  document.querySelectorAll<HTMLElement>('[data-letreiro]').forEach((letreiro) => {
    const faixa = letreiro.querySelector<HTMLElement>('.letreiro__faixa');
    if (!faixa) return;
    const base = Number(letreiro.dataset.letreiro || 1);
    let x = 0;
    let sentido = 1;
    let visivel = true;
    quandoVisivel([letreiro], (_, v) => (visivel = v));
    letreiro.classList.add('letreiro--js');
    aCadaQuadro((_, delta) => {
      if (!visivel) return;
      const vel = velocidadeRolagem();
      if (Math.abs(vel) > 0.5) sentido = Math.sign(vel);
      x -= (0.045 * delta + Math.abs(vel) * 0.6) * sentido * base;
      const metade = faixa.scrollWidth / 2;
      if (metade > 0) x = ((x % metade) + metade) % metade - metade;
      faixa.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    });
  });
}

/** [data-acender]: um parágrafo grande cujas palavras acendem uma a uma conforme a rolagem. */
export function iniciarAcender() {
  document.querySelectorAll<HTMLElement>('[data-acender]').forEach((el) => {
    const palavras = dividirEmPalavras(el);
    if (!palavras.length) return;
    el.classList.add('acender--js');
    let visivel = false;
    quandoVisivel([el], (_, v) => (visivel = v));
    aCadaQuadro(() => {
      if (!visivel) return;
      const caixa = el.getBoundingClientRect();
      const progresso = limitar((innerHeight * 0.85 - caixa.top) / (caixa.height + innerHeight * 0.2));
      const acesas = progresso * palavras.length;
      palavras.forEach((p, i) => p.style.setProperty('--luz', limitar(acesas - i).toFixed(3)));
    });
  });
}

/**
 * [data-horizontal]: em telas largas, a seção "trava" e o conteúdo anda para o lado enquanto se rola para baixo.
 * No celular ou com movimento reduzido, os itens ficam empilhados normalmente.
 */
export function iniciarHorizontal() {
  const telaLarga = matchMedia('(min-width: 64rem) and (min-height: 40rem)');
  document.querySelectorAll<HTMLElement>('[data-horizontal]').forEach((secao) => {
    const trilho = secao.querySelector<HTMLElement>('.horizontal__trilho');
    if (!trilho) return;
    let distancia = 0;

    const medir = () => {
      const ativo = telaLarga.matches;
      secao.classList.toggle('horizontal--ativo', ativo);
      if (!ativo) {
        secao.style.height = '';
        trilho.style.transform = '';
        return;
      }
      distancia = Math.max(0, trilho.scrollWidth - innerWidth);
      secao.style.height = `${distancia + innerHeight}px`;
    };
    medir();
    addEventListener('resize', medir);
    addEventListener('load', medir); // imagens e fontes podem mudar a largura do trilho
    telaLarga.addEventListener('change', medir);

    // Quem navega pelo teclado: ao focar um item escondido à direita, rola até ele.
    trilho.addEventListener('focusin', (e) => {
      if (!secao.classList.contains('horizontal--ativo')) return;
      const item = (e.target as Element).closest<HTMLElement>('.horizontal__item');
      if (!item) return;
      const fracao = limitar(item.offsetLeft / Math.max(1, trilho.scrollWidth - innerWidth));
      scrollTo({ top: secao.offsetTop + fracao * distancia, behavior: 'instant' });
    });

    aCadaQuadro(() => {
      if (!secao.classList.contains('horizontal--ativo')) return;
      const caixa = secao.getBoundingClientRect();
      if (caixa.bottom < 0 || caixa.top > innerHeight) return;
      const progresso = limitar(-caixa.top / Math.max(1, caixa.height - innerHeight));
      trilho.style.transform = `translate3d(${(-progresso * distancia).toFixed(2)}px, 0, 0)`;
      secao.style.setProperty('--progresso', progresso.toFixed(4));
    });
  });
}

/** Elementos com [data-seguir] deslizam levemente na direção do cursor (ilustrações, por exemplo). */
export function iniciarSeguirCursor() {
  const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-seguir]'));
  if (!elementos.length) return;
  const alvo = { x: 0, y: 0 };
  const atual = { x: 0, y: 0 };
  addEventListener(
    'pointermove',
    (e) => {
      alvo.x = e.clientX / innerWidth - 0.5;
      alvo.y = e.clientY / innerHeight - 0.5;
    },
    { passive: true },
  );
  aCadaQuadro((_, delta) => {
    atual.x = suavizar(atual.x, alvo.x, 0.06, delta);
    atual.y = suavizar(atual.y, alvo.y, 0.06, delta);
    for (const el of elementos) {
      const f = Number(el.dataset.seguir || 20);
      el.style.translate = `${(atual.x * f).toFixed(2)}px ${(atual.y * f).toFixed(2)}px`;
    }
  });
}

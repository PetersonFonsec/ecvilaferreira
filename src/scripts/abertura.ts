import { aCadaQuadro, suavizar } from './movimento';

/** Tempo mínimo na tela, para a animação de entrada não piscar. */
const MINIMO = 1100;
/** Depois disso a abertura sai mesmo que algo ainda esteja carregando. */
const MAXIMO = 3200;
/** Duração da saída (as cortinas sobem), igual ao CSS de Abertura.astro. */
const SAIDA = 1300;

/**
 * Conduz a tela de abertura: o número vai de 0 a 100 enquanto as `tarefas` (fontes, página, brasão 3D)
 * terminam, e as cortinas sobem. Resolve quando a saída começa, para as animações da página entrarem juntas.
 * Se o <head> não ligou a abertura (já vista na sessão, sem JS, "reduzir movimento"), resolve na hora.
 */
export function iniciarAbertura(tarefas: Promise<unknown>[]): Promise<void> {
  const raiz = document.documentElement;
  const numero = document.querySelector<HTMLElement>('[data-abertura-numero]');
  const barra = document.querySelector<HTMLElement>('[data-abertura-barra]');
  if (!raiz.classList.contains('abertura') || !numero || !barra) return Promise.resolve();

  let prontas = 0;
  tarefas.forEach((t) => t.finally(() => prontas++));

  return new Promise((resolver) => {
    const inicio = performance.now();
    let valor = 0;

    let saiu = false;
    const sair = () => {
      if (saiu) return;
      saiu = true;
      cancelar();
      raiz.classList.add('abertura--saindo');
      resolver();
      setTimeout(() => raiz.classList.remove('abertura', 'abertura--saindo'), SAIDA);
    };
    // Garantia caso os quadros atrasem (aparelho lento, aba em segundo plano).
    setTimeout(sair, MAXIMO + 800);

    const cancelar = aCadaQuadro((tempo, delta) => {
      const decorrido = tempo - inicio;
      const tudoPronto = prontas >= tarefas.length || decorrido > MAXIMO;

      // Enquanto espera, avança devagar até ~90%; com tudo pronto, corre para 100%.
      const parcial = (prontas / Math.max(1, tarefas.length)) * 90;
      const alvo = tudoPronto ? 100 : Math.max(parcial, 90 * (1 - Math.exp(-decorrido / 700)));
      valor = suavizar(valor, alvo, tudoPronto ? 0.18 : 0.08, delta);

      const inteiro = Math.min(100, Math.round(valor));
      numero.textContent = String(inteiro);
      barra.style.transform = `scaleX(${valor / 100})`;

      if (tudoPronto && inteiro >= 100 && decorrido >= MINIMO) sair();
    });
  });
}

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { aCadaQuadro, limitar } from './movimento';

let lenis: Lenis | null = null;

/** Rolagem suave (Lenis). A posição continua sendo a do window, então os outros efeitos leem window.scrollY. */
export function iniciarRolagemSuave() {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    anchors: { offset: -80 },
    autoRaf: false,
  });
  aCadaQuadro((tempo) => lenis?.raf(tempo));
  return lenis;
}

/** Velocidade da rolagem, em pixels por quadro. Zero quando a rolagem suave está desligada. */
export const velocidadeRolagem = () => lenis?.velocity ?? 0;

export const pararRolagem = (parar: boolean) => (parar ? lenis?.stop() : lenis?.start());

/** Barra dourada no topo que mostra quanto da página já foi lido. */
export function iniciarBarraDeProgresso() {
  const barra = document.querySelector<HTMLElement>('.progresso-leitura');
  if (!barra) return;
  aCadaQuadro(() => {
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? limitar(scrollY / total) : 0})`;
  });
}

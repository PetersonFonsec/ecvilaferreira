/**
 * Ponto de entrada dos efeitos de movimento. Tudo aqui é melhoria progressiva:
 * sem JavaScript, ou com "reduzir movimento" ativado no sistema, o conteúdo aparece normalmente.
 */
import { ponteiroFino, reduzMovimento } from './movimento';
import { iniciarBarraDeProgresso, iniciarRolagemSuave } from './rolagem';
import { iniciarRevelar } from './revelar';
import { iniciarCursor } from './cursor';
import {
  iniciarAcender,
  iniciarContadores,
  iniciarHorizontal,
  iniciarInclinar,
  iniciarLetreiros,
  iniciarMagnetico,
  iniciarParallax,
  iniciarSeguirCursor,
} from './interacoes';

const animar = !reduzMovimento();
const raiz = document.documentElement;

iniciarRevelar(animar);
iniciarBarraDeProgresso();

if (animar) {
  iniciarRolagemSuave();
  iniciarParallax();
  iniciarContadores();
  iniciarLetreiros();
  iniciarAcender();
  iniciarHorizontal();

  if (ponteiroFino()) {
    iniciarCursor();
    iniciarMagnetico();
    iniciarInclinar();
    iniciarSeguirCursor();
  }
}

// O brasão 3D só é baixado quando há um palco para ele, o navegador tem WebGL e o usuário não pediu economia.
const palco = document.querySelector<HTMLElement>('[data-escudo-3d]');
const economia = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
if (palco && animar && !economia) {
  const carregar = () => import('./escudo3d').then(({ montarEscudo3D }) => montarEscudo3D(palco)).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(carregar, { timeout: 1500 });
  else setTimeout(carregar, 300);
}

raiz.classList.add('efeitos-ok');

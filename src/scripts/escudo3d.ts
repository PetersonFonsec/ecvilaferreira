/**
 * Brasão em 3D (three.js) para a abertura da home.
 * Gira acompanhando o cursor, dá uma volta conforme a rolagem e pode ser arrastado.
 * O SVG do brasão fica por baixo e só sai de cena quando o modelo já foi desenhado.
 */
import {
  NeutralToneMapping,
  Box3,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { aCadaQuadro, limitar, quandoVisivel, suavizar } from './movimento';

const MODELO = '/3d/vila-ferreira.glb';

export async function montarEscudo3D(palco: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.className = 'escudo3d__canvas';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return; // Sem WebGL: fica o SVG.
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const cena = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const luz = new DirectionalLight(0xfff4dd, 2.2);
  luz.position.set(2.5, 3, 4);
  cena.add(luz);
  const contraluz = new DirectionalLight(0xf2cb2c, 1.4);
  contraluz.position.set(-3, -1, -2);
  cena.add(contraluz);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODELO);

  // Centraliza o modelo num grupo que serve de pivô para as rotações.
  const modelo = gltf.scene;
  const centro = new Box3().setFromObject(modelo).getCenter(new Vector3());
  modelo.position.sub(centro);
  const pivo = new Group();
  pivo.add(modelo);
  cena.add(pivo);

  // Dourado mais vivo nas estrelas, como no brasão impresso.
  modelo.traverse((obj) => {
    if (!(obj instanceof Mesh) || !(obj.material instanceof MeshStandardMaterial)) return;
    if (/estrelas/i.test(obj.name) || /estrelas/i.test(obj.parent?.name ?? '')) {
      obj.material.color = new Color('#f6c40a');
      obj.material.metalness = 0.55;
      obj.material.roughness = 0.3;
      obj.material.emissive = new Color('#7a5600');
      obj.material.emissiveIntensity = 0.5;
    }
  });

  palco.append(canvas);

  const redimensionar = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  redimensionar();
  new ResizeObserver(redimensionar).observe(canvas);

  // Estado da interação
  const cursor = { x: 0, y: 0 };
  const inclinacao = { x: 0, y: 0 };
  let giro = 0; // rotação acumulada pelo arraste
  let velocidadeGiro = 0;
  let arrastando = false;
  let ultimoX = 0;

  addEventListener(
    'pointermove',
    (e) => {
      cursor.x = (e.clientX / innerWidth) * 2 - 1;
      cursor.y = (e.clientY / innerHeight) * 2 - 1;
      if (arrastando) {
        velocidadeGiro = (e.clientX - ultimoX) * 0.012;
        giro += velocidadeGiro;
        ultimoX = e.clientX;
      }
    },
    { passive: true },
  );
  canvas.addEventListener('pointerdown', (e) => {
    arrastando = true;
    ultimoX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
    palco.classList.add('escudo3d--arrastando');
  });
  const soltar = () => {
    arrastando = false;
    palco.classList.remove('escudo3d--arrastando');
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);

  let visivel = true;
  quandoVisivel([palco], (_, v) => (visivel = v));

  const hero = palco.closest<HTMLElement>('.hero') ?? palco;
  let primeiroQuadro = true;

  aCadaQuadro((tempo, delta) => {
    if (!visivel || document.hidden) return;

    // Inércia do arraste e volta suave para a frente.
    if (!arrastando) {
      giro += velocidadeGiro;
      velocidadeGiro *= Math.pow(0.94, delta / 16.7);
      giro = suavizar(giro, Math.round(giro / (Math.PI * 2)) * Math.PI * 2, 0.03, delta);
    }

    inclinacao.x = suavizar(inclinacao.x, cursor.y * 0.28, 0.06, delta);
    inclinacao.y = suavizar(inclinacao.y, cursor.x * 0.5, 0.06, delta);

    const progresso = limitar(scrollY / Math.max(1, hero.offsetHeight));
    const flutuar = Math.sin(tempo / 1300) * 0.06;

    pivo.rotation.x = inclinacao.x + progresso * 0.35;
    pivo.rotation.y = inclinacao.y + giro + progresso * Math.PI * 1.15;
    pivo.rotation.z = Math.sin(tempo / 2100) * 0.03;
    pivo.position.y = flutuar + progresso * 0.9;
    pivo.scale.setScalar(1 - progresso * 0.25);

    renderer.render(cena, camera);

    if (primeiroQuadro) {
      primeiroQuadro = false;
      palco.classList.add('escudo3d--pronto');
    }
  });
}

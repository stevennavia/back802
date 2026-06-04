import * as THREE from 'three';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    this.camera.position.set(0, 1.7, 2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.prepend(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0x9098b0, 0.3);
    this.scene.add(ambient);
    this.ambient = ambient;

    const dirLight = new THREE.DirectionalLight(0x98a0b0, 0.22);
    dirLight.position.set(3, 8, -5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.top = 12;
    dirLight.shadow.camera.bottom = -12;
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    const fillLight = new THREE.DirectionalLight(0x808098, 0.1);
    fillLight.position.set(-2, 4, 3);
    this.scene.add(fillLight);
    this.fillLight = fillLight;

    this._generateEnvMap();

    window.addEventListener('resize', () => this.onResize());
  }

  _generateEnvMap() {
    const size = 64;
    const images = [];
    for (let i = 0; i < 6; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, '#3a3a50');
      gradient.addColorStop(0.3, '#252535');
      gradient.addColorStop(0.6, '#181825');
      gradient.addColorStop(1, '#0a0a15');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      images.push(canvas);
    }
    const envMap = new THREE.CubeTexture(images);
    envMap.mapping = THREE.CubeReflectionMapping;
    this.scene.environment = envMap;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

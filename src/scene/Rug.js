import * as THREE from 'three';

export class Rug {
  constructor(scene) {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/rug.png');

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.9,
      metalness: 0,
      transparent: true,
    });

    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(0.87, 0.01, 1.5),
      mat
    );
    rug.position.set(1.3, 0.003, 12.8);
    scene.add(rug);
  }
}

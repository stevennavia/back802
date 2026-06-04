import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class NPC {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.position = new THREE.Vector3(-1.0, 0, 8.5);
    this.load();
  }

  load() {
    const loader = new GLTFLoader();
    loader.load(
      '/gon.glb',
      (gltf) => {
        this.mesh = gltf.scene;
        this.mesh.scale.set(1.1, 1.1, 1.1);
        this.mesh.rotation.y = Math.PI;
        this.mesh.position.set(-1.0, 0, 8.5);
        this.scene.add(this.mesh);

        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(this.mesh);
        this.mesh.position.y = -box.min.y;
      },
      undefined,
      (err) => console.error('NPC load error:', err)
    );
  }
}

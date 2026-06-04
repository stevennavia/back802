import * as THREE from 'three';
import { BOUNDS, ELEVATOR_CORE } from '../utils/constants.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class Signage {
  constructor(scene) {
    this.scene = scene;
    this.build();
  }

  build() {
    const exitTex = TextureGenerator.createExitSignTexture();
    const exitMat = new THREE.MeshStandardMaterial({
      map: exitTex,
      emissive: 0x00cc66,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
    });

    const core = ELEVATOR_CORE;
    const cx = (BOUNDS.right + core.farX) / 2;

    const signTop = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), exitMat);
    signTop.position.set(cx, 2.7, core.openingZMin + 0.02);
    this.scene.add(signTop);

    const signBottom = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), exitMat);
    signBottom.position.set(cx, 2.7, core.openingZMax - 0.02);
    signBottom.rotation.y = Math.PI;
    this.scene.add(signBottom);

    const extCanvas = document.createElement('canvas');
    extCanvas.width = 64;
    extCanvas.height = 128;
    const ctx = extCanvas.getContext('2d');
    ctx.fillStyle = '#882222';
    ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXTINTOR', 32, 70);
    const extTex = new THREE.CanvasTexture(extCanvas);
    extTex.colorSpace = THREE.SRGBColorSpace;

    const extMat = new THREE.MeshStandardMaterial({
      map: extTex,
      side: THREE.DoubleSide,
    });
    const extSign = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.4), extMat);
    extSign.position.set(BOUNDS.left - 0.02, 2.0, 3);
    extSign.rotation.y = Math.PI / 2;
    this.scene.add(extSign);
  }
}

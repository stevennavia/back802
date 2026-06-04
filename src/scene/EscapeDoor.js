import * as THREE from 'three';
import { DOOR, COLORS } from '../utils/constants.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class EscapeDoor {
  static create(scene, x, z) {
    const group = new THREE.Group();
    const W = DOOR.width;
    const H = DOOR.height;
    const D = DOOR.thickness;
    const fw = DOOR.frameWidth;
    const fd = DOOR.frameDepth;

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.3,
      metalness: 0.6,
    });

    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(fd, H + fw * 2, fw),
      frameMat
    );
    leftFrame.position.set(0, 0, -W / 2 - fw / 2);
    group.add(leftFrame);

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(fd, H + fw * 2, fw),
      frameMat
    );
    rightFrame.position.set(0, 0, W / 2 + fw / 2);
    group.add(rightFrame);

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(fd, fw, W + fw * 2),
      frameMat
    );
    topFrame.position.set(0, H / 2 + fw / 2, 0);
    group.add(topFrame);

    const doorMat = new THREE.MeshStandardMaterial({
      color: COLORS.escapeDoor,
      roughness: 0.6,
      metalness: 0.2,
    });

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(D, H - fw * 2, W - fw * 2),
      doorMat
    );
    door.position.set(0, 0, 0);
    group.add(door);

    const barMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.3,
      metalness: 0.7,
    });
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(D + 0.02, 0.04, W * 0.6),
      barMat
    );
    bar.position.set(0, 0.3, 0);
    group.add(bar);

    const signTex = TextureGenerator.createEscapeSignTexture();
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), signMat);
    sign.position.set(D / 2 + 0.005, H / 2 - 0.15, 0);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);

    group.position.set(x - fd / 2, H / 2, z);
    group.rotation.y = Math.PI;
    scene.add(group);
    return group;
  }
}

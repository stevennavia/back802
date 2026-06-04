import * as THREE from 'three';
import { DOOR, COLORS } from '../utils/constants.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class ElectricalDoor {
  static create(scene, z) {
    const group = new THREE.Group();
    const W = DOOR.width;
    const H = DOOR.height;
    const D = DOOR.thickness;
    const fw = DOOR.frameWidth;
    const fd = DOOR.frameDepth;

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x999999,
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
      color: COLORS.electricalDoor,
      roughness: 0.5,
      metalness: 0.3,
    });

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(D, H - fw * 2, W - fw * 2),
      doorMat
    );
    door.position.set(0, 0, 0);
    group.add(door);

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.3,
      metalness: 0.7,
    });
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8),
      handleMat
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(D / 2 + 0.012, -0.05, W / 2 - 0.12);
    group.add(handle);

    const signTex = TextureGenerator.createElectricalSignTexture();
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      roughness: 0.5,
      metalness: 0,
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), signMat);
    sign.position.set(D / 2 + 0.005, H / 2 - 0.15, 0);
    sign.rotation.y = Math.PI / 2;
    group.add(sign);

    group.position.set(2 - fd / 2, H / 2, z);
    group.rotation.y = Math.PI;
    scene.add(group);
    return group;
  }
}

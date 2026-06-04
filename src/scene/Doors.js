import * as THREE from 'three';
import { DOOR, COLORS } from '../utils/constants.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class Doors {
  static _buildDoor(group, num, width, height, glassColor = null, showInterior = true, plateRotY = Math.PI / 2) {
    const D = DOOR.thickness;
    const H = height;
    const W = width;
    const fw = DOOR.frameWidth;
    const fd = DOOR.frameDepth;
    const gColor = glassColor || COLORS.doorGlass;

    const frameColor = glassColor ? new THREE.Color(glassColor).multiplyScalar(0.7).getHex() : COLORS.doorFrame;

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
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

    const glassTex = TextureGenerator.createGlassTexture();
    const glassMat = new THREE.MeshPhysicalMaterial({
      map: glassTex,
      color: gColor,
      metalness: 0.05,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6,
      clearcoat: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(D * 0.6, H - fw * 2, W - fw * 2),
      glassMat
    );
    glass.position.set(0, 0, 0);
    group.add(glass);

    if (showInterior) {
      const blurTex = TextureGenerator.createInteriorBlurTexture();
      const interiorMat = new THREE.MeshStandardMaterial({
        map: blurTex,
        color: 0x0a0a0a,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.63,
        side: THREE.DoubleSide,
      });
      const interiorX = plateRotY > 0 ? -0.04 : 0.04;
      const interior = new THREE.Mesh(
        new THREE.PlaneGeometry(W - fw * 2, H - fw * 2),
        interiorMat
      );
      interior.position.set(interiorX, 0, 0);
      interior.rotation.y = -Math.PI / 2;
      group.add(interior);
    }

    const handleMat = new THREE.MeshStandardMaterial({
      color: COLORS.handle,
      roughness: 0.3,
      metalness: 0.7,
    });

    const pull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8),
      handleMat
    );
    pull.rotation.x = Math.PI / 2;
    pull.position.set(D / 2 + 0.012, -0.1, W / 2 - 0.12);
    group.add(pull);

    const pull2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8),
      handleMat
    );
    pull2.rotation.x = Math.PI / 2;
    pull2.position.set(D / 2 + 0.012, -0.1, -W / 2 + 0.12);
    group.add(pull2);

    const numTex = TextureGenerator.createDoorNumberTexture(num);
    const numColor = glassColor ? 0xffffff : 0x222222;
    const numMat = new THREE.MeshStandardMaterial({
      map: numTex,
      roughness: 0.4,
      metalness: 0.1,
      color: numColor,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), numMat);
    plate.position.set(D / 2 + 0.005, H / 2 - 0.4, 0);
    plate.rotation.y = plateRotY;
    plate.renderOrder = 1;
    group.add(plate);

    group.userData = { doorNum: num, width, height };
  }

  static createLeft(scene, num, z, glassColor = null) {
    const group = new THREE.Group();
    Doors._buildDoor(group, num, DOOR.width, DOOR.height, glassColor);
    group.position.set(-2 + DOOR.frameDepth / 2, DOOR.height / 2, z);
    group.rotation.y = 0;
    scene.add(group);
    return group;
  }

  static createRight(scene, num, z, glassColor = null, showInterior = true) {
    const group = new THREE.Group();
    Doors._buildDoor(group, num, DOOR.width, DOOR.height, glassColor, showInterior);
    group.position.set(2 - DOOR.frameDepth / 2, DOOR.height / 2, z);
    group.rotation.y = Math.PI;
    scene.add(group);
    return group;
  }

  static createTop(scene, num, glassColor = null) {
    const group = new THREE.Group();
    Doors._buildDoor(group, num, DOOR.width, DOOR.height, glassColor, true, -Math.PI / 2);
    group.position.set(-0.5, DOOR.height / 2, -14 + DOOR.frameDepth / 2);
    group.rotation.y = Math.PI / 2;
    scene.add(group);
    return group;
  }

  static createBottom(scene, num, glassColor = null) {
    const group = new THREE.Group();
    Doors._buildDoor(group, num, DOOR.width, DOOR.height, glassColor, true, -Math.PI / 2);
    group.position.set(-0.5, DOOR.height / 2, 14 - DOOR.frameDepth / 2);
    group.rotation.y = -Math.PI / 2;
    scene.add(group);
    return group;
  }

  static createGreen(scene, num, z) {
    const group = new THREE.Group();
    Doors._buildDoor(group, num, DOOR.width, DOOR.height, COLORS.officeGreen, false);
    group.position.set(2 - DOOR.frameDepth / 2, DOOR.height / 2, z);
    group.rotation.y = Math.PI;
    scene.add(group);
    return group;
  }

  static createEndDoor(scene, z) {
    return Doors.createTop(scene, 999);
  }
}

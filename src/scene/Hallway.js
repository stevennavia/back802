import * as THREE from 'three';
import { MAP, BOUNDS, DOOR } from '../utils/constants.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class Hallway {
  constructor(scene) {
    this.scene = scene;
    this.floorMat = TextureGenerator.createFloorMaterial();
    this.wallTex = TextureGenerator.createWallTexture();
    this.ceilTex = TextureGenerator.createCeilingTexture();
    this.build();
  }

  build() {
    const W = MAP.width;
    const D = MAP.depth;
    const H = MAP.height;
    const L = BOUNDS.left;
    const R = BOUNDS.right;
    const T = BOUNDS.top;
    const B = BOUNDS.bottom;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ceilMat = new THREE.MeshStandardMaterial({
      map: this.ceilTex,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, H, 0);
    ceiling.receiveShadow = true;
    this.scene.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({
      map: this.wallTex,
      roughness: 0.7,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat);
    leftWall.position.set(L, H / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    const coreOpen = 5.5;
    const upperLen = (-coreOpen) - T;
    const lowerLen = B - coreOpen;
    const upperZ = (T + (-coreOpen)) / 2;
    const lowerZ = (coreOpen + B) / 2;

    const rightUpper = new THREE.Mesh(
      new THREE.PlaneGeometry(upperLen, H),
      wallMat
    );
    rightUpper.position.set(R, H / 2, upperZ);
    rightUpper.rotation.y = -Math.PI / 2;
    this.scene.add(rightUpper);

    const rightLower = new THREE.Mesh(
      new THREE.PlaneGeometry(lowerLen, H),
      wallMat
    );
    rightLower.position.set(R, H / 2, lowerZ);
    rightLower.rotation.y = -Math.PI / 2;
    this.scene.add(rightLower);

    const doorZ = 12.8;
    const halfW = DOOR.width / 2;
    const rl1Len = (doorZ - halfW) - coreOpen;
    const rl2Len = B - (doorZ + halfW);
    const rl1Z = (coreOpen + (doorZ - halfW)) / 2;
    const rl2Z = ((doorZ + halfW) + B) / 2;

    this.scene.remove(rightLower);

    const rightLowSeg1 = new THREE.Mesh(
      new THREE.PlaneGeometry(rl1Len, H),
      wallMat
    );
    rightLowSeg1.position.set(R, H / 2, rl1Z);
    rightLowSeg1.rotation.y = -Math.PI / 2;
    this.scene.add(rightLowSeg1);

    const rightLowSeg2 = new THREE.Mesh(
      new THREE.PlaneGeometry(rl2Len, H),
      wallMat
    );
    rightLowSeg2.position.set(R, H / 2, rl2Z);
    rightLowSeg2.rotation.y = -Math.PI / 2;
    this.scene.add(rightLowSeg2);

    const topWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    topWall.position.set(0, H / 2, T);
    this.scene.add(topWall);

    const bottomWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    bottomWall.position.set(0, H / 2, B);
    bottomWall.rotation.y = Math.PI;
    this.scene.add(bottomWall);
  }
}

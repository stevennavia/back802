import * as THREE from 'three';
import { MAP, COLORS } from '../utils/constants.js';

export class SecurityCam {
  constructor(scene) {
    this.scene = scene;
    this.build();
  }

  build() {
    const H = MAP.height;

    this.group = new THREE.Group();

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.3,
      metalness: 0.1,
    });

    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16),
      baseMat
    );
    mount.position.y = 0;
    this.group.add(mount);

    const stalk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8),
      baseMat
    );
    stalk.position.y = -0.04;
    this.group.add(stalk);

    this.pivot = new THREE.Group();
    this.pivot.position.y = -0.08;
    this.group.add(this.pivot);

    const joint = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 6, 6),
      baseMat
    );
    joint.position.y = 0;
    this.pivot.add(joint);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.2,
      metalness: 0.05,
    });
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.035, 0.06),
      bodyMat
    );
    body.position.set(0, -0.025, 0.01);
    this.pivot.add(body);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.004, 6, 12),
      bodyMat
    );
    ring.position.set(0, -0.025, 0.04);
    ring.rotation.x = Math.PI / 2;
    this.pivot.add(ring);

    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.3,
    });
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.03, 0.025, 10),
      lensMat
    );
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -0.025, 0.05);
    this.pivot.add(lens);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
    });
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(0.025, 10),
      glassMat
    );
    glass.position.set(0, -0.025, 0.063);
    this.pivot.add(glass);

    this.ledMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
    });
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 8, 8),
      this.ledMat
    );
    led.position.set(0.03, -0.022, 0.04);
    this.pivot.add(led);

    this.group.position.set(-0.8, H - 0.005, 3.5);
    this.group.scale.set(1.5, 1.5, 1.5);
    this.scene.add(this.group);
  }

  update(playerPosition) {
    const dx = playerPosition.x - this.group.position.x;
    const dz = playerPosition.z - this.group.position.z;
    this.pivot.rotation.y = Math.atan2(dx, dz);

    const t = performance.now() / 1000;
    const blink = 0.3 + 0.7 * Math.abs(Math.sin(t * 5));
    this.ledMat.emissiveIntensity = blink;
  }
}

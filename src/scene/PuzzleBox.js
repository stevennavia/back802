import * as THREE from 'three';

export class PuzzleBox {
  constructor(scene) {
    this.scene = scene;
    this.opened = false;
    this.keyTaken = false;
    this.animating = false;
    this.animTimer = 0;
    this.group = new THREE.Group();
    this.group.position.set(1.92, 1.3, 11.4);
    scene.add(this.group);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.5, 0.5),
      bodyMat
    );
    body.position.set(0, 0.25, 0);
    this.group.add(body);

    this.lid = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 0.06, 0.52),
      bodyMat
    );
    this.lid.position.set(0, 0.53, 0);
    this.group.add(this.lid);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0,
      roughness: 0.05,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });

    const windowFront = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.22),
      glassMat
    );
    windowFront.position.set(0.085, 0.25, 0);
    windowFront.rotation.y = Math.PI / 2;
    this.group.add(windowFront);

    const keyMat = new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      roughness: 0.2,
      metalness: 0.7,
    });

    this.keyGroup = new THREE.Group();
    this.keyGroup.position.set(0.04, 0.15, 0);
    this.keyBaseY = 0.15;

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.14, 8),
      keyMat
    );
    shaft.position.set(0, -0.07, 0);
    this.keyGroup.add(shaft);

    const head = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.01, 8, 12),
      keyMat
    );
    head.position.set(0, 0.03, 0);
    this.keyGroup.add(head);

    const bit = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.05, 0.025),
      keyMat
    );
    bit.position.set(0, -0.12, 0);
    this.keyGroup.add(bit);

    this.group.add(this.keyGroup);

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffdd44,
      emissive: 0xffdd44,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0.5,
    });

    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      glowMat
    );
    this.glow.position.set(0.04, 0.65, 0);
    this.group.add(this.glow);

    this.glowLight = new THREE.PointLight(0xffdd44, 0, 4);
    this.glowLight.position.set(0.04, 0.65, 0);
    this.group.add(this.glowLight);
  }

  open() {
    if (this.opened) return;
    this.opened = true;
    this.animating = true;
    this.animTimer = 0;
    this.lid.position.y = 0.9;
  }

  update(dt) {
    if (!this.animating) return;
    this.animTimer += dt;
    const t = Math.min(this.animTimer / 1.5, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    this.keyGroup.position.y = this.keyBaseY + (0.5 - this.keyBaseY) * ease;
    this.glow.material.emissiveIntensity = ease * 2;
    this.glowLight.intensity = ease * 1.5;

    if (t >= 1) this.animating = false;
  }

  takeKey() {
    if (this.keyTaken) return;
    this.keyTaken = true;
    this.keyGroup.visible = false;
    this.glow.material.emissiveIntensity = 0;
    this.glowLight.intensity = 0;
  }

  isOpen() {
    return this.opened;
  }

  getBoxWorldPosition() {
    const pos = new THREE.Vector3();
    this.group.getWorldPosition(pos);
    return pos;
  }

  getKeyWorldPosition() {
    const pos = new THREE.Vector3();
    this.keyGroup.getWorldPosition(pos);
    return pos;
  }
}

import * as THREE from 'three';

export class SmokeEffect {
  constructor(scene) {
    this.scene = scene;
    this.maxParticles = 200;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.velocities = [];
    this.lifetimes = new Float32Array(this.maxParticles);
    this.ages = new Float32Array(this.maxParticles);
    this.alive = new Uint8Array(this.maxParticles);
    this.emissionRate = 0;
    this.timeAccum = 0;
    this.nextParticle = 0;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(100,100,110,1)');
    gradient.addColorStop(0.2, 'rgba(80,80,90,0.5)');
    gradient.addColorStop(0.5, 'rgba(60,60,70,0.2)');
    gradient.addColorStop(1, 'rgba(40,40,50,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      size: 0.15,
      opacity: 0.25,
      color: 0x777788,
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    this.particles = new THREE.Points(geom, this.material);
    scene.add(this.particles);

    this.spawnPos = new THREE.Vector3(2.4, 0.02, 12.8);

    for (let i = 0; i < this.maxParticles; i++) {
      this.alive[i] = 0;
      this.ages[i] = 0;
      this.lifetimes[i] = 4 + Math.random() * 4;
      this.velocities[i] = new THREE.Vector3();
      this.sizes[i] = 0;
      this.positions[i * 3] = this.spawnPos.x;
      this.positions[i * 3 + 1] = this.spawnPos.y;
      this.positions[i * 3 + 2] = this.spawnPos.z;
    }
  }

  update(dt, timerRemaining) {
    const maxRate = 1 - timerRemaining / 300;
    this.emissionRate = maxRate * maxRate * 6;

    this.timeAccum += dt;
    const spawnInterval = this.emissionRate > 0 ? 1 / this.emissionRate : 999;

    while (this.timeAccum >= spawnInterval && this.emissionRate > 0) {
      this.timeAccum -= spawnInterval;
      this._spawn();
    }

    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.alive[i]) continue;
      this.ages[i] += dt;
      const life = this.ages[i] / this.lifetimes[i];
      if (life >= 1) {
        this.alive[i] = 0;
        this.sizes[i] = 0;
        continue;
      }

      const v = this.velocities[i];
      this.positions[i * 3] += v.x * dt;
      this.positions[i * 3 + 1] += v.y * dt;
      this.positions[i * 3 + 2] += v.z * dt;

      v.y += 0.06 * dt;

      this.sizes[i] = 0.08 + life * 0.25;
    }

    this.material.opacity = Math.min(0.3, this.emissionRate / 12);

    const posAttr = this.particles.geometry.attributes.position;
    posAttr.needsUpdate = true;
  }

  _spawn() {
    const i = this.nextParticle;
    this.nextParticle = (this.nextParticle + 1) % this.maxParticles;

    this.alive[i] = 1;
    this.ages[i] = 0;
    this.lifetimes[i] = 3 + Math.random() * 4;

    this.positions[i * 3] = this.spawnPos.x + (Math.random() - 0.5) * 0.6;
    this.positions[i * 3 + 1] = this.spawnPos.y;
    this.positions[i * 3 + 2] = this.spawnPos.z + (Math.random() - 0.5) * 0.3;

    const theta = Math.random() * Math.PI * 2;
    const speed = 0.08 + Math.random() * 0.12;
    this.velocities[i].set(Math.cos(theta) * speed, 0.08 + Math.random() * 0.12, Math.sin(theta) * speed);

    this.sizes[i] = 0.06;
  }
}

import * as THREE from 'three';
import { MAP, COLORS } from '../utils/constants.js';

export class CeilingLights {
  constructor(scene, flicker) {
    this.scene = scene;
    this.flicker = flicker;
    this.lights = [];
    this.isFlashing = false;
    this.flashTimer = 0;
    this.flashDuration = 15;
    this.build();
  }

  build() {
    const H = MAP.height;

    const housingGeo = new THREE.BoxGeometry(0.15, 0.06, 1.2);
    const panelGeo = new THREE.PlaneGeometry(0.8, 0.05);

    const housingMat = new THREE.MeshStandardMaterial({
      color: COLORS.lightFixture,
      roughness: 0.5,
      metalness: 0.3,
    });

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xeeddcc,
      roughness: 0.3,
      emissive: 0xffe8d0,
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide,
    });

    const startZ = -12;
    const endZ = 12;
    const spacing = 3;

    let i = 0;
    for (let z = startZ; z <= endZ; z += spacing) {
      const housing = new THREE.Mesh(housingGeo, housingMat);
      housing.position.set(0, H - 0.05, z);
      housing.castShadow = true;
      this.scene.add(housing);

      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.rotation.x = -Math.PI / 2;
      panel.position.set(0, H - 0.04, z);
      this.scene.add(panel);

      const warm = i % 2 === 0 ? 0.7 : 0.5;
      const light = new THREE.PointLight(0xffe8d0, warm, 6.5, 1.6);
      light.position.set(0, H - 0.1, z);
      this.scene.add(light);
      this.lights.push({ light, originalColor: 0xffe8d0, originalIntensity: warm });

      if (this.flicker) {
        this.flicker.add(light, {
          baseIntensity: warm,
          flickerChance: i % 3 === 0 ? 0.012 : 0.004,
          flickerDuration: 0.08 + Math.random() * 0.12,
          minIntensity: i % 3 === 0 ? 0.12 : 0.2,
          pulseAmplitude: 0.04 + Math.random() * 0.05,
          pulseSpeed: 0.7 + Math.random() * 0.9,
        });
      }
      i++;
    }

    const coreHousing = new THREE.Mesh(housingGeo, housingMat);
    coreHousing.position.set(2.5, H - 0.05, 0);
    coreHousing.castShadow = true;
    this.scene.add(coreHousing);

    const corePanel = new THREE.Mesh(panelGeo, panelMat);
    corePanel.rotation.x = -Math.PI / 2;
    corePanel.position.set(2.5, H - 0.04, 0);
    this.scene.add(corePanel);

    const coreLight = new THREE.PointLight(0xffe8d0, 0.4, 5, 1.8);
    coreLight.position.set(2.5, H - 0.1, 0);
    this.scene.add(coreLight);
    this.lights.push({ light: coreLight, originalColor: 0xffe8d0, originalIntensity: 0.4 });

    if (this.flicker) {
      this.flicker.add(coreLight, {
        baseIntensity: 0.4,
        flickerChance: 0.008,
        minIntensity: 0.1,
        pulseAmplitude: 0.04,
        pulseSpeed: 1.0,
      });
    }
  }

  startRedFlash() {
    this.isFlashing = true;
    this.flashTimer = 0;
  }

  customUpdate(dt) {
    if (!this.isFlashing) return;
    this.flashTimer += dt;
    const on = Math.sin(this.flashTimer * Math.PI * 4) > 0;
    for (const l of this.lights) {
      l.light.color.setHex(on ? 0xdd2200 : 0x000000);
      l.light.intensity = on ? l.originalIntensity * 0.6 : 0.01;
    }
    if (this.flashTimer >= this.flashDuration) {
      this.isFlashing = false;
      for (const l of this.lights) {
        l.light.color.setHex(l.originalColor);
        l.light.intensity = l.originalIntensity;
      }
    }
  }
}

import * as THREE from 'three';
import { MAP, ELEVATOR_CORE, ELEVATOR_CABIN, ELEVATOR, COLORS } from '../utils/constants.js';
import { EscapeDoor } from './EscapeDoor.js';
import { Elevators } from './Elevators.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class ElevatorCore {
  constructor(scene) {
    this.scene = scene;
    this.openDoors = [];
    this.escapeTopGroup = null;
    this.escapeBottomGroup = null;
    this.build();
  }

  build() {
    const H = MAP.height;
    const core = ELEVATOR_CORE;

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.7,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const doorZ = ELEVATOR.width / 2;
    const backWallLen1 = (-doorZ) - core.openingZMin;
    const backWallLen2 = core.openingZMax - doorZ;
    const backWallCenter1 = (core.openingZMin + (-doorZ)) / 2;
    const backWallCenter2 = (core.openingZMax + doorZ) / 2;

    const backWallTop = new THREE.Mesh(
      new THREE.PlaneGeometry(backWallLen1, H),
      wallMat
    );
    backWallTop.position.set(core.farX, H / 2, backWallCenter1);
    backWallTop.rotation.y = Math.PI / 2;
    this.scene.add(backWallTop);

    const backWallBot = new THREE.Mesh(
      new THREE.PlaneGeometry(backWallLen2, H),
      wallMat
    );
    backWallBot.position.set(core.farX, H / 2, backWallCenter2);
    backWallBot.rotation.y = Math.PI / 2;
    this.scene.add(backWallBot);

    const topWall = new THREE.Mesh(
      new THREE.PlaneGeometry(core.farX - core.nearX, H),
      wallMat
    );
    topWall.position.set(
      (core.nearX + core.farX) / 2,
      H / 2,
      core.openingZMin
    );
    this.scene.add(topWall);

    const bottomWall = new THREE.Mesh(
      new THREE.PlaneGeometry(core.farX - core.nearX, H),
      wallMat
    );
    bottomWall.position.set(
      (core.nearX + core.farX) / 2,
      H / 2,
      core.openingZMax
    );
    bottomWall.rotation.y = Math.PI;
    this.scene.add(bottomWall);

    const ceilTex = TextureGenerator.createCeilingTexture();
    const ceilMat = new THREE.MeshStandardMaterial({
      map: ceilTex,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const coreCeiling = new THREE.Mesh(
      new THREE.PlaneGeometry(core.farX - core.nearX, core.openingZMax - core.openingZMin),
      ceilMat
    );
    coreCeiling.rotation.x = Math.PI / 2;
    coreCeiling.position.set(
      (core.nearX + core.farX) / 2,
      H,
      0
    );
    coreCeiling.receiveShadow = true;
    this.scene.add(coreCeiling);

    const floorMat = TextureGenerator.createFloorMaterial();
    const coreFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(core.farX - core.nearX, core.openingZMax - core.openingZMin),
      floorMat
    );
    coreFloor.rotation.x = -Math.PI / 2;
    coreFloor.position.set(
      (core.nearX + core.farX) / 2,
      0.001,
      0
    );
    coreFloor.receiveShadow = true;
    this.scene.add(coreFloor);

    this.escapeTopGroup = EscapeDoor.create(this.scene, core.farX, core.elements.escapeTop);
    this.escapeBottomGroup = EscapeDoor.create(this.scene, core.farX, core.elements.escapeBottom);

    this._createCabin(core);

    const result = Elevators.create(this.scene, [
      core.elements.elevator1,
      core.elements.elevator2,
      core.elements.elevator3,
    ], 1);
    this.openDoors = result.openDoors;
  }

  _createCabin(core) {
    const depth = ELEVATOR_CABIN.depth;
    const halfW = ELEVATOR.width / 2;
    const H = ELEVATOR.height;
    const cabinX = core.farX;
    const cabinEndX = cabinX + depth;
    const cabinCenterX = (cabinX + cabinEndX) / 2;

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      roughness: 0.6,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, ELEVATOR.width),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cabinCenterX, 0.002, 0);
    this.scene.add(floor);

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, ELEVATOR.width),
      ceilingMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(cabinCenterX, H, 0);
    this.scene.add(ceiling);

    const alumMat = new THREE.MeshStandardMaterial({
      color: 0x888899,
      roughness: 0.4,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });

    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x222233,
      metalness: 1.0,
      roughness: 0.05,
      side: THREE.DoubleSide,
    });

    const wallConfig = [
      { posZ: -halfW, rotY: Math.PI, w: depth, label: 'left' },
      { posZ: halfW, rotY: 0, w: depth, label: 'right' },
      { posX: cabinEndX, rotY: Math.PI / 2, w: ELEVATOR.width, label: 'back' },
    ];

    for (const cfg of wallConfig) {
      const halfH = H / 2;

      const bottom = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.w, halfH),
        alumMat
      );
      bottom.position.set(cfg.posX || cabinCenterX, halfH / 2, cfg.posZ || 0);
      bottom.rotation.y = cfg.rotY;
      this.scene.add(bottom);

      const top = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.w, halfH),
        mirrorMat
      );
      top.position.set(cfg.posX || cabinCenterX, halfH + halfH / 2, cfg.posZ || 0);
      top.rotation.y = cfg.rotY;
      this.scene.add(top);
    }

    const light = new THREE.PointLight(0xffffff, 4, 6);
    light.position.set(cabinCenterX, H - 0.3, 0);
    this.scene.add(light);

    const fill = new THREE.PointLight(0xddeeff, 1.5, 5);
    fill.position.set(cabinCenterX, H * 0.3, 0);
    this.scene.add(fill);
  }
}

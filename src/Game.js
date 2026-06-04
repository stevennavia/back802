import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { PlayerController } from './player/PlayerController.js';
import { AudioManager } from './systems/AudioManager.js';
import { UIManager } from './systems/UIManager.js';
import { LightFlicker } from './systems/LightFlicker.js';
import { Hallway } from './scene/Hallway.js';
import { Doors } from './scene/Doors.js';
import { ElectricalDoor } from './scene/ElectricalDoor.js';
import { EscapeDoor } from './scene/EscapeDoor.js';
import { ElevatorCore } from './scene/ElevatorCore.js';
import { CeilingLights } from './scene/CeilingLights.js';
import { Signage } from './scene/Signage.js';
import { SecurityCam } from './scene/SecurityCam.js';
import { Rug } from './scene/Rug.js';
import { NPC } from './scene/NPC.js';
import { PuzzleBox } from './scene/PuzzleBox.js';
import { SmokeEffect } from './scene/SmokeEffect.js';
import {
  MAP,
  BOUNDS,
  ELEVATOR_CORE,
  ELEVATOR_CABIN,
  ELEVATOR,
  PLAYER,
  PUZZLE,
  LEFT_DOORS,
  RIGHT_OFFICE_DOORS,
  ELECTRICAL_Z,
  TOP_DOOR,
  BOTTOM_DOOR,
  COLORS,
  LIGHTS_OUT_DURATION,
  DIZZY_DURATION,
} from './utils/constants.js';

export class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.audioManager = new AudioManager();
    this.uiManager = new UIManager();
    this.lightFlicker = new LightFlicker();

    this.camera = this.sceneManager.camera;
    this.scene = this.sceneManager.scene;

    const cabinCenterX = ELEVATOR_CORE.farX + ELEVATOR_CABIN.depth / 2;
    this.camera.position.set(cabinCenterX, PLAYER.height, 0);
    this.camera.rotation.y = Math.PI / 2;

    this.playerController = new PlayerController(
      this.camera,
      this.sceneManager.renderer.domElement
    );
    this.playerController.position.copy(this.camera.position);

    this.phase = 1;
    this.running = false;
    this.doors = new Map();

    this.elevatorPhase = 0;
    this.elevatorTimer = 0;
    this.elevatorDoors = [];
    this.elevatorOpened = false;

    this.dialogOpen = false;
    this.interactPressed = false;
    this.npcPosition = null;
    this.dialogParts = [
      'Creo que perdi mis llaves jeje xd',
      'Kiltro me dijo que había instalado un nuevo sistema para entrar',
      'Algo tenía que ver el choapino',
      'Si te apuras alcanzamos a llegar al 4:20',
    ];
    this.dialogPart = 0;

    this.timerElapsed = 0;
    this.timerDuration = 300;
    this.timerRunning = false;
    this.timerElement = document.getElementById('timer');
    this.gameOver = false;

    this.doorColors = new Map();
    this.puzzleSolution = PUZZLE.solution;
    this.puzzleSolved = false;
    this.keyObtained = false;
    this.won = false;
    this.box = null;
    this.puzzleDoorKeys = [];
    this.wonTimer = 0;

    this.lightsOut = false;
    this.lightsOutTimer = 0;

    this.dizzy = false;
    this.dizzyTimer = 0;
    this.dizzyOverlay = document.getElementById('dizzy-overlay');

    this.door802AnimTimer = 0;
    this.door802WinLight = null;
    this.door802AnimDone = false;
    this.room802Created = false;
    this.room802Colliders = [];

    this.setupScene();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF') {
        if (this.dialogOpen) {
          this._advanceDialog();
        } else {
          this.interactPressed = true;
        }
      }
    });

    document.getElementById('npc-ok-btn').addEventListener('click', () => {
      if (this.dialogOpen) this._advanceDialog();
    });
  }

  _advanceDialog() {
    this.dialogPart++;
    if (this.dialogPart >= this.dialogParts.length) {
      this.audioManager.stopGontalk();
      this.dialogOpen = false;
      this.uiManager.hideNPCDialog();
      if (!this.timerRunning) {
        this.timerRunning = true;
        this.timerElement.classList.add('visible');
        this.audioManager._playBeep(660, 0.15, 0.2);
        setTimeout(() => this.audioManager._playBeep(880, 0.2, 0.2), 200);
      }
    } else {
      this.uiManager.setNPCDialogText(this.dialogParts[this.dialogPart]);
      this.audioManager.playGontalk();
    }
  }

  _cycleDoorColor(key) {
    const group = this.doors.get(key);
    if (!group) return;
    const idx = this.doorColors.get(key) || 0;
    const type = group.userData.cycleType || 'door';
    const skipByType = { door: 2, electrical: 3, escape: 1 };
    const skip = skipByType[type] || -1;

    let nextIdx = (idx + 1) % 4;
    if (nextIdx === skip) nextIdx = (nextIdx + 1) % 4;

    this.doorColors.set(key, nextIdx);
    const colorHex = PUZZLE.colors[nextIdx];
    if (type === 'door') Doors.cycleColor(group, colorHex);
    else if (type === 'electrical') ElectricalDoor.cycleColor(group, colorHex);
    else if (type === 'escape') EscapeDoor.cycleColor(group, colorHex);
    this._checkPuzzleSolved();
  }

  _checkPuzzleSolved() {
    for (const [key, target] of Object.entries(this.puzzleSolution)) {
      if ((this.doorColors.get(key) || 0) !== target) return;
    }
    this.puzzleSolved = true;
    if (this.box) {
      this.box.open();
      const bp = this.box.getBoxWorldPosition();
      this.camera.position.set(0.5, bp.y + 0.2, bp.z - 0.8);
      this.camera.lookAt(bp);
    }
    this.audioManager.playCorrect();

    this.keyObtained = true;
    if (this.box) this.box.takeKey();
    this.uiManager.hideInteraction();

    const door802 = this.doors.get('802');
    if (door802) {
      this.door802AnimTimer = 0;
      this.door802WinLight = new THREE.PointLight(0xffffff, 0, 15);
      this.door802WinLight.position.set(2, 1.5, 12.8);
      this.scene.add(this.door802WinLight);
    }
    this.won = true;
    this.wonTimer = 0;
  }

  _createRoom802() {
    if (this.room802Created) return;
    this.room802Created = true;

    const H = 2.5;
    const depth = 2.5;
    const halfW = 0.65;
    const roomX = 2.05;
    const roomEndX = roomX + depth;
    const roomCX = (roomX + roomEndX) / 2;
    const doorZ = 12.8;

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
      new THREE.PlaneGeometry(depth, halfW * 2),
      floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(roomCX, 0.002, doorZ);
    this.scene.add(floor);

    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0,
      emissive: 0xffffff,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, halfW * 2),
      ceilMat
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(roomCX, H, doorZ);
    this.scene.add(ceiling);

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, H),
      whiteMat
    );
    leftWall.position.set(roomCX, H / 2, doorZ - halfW);
    leftWall.rotation.y = Math.PI;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(depth, H),
      whiteMat
    );
    rightWall.position.set(roomCX, H / 2, doorZ + halfW);
    this.scene.add(rightWall);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(halfW * 2, H),
      whiteMat
    );
    backWall.position.set(roomEndX, H / 2, doorZ);
    backWall.rotation.y = Math.PI / 2;
    this.scene.add(backWall);

    const insideLight = new THREE.PointLight(0xffffff, 4, 6);
    insideLight.position.set(roomCX, H - 0.3, doorZ);
    this.scene.add(insideLight);
  }

  setupScene() {
    this.hallway = new Hallway(this.scene);
    this.core = new ElevatorCore(this.scene);

    this.elevatorDoors = this.core.openDoors;
    for (const door of this.elevatorDoors) {
      this.playerController.addCollisionBox(door.leftDoor);
      this.playerController.addCollisionBox(door.rightDoor);
    }

    const storeDoor = (key, group, origColor, cycleType = 'door') => {
      const k = String(key);
      this.doors.set(k, group);
      group.userData.originalColor = origColor;
      group.userData.cycleType = cycleType;
      this.doorColors.set(k, 0);
      this.puzzleDoorKeys.push(k);
    };

    for (const [numStr, z] of Object.entries(LEFT_DOORS)) {
      const door = Doors.createLeft(this.scene, parseInt(numStr), z);
      storeDoor(numStr, door, COLORS.doorGlass);
    }

    for (const [numStr, z] of Object.entries(RIGHT_OFFICE_DOORS)) {
      const door = Doors.createRight(this.scene, parseInt(numStr), z);
      storeDoor(numStr, door, COLORS.doorGlass);
    }

    const elecUpper = ElectricalDoor.create(this.scene, ELECTRICAL_Z.upper);
    storeDoor('electrical_upper', elecUpper, COLORS.electricalDoor, 'electrical');

    const elecLower = ElectricalDoor.create(this.scene, ELECTRICAL_Z.lower);
    storeDoor('electrical_lower', elecLower, COLORS.electricalDoor, 'electrical');

    const escTop = this.core.escapeTopGroup;
    const escBot = this.core.escapeBottomGroup;
    if (escTop) storeDoor('escape_top', escTop, COLORS.escapeDoor, 'escape');
    if (escBot) storeDoor('escape_bottom', escBot, COLORS.escapeDoor, 'escape');

    new Rug(this.scene);
    this.npc = new NPC(this.scene);
    this.npcPosition = this.npc.position;

    this.box = new PuzzleBox(this.scene);
    this.smoke = new SmokeEffect(this.scene);

    this.ceilingLights = new CeilingLights(this.scene, this.lightFlicker);
    this.signage = new Signage(this.scene);
    this.securityCam = new SecurityCam(this.scene);

    this.ambientLight = this.sceneManager.ambient;
    this.dirLight = this.sceneManager.dirLight;
    this.fillLight = this.sceneManager.fillLight;

    const door811 = Doors.createTop(this.scene, TOP_DOOR.num);
    this.doors.set('811', door811);
    door811.userData.originalColor = COLORS.doorGlass;
    this.puzzleDoorKeys.push('811');
    this.doorColors.set('811', 0);

    const door803 = Doors.createBottom(this.scene, BOTTOM_DOOR.num);
    this.doors.set('803', door803);
    door803.userData.originalColor = COLORS.doorGlass;
    this.puzzleDoorKeys.push('803');
    this.doorColors.set('803', 0);

    this._addColliders();
  }

  _addColliders() {
    const mat = new THREE.MeshBasicMaterial({ visible: false });
    const H = MAP.height;
    const createBox = (w, h, d, x, y, z) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      box.position.set(x, y, z);
      this.scene.add(box);
      this.playerController.addCollisionBox(box);
      return box;
    };

    createBox(0.2, H, MAP.depth, BOUNDS.left, H / 2, 0);

    const coreOpen = ELEVATOR_CORE.openingZMax;
    const upperLen = (-coreOpen) - BOUNDS.top;
    const upperZ = (BOUNDS.top + (-coreOpen)) / 2;
    createBox(0.2, H, upperLen, BOUNDS.right, H / 2, upperZ);

    const door802Z = 12.8;
    const halfDoorW = 0.65;
    const dw1Len = (door802Z - halfDoorW) - coreOpen;
    const dw1Z = (coreOpen + (door802Z - halfDoorW)) / 2;
    const rc1 = createBox(0.2, H, dw1Len, BOUNDS.right, H / 2, dw1Z);

    const dw2Len = BOUNDS.bottom - (door802Z + halfDoorW);
    const dw2Z = ((door802Z + halfDoorW) + BOUNDS.bottom) / 2;
    const rc2 = createBox(0.2, H, dw2Len, BOUNDS.right, H / 2, dw2Z);

    this.rightWallCollider1 = rc1;
    this.rightWallCollider2 = rc2;

    createBox(MAP.width, H, 0.2, 0, H / 2, BOUNDS.top);
    createBox(MAP.width, H, 0.2, 0, H / 2, BOUNDS.bottom);

    const coreW = ELEVATOR_CORE.farX - ELEVATOR_CORE.nearX;
    const halfW = ELEVATOR.width / 2;

    const bw1Len = (-halfW) - ELEVATOR_CORE.openingZMin;
    const bw1Center = (ELEVATOR_CORE.openingZMin + (-halfW)) / 2;
    createBox(0.2, H, bw1Len, ELEVATOR_CORE.farX, H / 2, bw1Center);

    const bw2Len = ELEVATOR_CORE.openingZMax - halfW;
    const bw2Center = (ELEVATOR_CORE.openingZMax + halfW) / 2;
    createBox(0.2, H, bw2Len, ELEVATOR_CORE.farX, H / 2, bw2Center);

    createBox(coreW, H, 0.2, (ELEVATOR_CORE.nearX + ELEVATOR_CORE.farX) / 2, H / 2, ELEVATOR_CORE.openingZMin);
    createBox(coreW, H, 0.2, (ELEVATOR_CORE.nearX + ELEVATOR_CORE.farX) / 2, H / 2, ELEVATOR_CORE.openingZMax);

    const cabinDepth = ELEVATOR_CABIN.depth;
    const cabinCenterX = ELEVATOR_CORE.farX + cabinDepth / 2;
    const cabinEndX = ELEVATOR_CORE.farX + cabinDepth;

    createBox(cabinDepth, H, 0.2, cabinCenterX, H / 2, -halfW);
    createBox(cabinDepth, H, 0.2, cabinCenterX, H / 2, halfW);
    createBox(0.2, H, ELEVATOR.width, cabinEndX, H / 2, 0);

    createBox(0.6, 1.7, 0.6, -1.0, 0.85, 8.5);
  }

  start() {
    document.getElementById('cover-btn').addEventListener('click', () => this.startFromCover());
    window.addEventListener('keydown', () => {
      const cover = document.getElementById('cover');
      if (cover && !cover.classList.contains('hidden')) this.startFromCover();
    }, { once: true });
  }

  startFromCover() {
    if (this.running) return;
    const cover = document.getElementById('cover');
    if (cover) cover.classList.add('hidden');

    this.audioManager.init();
    this.audioManager.startAmbient();
    this.audioManager.startCorridorMusic();
    this.audioManager.startElevatorMusic();

    this.playerController.lock();
    this.running = true;

    this.elevatorPhase = 1;
    this.elevatorTimer = 0;
    this.audioManager.playElevatorArrival();

    this.locked = false;
    this.sceneManager.renderer.domElement.addEventListener(
      'click',
      () => { this.locked = true; },
      { once: true }
    );

    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(time) {
    if (!this.running) return;
    requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    if (this.elevatorPhase === 1) {
      this.elevatorTimer += dt;
      if (this.elevatorTimer >= 0.15) {
        this.elevatorPhase = 2;
        this.elevatorTimer = 0;
        this.audioManager.playDing();
      }
    } else if (this.elevatorPhase === 2) {
      this.elevatorTimer += dt;
      const t = Math.min(this.elevatorTimer / 2.0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      for (const door of this.elevatorDoors) {
        const range = door.openZ - door.closedZ;
        door.leftDoor.position.z = -door.closedZ - range * ease;
        door.rightDoor.position.z = door.closedZ + range * ease;
        door.leftDoor.scale.z = 1 - ease;
        door.rightDoor.scale.z = 1 - ease;
      }
      if (t >= 1) {
        for (const door of this.elevatorDoors) {
          this.playerController.removeCollisionBox(door.leftDoor);
          this.playerController.removeCollisionBox(door.rightDoor);
          door.group.remove(door.leftDoor);
          door.group.remove(door.rightDoor);
        }
        this.elevatorPhase = 3;
        this.elevatorOpened = true;
      }
    }

    this.playerController.update(dt);
    this.lightFlicker.update(dt);
    this.securityCam.update(this.playerController.position);

    if (this.elevatorOpened) {
      const px = this.playerController.position.x;
      if (px > 2.5) {
        this.audioManager.setElevatorVolume(0.15);
        this.audioManager.setCorridorVolume(0);
      } else if (px < 2) {
        this.audioManager.setElevatorVolume(0);
        this.audioManager.setCorridorVolume(0.1);
      } else {
        const t = (px - 2) / 0.5;
        this.audioManager.setElevatorVolume(t * 0.15);
        this.audioManager.setCorridorVolume((1 - t) * 0.1);
      }
    }

    if (this.elevatorOpened && this.npcPosition) {
      const dist = this.playerController.position.distanceTo(this.npcPosition);
      if (dist < 2) {
        if (this.dialogOpen) {
          this.uiManager.hideInteraction();
        } else {
          this.uiManager.showInteraction('[F] para hablar');
          if (this.interactPressed) {
            this.interactPressed = false;
            this.dialogPart = 0;
            this.dialogOpen = true;
            this.uiManager.setNPCDialogText(this.dialogParts[0]);
            this.uiManager.hideInteraction();
            this.uiManager.showNPCDialog();
            this.audioManager.playGontalk();
          }
        }
      } else if (!this.dialogOpen) {
        this.uiManager.hideInteraction();
      }
    }

    if (this.timerRunning && !this.gameOver) {
      this.timerElapsed += dt;
      const remaining = Math.max(0, this.timerDuration - this.timerElapsed);
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      this.timerElement.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

      if (remaining <= 10) {
        this.timerElement.classList.add('danger');
        this.timerElement.classList.remove('warning');
        if (Math.floor(this.timerElapsed * 2) !== Math.floor((this.timerElapsed - dt) * 2)) {
          this.audioManager._playBeep(880, 0.1, 0.15);
        }
      } else if (remaining <= 30) {
        this.timerElement.classList.add('warning');
        this.timerElement.classList.remove('danger');
      } else {
        this.timerElement.classList.remove('warning', 'danger');
      }

      if (remaining <= 0) {
        this.gameOver = true;
        this.timerRunning = false;
        this.playerController.unlock();
        document.getElementById('gameover').classList.add('open');
      }
    }

    if (this.smoke) {
      this.smoke.update(dt, this.timerRunning ? Math.max(0, this.timerDuration - this.timerElapsed) : 300);
    }

    if (this.box) this.box.update(dt);

    if (!this.puzzleSolved && !this.won && !this.dialogOpen && this.box) {
      const bp = new THREE.Vector3();
      this.box.group.getWorldPosition(bp);
      const dist = this.playerController.position.distanceTo(bp);
      if (dist < 1.2) {
        this.uiManager.showInteraction('[F] Interactuar');
        if (this.interactPressed) {
          this.interactPressed = false;
          this.uiManager.showMessage('codigo incorrecto', 'error', 2000);
        }
      }
    }

    if (this.puzzleSolved && !this.keyObtained && !this.won) {
      const kp = this.box.getKeyWorldPosition();
      const dist = this.playerController.position.distanceTo(kp);
      if (dist < 1.2) {
        this.uiManager.showInteraction('[F] Tomar llave');
        if (this.interactPressed) {
          this.interactPressed = false;
          this._takeKey();
        }
      }
    }

    if (this.elevatorOpened && !this.won && !this.dialogOpen && !this.gameOver
        && !(this.puzzleSolved && !this.keyObtained)
        && !(!this.puzzleSolved && this.box && this.playerController.position.distanceTo(this.box.group.position) < 1.8)) {
      const px = this.playerController.position;
      const doorKeys = this.puzzleDoorKeys;
      let nearDoor = null;
      let nearestDist = 1.4;

      for (const key of doorKeys) {
        const group = this.doors.get(key);
        if (!group) continue;
        const wp = new THREE.Vector3();
        group.getWorldPosition(wp);
        const dist = px.distanceTo(wp);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearDoor = key;
        }
      }

      if (nearDoor !== null) {
        if (nearDoor === '811') {
          this.uiManager.showInteraction('[F] Interactuar');
          if (this.interactPressed) {
            this.interactPressed = false;
            if (!this.lightsOut) this._lightsOut();
          }
        } else if (nearDoor === '803') {
          this.uiManager.showInteraction('[F] Interactuar');
          if (this.interactPressed) {
            this.interactPressed = false;
            if (!this.dizzy) this._triggerDizzy();
          }
        } else {
          this.uiManager.showInteraction('[F] para interactuar');
          if (this.interactPressed) {
            this.interactPressed = false;
            this._cycleDoorColor(nearDoor);
          }
        }
      } else {
        this.uiManager.hideInteraction();
      }
    }

    if (this.lightsOut) {
      this.lightsOutTimer += dt;
      if (this.lightsOutTimer >= LIGHTS_OUT_DURATION) {
        this.lightsOut = false;
        this.ambientLight.intensity = this.origAmbient;
        this.dirLight.intensity = this.origDir;
        this.fillLight.intensity = this.origFill;
      }
    }

    if (this.dizzy) {
      this.dizzyTimer += dt;
      const progress = this.dizzyTimer / DIZZY_DURATION;
      const pulse = Math.sin(progress * Math.PI * 10) * 0.25 + 0.25;
      this.camera.fov = 75 + Math.sin(progress * Math.PI * 8) * 3.5;
      this.camera.updateProjectionMatrix();
      if (this.dizzyOverlay) {
        this.dizzyOverlay.style.opacity = String((1 - progress) * pulse * 3);
      }
      if (progress >= 1) {
        this.dizzy = false;
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();
        if (this.dizzyOverlay) this.dizzyOverlay.style.opacity = '0';
      }
    }

    if (this.won) {
      this.wonTimer += dt;

      const door802 = this.doors.get('802');
      if (door802 && !this.door802AnimDone) {
        this.door802AnimTimer += dt;
        const t = Math.min(this.door802AnimTimer / 1.5, 1);
        const ease = -(Math.cos(Math.PI * t) - 1) / 2;
        door802.position.x = 1.95 + ease * 1.5;

        const glass = door802.children[3];
        if (glass && glass.material) glass.material.opacity = 0.6 * (1 - ease);

        if (this.door802WinLight) {
          this.door802WinLight.intensity = ease * 50;
          this.door802WinLight.position.x = 2 + ease * 1.5;
        }

        const expDelay = 0.3;
        const expT = Math.min(Math.max(0, (this.door802AnimTimer - expDelay) / 1.2), 1);
        const expEase = -(Math.cos(Math.PI * expT) - 1) / 2;
        this.sceneManager.renderer.toneMappingExposure = 0.95 + expEase * 8;

        if (t >= 1) {
          this.door802AnimDone = true;

          if (this.rightWallCollider1) {
            this.scene.remove(this.rightWallCollider1);
            this.playerController.removeCollisionBox(this.rightWallCollider1);
          }
          if (this.rightWallCollider2) {
            this.scene.remove(this.rightWallCollider2);
            this.playerController.removeCollisionBox(this.rightWallCollider2);
          }

          this._createRoom802();
          this.playerController.unlock();
        }
      }

      if (this.door802AnimDone) {
        if (!this.room802Created) {
          this._createRoom802();
          this.room802Created = true;
        }
      }

      const overlayT = Math.min(Math.max(0, (this.wonTimer - 0.2) / 1.3), 1);
      const overlayEase = -(Math.cos(Math.PI * overlayT) - 1) / 2;
      const overlay = document.getElementById('win-overlay');
      if (overlay) {
        overlay.style.background = 'rgba(255,255,255,' + (overlayEase * 1.0) + ')';
        if (overlayEase > 0 && !overlay.classList.contains('open')) {
          overlay.classList.add('open');
        }
      }
      if (this.wonTimer > 1.0) {
        document.getElementById('win-text').style.opacity = String(Math.min(1, (this.wonTimer - 1.0) * 2));
      }
    }

    this.sceneManager.render();
  }
}

import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { PlayerController } from './player/PlayerController.js';
import { AudioManager } from './systems/AudioManager.js';
import { UIManager } from './systems/UIManager.js';
import { LightFlicker } from './systems/LightFlicker.js';
import { Hallway } from './scene/Hallway.js';
import { Doors } from './scene/Doors.js';
import { ElectricalDoor } from './scene/ElectricalDoor.js';
import { ElevatorCore } from './scene/ElevatorCore.js';
import { CeilingLights } from './scene/CeilingLights.js';
import { Signage } from './scene/Signage.js';
import { SecurityCam } from './scene/SecurityCam.js';
import { Rug } from './scene/Rug.js';
import { NPC } from './scene/NPC.js';
import {
  MAP,
  BOUNDS,
  ELEVATOR_CORE,
  ELEVATOR_CABIN,
  ELEVATOR,
  PLAYER,
  LEFT_DOORS,
  RIGHT_OFFICE_DOORS,
  ELECTRICAL_Z,
  TOP_DOOR,
  BOTTOM_DOOR,
  COLORS,
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
      'Me dijo algo de la alfombra',
      'Si te apuras alcanzamos a llegar al 4:20',
    ];
    this.dialogPart = 0;

    this.timerElapsed = 0;
    this.timerDuration = 300;
    this.timerRunning = false;
    this.timerElement = document.getElementById('timer');
    this.gameOver = false;

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
      this.timerRunning = true;
      this.timerElement.classList.add('visible');
      this.audioManager._playBeep(660, 0.15, 0.2);
      setTimeout(() => this.audioManager._playBeep(880, 0.2, 0.2), 200);
    } else {
      this.uiManager.setNPCDialogText(this.dialogParts[this.dialogPart]);
      this.audioManager.playGontalk();
    }
  }

  setupScene() {
    this.hallway = new Hallway(this.scene);
    this.core = new ElevatorCore(this.scene);

    this.elevatorDoors = this.core.openDoors;
    for (const door of this.elevatorDoors) {
      this.playerController.addCollisionBox(door.leftDoor);
      this.playerController.addCollisionBox(door.rightDoor);
    }

    for (const [numStr, z] of Object.entries(LEFT_DOORS)) {
      const num = parseInt(numStr);
      const door = Doors.createLeft(this.scene, num, z);
      this.doors.set(num, door);
    }

    for (const [numStr, z] of Object.entries(RIGHT_OFFICE_DOORS)) {
      const num = parseInt(numStr);
      if (num === 802) {
        const greenDoor = Doors.createGreen(this.scene, num, z);
        this.doors.set(num, greenDoor);
      } else {
        const door = Doors.createRight(this.scene, num, z);
        this.doors.set(num, door);
      }
    }

    ElectricalDoor.create(this.scene, ELECTRICAL_Z.upper);
    ElectricalDoor.create(this.scene, ELECTRICAL_Z.lower);

    Doors.createTop(this.scene, TOP_DOOR.num);
    Doors.createBottom(this.scene, BOTTOM_DOOR.num);

    new Rug(this.scene);
    this.npc = new NPC(this.scene);
    this.npcPosition = this.npc.position;

    this.ceilingLights = new CeilingLights(this.scene, this.lightFlicker);
    this.signage = new Signage(this.scene);
    this.securityCam = new SecurityCam(this.scene);

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

    const lowerLen = BOUNDS.bottom - coreOpen;
    const lowerZ = (coreOpen + BOUNDS.bottom) / 2;
    createBox(0.2, H, lowerLen, BOUNDS.right, H / 2, lowerZ);

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

    createBox(0.6, 1.7, 0.6, -1.0, 0.85, 10);
  }

  start() {
    this.running = true;

    this.sceneManager.renderer.domElement.addEventListener(
      'click',
      () => {
        if (!this.audioManager.started) {
          this.audioManager.init();
          this.audioManager.startAmbient();
          this.audioManager.startMusic();
        }
        if (!this.locked) {
          this.playerController.lock();
        }
        if (this.elevatorPhase === 0) {
          this.elevatorPhase = 1;
          this.elevatorTimer = 0;
          this.audioManager.playElevatorArrival();
        }
      },
      { once: false }
    );

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
        this.audioManager.startMusic();
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
      const vol = Math.max(0, Math.min(1, (px - 2) / 1.5)) * 0.1;
      this.audioManager.setMusicVolume(vol);
    }

    if (this.elevatorOpened && this.npcPosition) {
      const dist = this.playerController.position.distanceTo(this.npcPosition);
      if (dist < 2) {
        if (this.dialogOpen) {
          this.uiManager.hideInteraction();
        } else {
          this.uiManager.showInteraction('[F] para continuar');
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

    this.sceneManager.render();
  }
}

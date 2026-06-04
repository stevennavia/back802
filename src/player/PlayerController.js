import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { PLAYER } from '../utils/constants.js';

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, domElement);

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isRunning = false;
    this.locked = false;

    this.position = camera.position;
    this.height = PLAYER.height;
    this.radius = PLAYER.radius;
    this.walkSpeed = PLAYER.walkSpeed;
    this.runSpeed = PLAYER.runSpeed;
    this.mouseSensitivity = PLAYER.mouseSensitivity;

    this.collisionBoxes = [];
    this.autoZoom = null;

    this.controls.disconnect();

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerlockChange = this._onPointerlockChange.bind(this);
    this._onPointerlockError = this._onPointerlockError.bind(this);

    const doc = domElement.ownerDocument;
    doc.addEventListener('mousemove', this._onMouseMove);
    doc.addEventListener('pointerlockchange', this._onPointerlockChange);
    doc.addEventListener('pointerlockerror', this._onPointerlockError);

    this._euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this._setupTouchControls(domElement);
    this._setupListeners(domElement);
  }

  _setupTouchControls(el) {
    this._touchMoveId = null;
    this._touchLookId = null;
    this._touchMoveCenter = { x: 0, y: 0 };
    this._touchLookLast = { x: 0, y: 0 };

    el.addEventListener('touchstart', (e) => {
      this.locked = true;
      for (const touch of e.changedTouches) {
        const x = touch.clientX;
        const y = touch.clientY;
        const half = window.innerWidth / 2;

        if (x < half && this._touchMoveId === null) {
          this._touchMoveId = touch.identifier;
          this._touchMoveCenter.x = x;
          this._touchMoveCenter.y = y;
        } else if (x >= half && this._touchLookId === null) {
          this._touchLookId = touch.identifier;
          this._touchLookLast.x = x;
          this._touchLookLast.y = y;
        }
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      for (const touch of e.changedTouches) {
        const x = touch.clientX;
        const y = touch.clientY;

        if (touch.identifier === this._touchMoveId) {
          const dx = x - this._touchMoveCenter.x;
          const dy = y - this._touchMoveCenter.y;
          const dead = 20;

          this.moveLeft = dx < -dead;
          this.moveRight = dx > dead;
          this.moveForward = dy < -dead;
          this.moveBackward = dy > dead;
        }

        if (touch.identifier === this._touchLookId) {
          const dx = x - this._touchLookLast.x;
          const dy = y - this._touchLookLast.y;
          this._euler.setFromQuaternion(this.camera.quaternion);
          this._euler.y -= dx * this.mouseSensitivity;
          this._euler.x -= dy * this.mouseSensitivity;
          this.camera.quaternion.setFromEuler(this._euler);
          this._touchLookLast.x = x;
          this._touchLookLast.y = y;
        }
      }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this._touchMoveId) {
          this._touchMoveId = null;
          this.moveForward = false;
          this.moveBackward = false;
          this.moveLeft = false;
          this.moveRight = false;
        }
        if (touch.identifier === this._touchLookId) {
          this._touchLookId = null;
        }
      }
    }, { passive: true });

    el.addEventListener('touchcancel', () => {
      this._touchMoveId = null;
      this._touchLookId = null;
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
    }, { passive: true });
  }

  _onMouseMove(event) {
    if (!this.controls.isLocked) return;
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    this._euler.setFromQuaternion(this.camera.quaternion);
    this._euler.y -= movementX * this.mouseSensitivity;
    this._euler.x -= movementY * this.mouseSensitivity;
    this.camera.quaternion.setFromEuler(this._euler);
  }

  _onPointerlockChange() {
    if (this.controls.domElement.ownerDocument.pointerLockElement === this.controls.domElement) {
      this.controls.isLocked = true;
      this.locked = true;
    } else {
      this.controls.isLocked = false;
      this.locked = false;
    }
  }

  _onPointerlockError() {
    console.warn('PointerLockControls: Unable to lock pointer');
  }

  _setupListeners(domElement) {
    domElement.addEventListener('click', () => {
      if (!this.locked) {
        this.controls.lock();
      }
    });

    this.controls.addEventListener('lock', () => {
      this.locked = true;
    });

    this.controls.addEventListener('unlock', () => {
      this.locked = false;
    });

    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': this.moveForward = true; break;
        case 'KeyS': this.moveBackward = true; break;
        case 'KeyA': this.moveLeft = true; break;
        case 'KeyD': this.moveRight = true; break;
        case 'ShiftLeft':
        case 'ShiftRight': this.isRunning = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': this.moveForward = false; break;
        case 'KeyS': this.moveBackward = false; break;
        case 'KeyA': this.moveLeft = false; break;
        case 'KeyD': this.moveRight = false; break;
        case 'ShiftLeft':
        case 'ShiftRight': this.isRunning = false; break;
      }
    });
  }

  addCollisionBox(mesh) {
    this.collisionBoxes.push(mesh);
  }

  removeCollisionBox(mesh) {
    const idx = this.collisionBoxes.indexOf(mesh);
    if (idx !== -1) this.collisionBoxes.splice(idx, 1);
  }

  update(dt) {
    if (!this.locked) return;

    if (this.autoZoom) {
      const target = this.autoZoom;
      this.camera.position.lerp(target, Math.min(1, 4 * dt));
      if (this.camera.position.distanceTo(target) < 0.01) {
        this.camera.position.copy(target);
      }
      return;
    }

    const speed = this.isRunning ? this.runSpeed : this.walkSpeed;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDelta = new THREE.Vector3();
    if (this.moveForward) moveDelta.add(forward.clone().multiplyScalar(speed * dt));
    if (this.moveBackward) moveDelta.add(forward.clone().multiplyScalar(-speed * dt));
    if (this.moveLeft) moveDelta.add(right.clone().multiplyScalar(-speed * dt));
    if (this.moveRight) moveDelta.add(right.clone().multiplyScalar(speed * dt));

    const newPos = this.position.clone().add(moveDelta);
    newPos.y = this.height;

    if (!this._checkCollision(newPos)) {
      this.position.copy(newPos);
    } else {
      const tryX = new THREE.Vector3(newPos.x, this.height, this.position.z);
      if (!this._checkCollision(tryX)) {
        this.position.x = tryX.x;
      }
      const tryZ = new THREE.Vector3(this.position.x, this.height, newPos.z);
      if (!this._checkCollision(tryZ)) {
        this.position.z = tryZ.z;
      }
    }
  }

  _checkCollision(pos) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(pos.x - this.radius, pos.y - this.height, pos.z - this.radius),
      new THREE.Vector3(pos.x + this.radius, pos.y, pos.z + this.radius)
    );
    for (const box of this.collisionBoxes) {
      const box3 = new THREE.Box3().setFromObject(box);
      if (playerBox.intersectsBox(box3)) {
        return true;
      }
    }
    return false;
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }
}

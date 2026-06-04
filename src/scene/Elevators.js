import * as THREE from 'three';
import { ELEVATOR, COLORS } from '../utils/constants.js';

export class Elevators {
  static create(scene, positions, openIndex = -1) {
    const frameMat = new THREE.MeshStandardMaterial({
      color: COLORS.elevatorFrame,
      roughness: 0.3,
      metalness: 0.7,
    });

    const doorMat = new THREE.MeshStandardMaterial({
      color: COLORS.elevatorDoor,
      roughness: 0.35,
      metalness: 0.6,
    });

    const indentMat = new THREE.MeshStandardMaterial({
      color: COLORS.elevatorIndent,
      roughness: 0.5,
      metalness: 0.4,
    });

    const openDoors = [];

    positions.forEach((z, idx) => {
      const group = new THREE.Group();
      const W = ELEVATOR.width;
      const H = ELEVATOR.height;
      const fw = 0.08;
      const fd = 0.12;

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

      if (idx === openIndex) {
        const closedZ = W / 4 - 0.02;
        const leftDoor = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, H - fw * 2, W / 2 - 0.06),
          doorMat
        );
        leftDoor.position.set(0, 0, -closedZ);
        group.add(leftDoor);

        const rightDoor = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, H - fw * 2, W / 2 - 0.06),
          doorMat
        );
        rightDoor.position.set(0, 0, closedZ);
        group.add(rightDoor);

        openDoors.push({
          leftDoor,
          rightDoor,
          group,
          closedZ,
          openZ: W / 2 + 0.02,
        });
      } else {
        for (let side = -1; side <= 1; side += 2) {
          const door = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, H - fw * 2, W / 2 - 0.06),
            doorMat
          );
          door.position.set(0, 0, side * (W / 4 + 0.02));
          group.add(door);

          const indent = new THREE.Mesh(
            new THREE.BoxGeometry(0.045, H * 0.35, 0.01),
            indentMat
          );
          indent.position.set(0, 0.1, side * (W / 4 + 0.04));
          group.add(indent);
        }
      }

      const indicatorMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: 0x333333,
        emissiveIntensity: 0.1,
      });
      const indicator = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.08, 0.15),
        indicatorMat
      );
      indicator.position.set(0, H / 2 + 0.08, 0);
      group.add(indicator);

      group.position.set(3 - fd / 2, H / 2, z);
      group.rotation.y = Math.PI;
      scene.add(group);
    });

    return { openDoors };
  }
}

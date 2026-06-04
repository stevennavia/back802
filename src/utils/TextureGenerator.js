import * as THREE from 'three';
import { COLORS } from './constants.js';

export class TextureGenerator {
  static createFloorMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#b0a89c';
    ctx.fillRect(0, 0, 512, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.4,
      metalness: 0.05,
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cols = 8;
      const rows = 16;
      const tw = canvas.width / cols;
      const th = canvas.height / rows;
      const sw = img.width / 4;
      const sh = img.height / 4;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = Math.random() * (img.width - sw);
          const oy = Math.random() * (img.height - sh);
          ctx.drawImage(img, ox, oy, sw, sh, c * tw, r * th, tw, th);
          ctx.fillStyle = 'rgba(175,165,150,0.25)';
          ctx.fillRect(c * tw, r * th, tw, th);
        }
      }

      ctx.fillStyle = 'rgba(175,165,150,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const a = Math.random() * 0.04;
        ctx.fillStyle = `rgba(50,40,30,${a})`;
        ctx.fillRect(x, y, 3, 3);
      }

      tex.needsUpdate = true;
    };
    img.src = '/patron.jpg';

    return mat;
  }

  static createWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const g = 235 + Math.random() * 15;
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(x, y, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createCeilingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e0ddd8';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#d0ccc6';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, 124, 124);
    ctx.strokeRect(6, 6, 116, 116);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 12);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createGlassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(200,220,240,0.4)';
    ctx.fillRect(0, 0, 64, 64);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      ctx.fillStyle = 'rgba(220,235,250,0.15)';
      ctx.fillRect(x, y, 3, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createDoorNumberTexture(num) {
    const str = String(num);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 600, 300);

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 2;
    ctx.font = 'bold 200px Arial, sans-serif';
    ctx.fillText(str, 300, 150);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.premultiplyAlpha = true;
    return tex;
  }

  static createElectricalSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = COLORS.electricalDoor;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, 122, 122);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SALA', 64, 40);
    ctx.fillText('ELECTRICA', 64, 62);
    ctx.fillText('RIESGO', 64, 88);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createEscapeSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#882222';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 120, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SALIDA DE', 64, 40);
    ctx.fillText('EMERGENCIA', 64, 64);
    ctx.fillText('EXIT', 64, 92);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createExitSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#004422';
    ctx.fillRect(0, 0, 128, 48);

    ctx.fillStyle = '#00cc66';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT / SALIDA', 64, 24);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  static createInteriorBlurTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 128);

    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 128;
      const v = 10 + Math.random() * 30;
      ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
      ctx.fillRect(x, y, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }
}

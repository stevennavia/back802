import { Game } from './Game.js';

console.log('back802: starting...');

try {
  const game = new Game();
  console.log('back802: Game created, starting loop');
  game.start();
  console.log('back802: started successfully');

  setTimeout(() => {
    const canvas = document.querySelector('canvas');
    console.log('back802: canvas found:', !!canvas, 'size:', canvas?.width, 'x', canvas?.height);
  }, 100);
} catch (e) {
  console.error('back802 FATAL:', e);
  const msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#f44;font-family:monospace;font-size:14px;text-align:center;background:rgba(0,0,0,0.9);padding:20px;border-radius:4px;max-width:80vw;z-index:999;';
  msg.textContent = 'Error: ' + (e.message || e) + '\n\nRevisa la consola (F12)';
  document.body.appendChild(msg);
}

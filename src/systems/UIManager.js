export class UIManager {
  constructor() {
    this.reticle = document.getElementById('reticle');
    this.contextText = document.getElementById('context-text');
    this.message = document.getElementById('message');
    this.hint = document.getElementById('hint');
    this.npcDialog = document.getElementById('npc-dialog');
    this.npcText = document.getElementById('npc-text');
    this.npcName = document.getElementById('npc-name');
    this.messageTimeout = null;
  }

  showContextText(text) {
    if (text) {
      this.contextText.textContent = text;
      this.contextText.style.opacity = '1';
      this.reticle.classList.add('active');
    } else {
      this.contextText.style.opacity = '0';
      this.reticle.classList.remove('active');
    }
  }

  showMessage(text, type, duration) {
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.message.textContent = text;
    this.message.className = 'message ' + (type || 'info');
    this.message.style.opacity = '1';

    if (duration) {
      this.messageTimeout = setTimeout(() => {
        this.message.style.opacity = '0';
      }, duration);
    }
  }

  hideMessage() {
    this.message.style.opacity = '0';
  }

  showInteraction(text) {
    this.contextText.textContent = text;
    this.contextText.style.opacity = '1';
    this.reticle.classList.add('active');
  }

  hideInteraction() {
    this.contextText.style.opacity = '0';
    this.reticle.classList.remove('active');
  }

  showNPCDialog() {
    document.getElementById('npc-portrait').src = '/gon2.png';
    if (this.npcName) this.npcName.textContent = 'Gon:';
    this.npcDialog.classList.add('open');
  }

  hideNPCDialog() {
    this.npcDialog.classList.remove('open');
  }

  setNPCDialogText(text) {
    this.npcText.textContent = text;
  }

  showCameraDialog(text) {
    document.getElementById('npc-portrait').src = '/donluis.png';
    if (this.npcName) this.npcName.textContent = 'Don Luis:';
    this.npcText.textContent = text;
    this.npcDialog.classList.add('open');
  }
}

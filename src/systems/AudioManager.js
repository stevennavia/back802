export class AudioManager {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.ambientOsc = null;
    this.masterGain = null;
    this.started = false;
    this.dingBuffer = null;
    this.musicGain = null;
    this.musicSource = null;
    this.musicBuffer = null;
    this.gontalkBuffer = null;
    this.gontalkSource = null;
  }

  init() {
    if (this.started) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.started = true;
    } catch (e) {
      console.warn('Audio not available');
    }
  }

  startAmbient() {
    if (!this.ctx) return;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.08;
    this.ambientGain.connect(this.masterGain);

    const noiseBuffer = this._createNoiseBuffer(4);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 1;

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'highpass';
    filter2.frequency.value = 80;

    noise.connect(filter);
    filter.connect(filter2);
    filter2.connect(this.ambientGain);
    noise.start();

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;
    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.025;
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start();
    this.ambientOsc = osc;

    setInterval(() => {
      if (!this.ambientGain) return;
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setTargetAtTime(
        0.06 + Math.random() * 0.04,
        now,
        0.5
      );
    }, 2000);
  }

  playCorrect() {
    this._playBeep(880, 0.1, 0.15);
    setTimeout(() => this._playBeep(1100, 0.1, 0.15), 100);
  }

  playError() {
    this._playBeep(200, 0.2, 0.25);
    setTimeout(() => this._playBeep(160, 0.3, 0.25), 200);
  }

  playDoorClick() {
    this._playNoise(0.08, 0.3);
  }

  playButtonClick() {
    this._playBeep(600, 0.05, 0.1);
  }

  playDoorOpen() {
    const duration = 1.5;
    if (!this.ctx) return;
    const buf = this._createNoiseBuffer(duration);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start();
    setTimeout(() => src.stop(), duration * 1000);
  }

  playElevatorArrival() {
    if (!this.ctx) return;
    this._playBeep(800, 0.15, 0.2);
    setTimeout(() => {
      const duration = 1.5;
      const buf = this._createNoiseBuffer(duration);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      src.start();
      setTimeout(() => src.stop(), duration * 1000);
    }, 100);
  }

  playDing() {
    if (!this.ctx) return;
    if (this.dingBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.dingBuffer;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.4;
      src.connect(gain);
      gain.connect(this.masterGain);
      src.start();
      return;
    }
    fetch('/ding.mp3')
      .then((res) => res.arrayBuffer())
      .then((buf) => this.ctx.decodeAudioData(buf))
      .then((buf) => {
        this.dingBuffer = buf;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.4;
        src.connect(gain);
        gain.connect(this.masterGain);
        src.start();
      })
      .catch(() => console.warn('Could not load ding.mp3'));
  }

  startMusic() {
    if (!this.ctx || this.musicSource) return;

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.masterGain);

    const play = (buf) => {
      this.musicBuffer = buf;
      this.musicSource = this.ctx.createBufferSource();
      this.musicSource.buffer = buf;
      this.musicSource.loop = true;
      this.musicSource.connect(this.musicGain);
      this.musicSource.start();
    };

    if (this.musicBuffer) {
      play(this.musicBuffer);
      return;
    }

    fetch('/music.mp3')
      .then((res) => res.arrayBuffer())
      .then((buf) => this.ctx.decodeAudioData(buf))
      .then((buf) => {
        this.musicBuffer = buf;
        if (!this.musicSource) play(buf);
      })
      .catch(() => console.warn('Could not load music.mp3'));
  }

  setMusicVolume(vol) {
    if (!this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(Math.max(0, vol), now, 0.1);
  }

  playGontalk() {
    if (!this.ctx) return;

    if (this.gontalkSource) {
      this.gontalkSource.stop();
      this.gontalkSource = null;
    }

    const play = (buf) => {
      this.gontalkSource = this.ctx.createBufferSource();
      this.gontalkSource.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.5;
      this.gontalkSource.connect(gain);
      gain.connect(this.masterGain);
      this.gontalkSource.start();
    };

    if (this.gontalkBuffer) {
      play(this.gontalkBuffer);
      return;
    }

    fetch('/gontalk.mp3')
      .then((res) => res.arrayBuffer())
      .then((buf) => this.ctx.decodeAudioData(buf))
      .then((buf) => {
        this.gontalkBuffer = buf;
        play(buf);
      })
      .catch(() => console.warn('Could not load gontalk.mp3'));
  }

  stopGontalk() {
    if (this.gontalkSource) {
      try { this.gontalkSource.stop(); } catch (e) {}
      this.gontalkSource = null;
    }
  }

  _playBeep(freq, duration, volume = 0.15) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _playNoise(duration, volume = 0.2) {
    if (!this.ctx) return;
    const buf = this._createNoiseBuffer(duration);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  _createNoiseBuffer(duration) {
    const sr = this.ctx.sampleRate;
    const len = sr * duration;
    const buf = this.ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
}

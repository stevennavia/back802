export class LightFlicker {
  constructor() {
    this.lights = [];
  }

  add(light, config = {}) {
    this.lights.push({
      light,
      baseIntensity: config.baseIntensity ?? light.intensity,
      flickerChance: config.flickerChance ?? 0.0008,
      flickerDuration: config.flickerDuration ?? 0.4 + Math.random() * 0.6,
      minIntensity: config.minIntensity ?? 0.05,
      timer: 0,
      isFlickering: false,
      flickerSpeed: config.flickerSpeed ?? 10,
      pulseAmplitude: config.pulseAmplitude ?? 0,
      pulseSpeed: config.pulseSpeed ?? 0,
      phase: Math.random() * Math.PI * 2,
      initialIntensity: light.intensity,
    });
  }

  update(dt) {
    for (const l of this.lights) {
      const now = performance.now();

      if (l.pulseAmplitude > 0) {
        const pulse = Math.sin(now * l.pulseSpeed + l.phase) * l.pulseAmplitude;
        if (!l.isFlickering) {
          l.light.intensity = l.baseIntensity + pulse;
        }
      }

      if (!l.isFlickering) {
        if (Math.random() < l.flickerChance) {
          l.isFlickering = true;
          l.timer = l.flickerDuration * (0.5 + Math.random() * 0.5);
        }
      } else {
        l.timer -= dt;
        l.light.intensity = l.minIntensity + Math.random() * l.baseIntensity * 0.3;
        if (l.timer <= 0) {
          l.isFlickering = false;
          l.light.intensity = l.baseIntensity;
        }
      }
    }
  }
}

/**
 * UI Controller - Manages HUD updates and user interface
 */

import { formatDistance, formatTime } from '../utils/helpers.js';

export class UIController {
  constructor() {
    this.elements = {
      speedValue: document.getElementById('speed-value'),
      speedGauge: document.getElementById('speed-gauge'),
      throttleValue: document.getElementById('throttle-value'),
      throttleGauge: document.getElementById('throttle-gauge'),
      brakeValue: document.getElementById('brake-value'),
      brakeGauge: document.getElementById('brake-gauge'),
      nextStation: document.getElementById('next-station'),
      stationDistance: document.getElementById('station-distance'),
      currentKm: document.getElementById('current-km'),
      currentTime: document.getElementById('current-time'),
      fpsValue: document.getElementById('fps-value'),
      timeScale: document.getElementById('time-scale'),
      cameraMode: document.getElementById('camera-mode'),
      hud: document.getElementById('hud'),
      loadingScreen: document.getElementById('loading-screen')
    };

    this.lastFrameTime = performance.now();
    this.fps = 60;
  }

  updateSpeed(speedKmh, maxSpeed = 120) {
    this.elements.speedValue.textContent = `${Math.round(speedKmh)} km/h`;
    const percentage = (speedKmh / maxSpeed) * 100;
    this.elements.speedGauge.style.width = `${percentage}%`;
  }

  updateThrottle(throttle) {
    const percentage = Math.round(throttle * 100);
    this.elements.throttleValue.textContent = `${percentage}%`;
    this.elements.throttleGauge.style.width = `${percentage}%`;
  }

  updateBrake(brake) {
    const percentage = Math.round(brake * 100);
    this.elements.brakeValue.textContent = `${percentage}%`;
    this.elements.brakeGauge.style.width = `${percentage}%`;
  }

  updateStationInfo(stationData, distanceKm) {
    this.elements.nextStation.textContent = stationData.name;
    this.elements.stationDistance.textContent = formatDistance(distanceKm);
  }

  updatePosition(km) {
    this.elements.currentKm.textContent = formatDistance(km);
  }

  updateTime(gameTime) {
    this.elements.currentTime.textContent = formatTime(gameTime);
  }

  updateFPS() {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.fps = Math.round(1000 / delta);
    this.elements.fpsValue.textContent = this.fps;
    this.lastFrameTime = now;
  }

  updateTimeScale(scale) {
    this.elements.timeScale.textContent = `${scale}x`;
  }

  updateCameraMode(modeName) {
    this.elements.cameraMode.textContent = modeName;
  }

  showHUD() {
    this.elements.hud.classList.remove('hidden');
  }

  hideHUD() {
    this.elements.hud.classList.add('hidden');
  }

  updateLoadingProgress(progress, text = 'Cargando...') {
    const loadingBarFill = document.getElementById('loading-bar-fill');
    const loadingText = document.getElementById('loading-text');

    if (loadingBarFill) {
      loadingBarFill.style.width = `${progress}%`;
    }
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  hideLoadingScreen() {
    this.elements.loadingScreen.classList.add('hidden');
  }

  showLoadingScreen() {
    this.elements.loadingScreen.classList.remove('hidden');
  }
}

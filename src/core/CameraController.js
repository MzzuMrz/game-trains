/**
 * Camera controller with multiple view modes
 */

import * as THREE from 'three';

export const CameraModes = {
  DRIVER_VIEW: 'DRIVER_VIEW',
  EXTERNAL_FOLLOW: 'EXTERNAL_FOLLOW',
  EXTERNAL_FIXED: 'EXTERNAL_FIXED',
  CINEMATIC: 'CINEMATIC'
};

export class CameraController {
  constructor(camera, train) {
    this.camera = camera;
    this.train = train;
    this.mode = CameraModes.DRIVER_VIEW;

    // Camera offsets for different modes
    this.offsets = {
      [CameraModes.DRIVER_VIEW]: new THREE.Vector3(0, 3, 4),
      [CameraModes.EXTERNAL_FOLLOW]: new THREE.Vector3(0, 8, -20),
      [CameraModes.EXTERNAL_FIXED]: new THREE.Vector3(15, 5, 0),
      [CameraModes.CINEMATIC]: new THREE.Vector3(20, 10, -10)
    };

    this.lookAtOffset = new THREE.Vector3(0, 2, 10);
    this.smoothing = 0.1;

    // For external fixed camera
    this.fixedCameraDistance = 0;
    this.fixedCameraTimer = 0;
    this.fixedCameraDuration = 5; // seconds
  }

  update(deltaTime, trainPosition) {
    switch (this.mode) {
      case CameraModes.DRIVER_VIEW:
        this.updateDriverView(trainPosition);
        break;
      case CameraModes.EXTERNAL_FOLLOW:
        this.updateExternalFollow(trainPosition);
        break;
      case CameraModes.EXTERNAL_FIXED:
        this.updateExternalFixed(deltaTime, trainPosition);
        break;
      case CameraModes.CINEMATIC:
        this.updateCinematic(trainPosition);
        break;
    }
  }

  updateDriverView(trainPosition) {
    const offset = this.offsets[CameraModes.DRIVER_VIEW];
    const targetPos = trainPosition.clone().add(offset);

    // Smooth camera movement
    this.camera.position.lerp(targetPos, this.smoothing);

    // Look ahead along the track
    const lookAt = trainPosition.clone().add(this.lookAtOffset);
    this.camera.lookAt(lookAt);
  }

  updateExternalFollow(trainPosition) {
    const offset = this.offsets[CameraModes.EXTERNAL_FOLLOW];
    const targetPos = trainPosition.clone().add(offset);

    this.camera.position.lerp(targetPos, this.smoothing);
    this.camera.lookAt(trainPosition);
  }

  updateExternalFixed(deltaTime, trainPosition) {
    this.fixedCameraTimer += deltaTime;

    // Switch to new fixed position every few seconds
    if (this.fixedCameraTimer > this.fixedCameraDuration) {
      this.fixedCameraTimer = 0;
      this.fixedCameraDistance = trainPosition.z + 50;
    }

    const offset = this.offsets[CameraModes.EXTERNAL_FIXED].clone();
    offset.z = this.fixedCameraDistance;

    this.camera.position.copy(offset);
    this.camera.lookAt(trainPosition);
  }

  updateCinematic(trainPosition) {
    // Orbiting camera
    const time = Date.now() * 0.0001;
    const radius = 30;

    const offset = new THREE.Vector3(
      Math.cos(time) * radius,
      10,
      trainPosition.z + Math.sin(time) * radius
    );

    this.camera.position.copy(offset);
    this.camera.lookAt(trainPosition);
  }

  cycleMode() {
    const modes = Object.values(CameraModes);
    const currentIndex = modes.indexOf(this.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.mode = modes[nextIndex];
    this.fixedCameraTimer = 0;
    return this.getModeName();
  }

  getModeName() {
    const names = {
      [CameraModes.DRIVER_VIEW]: 'Conductor',
      [CameraModes.EXTERNAL_FOLLOW]: 'Seguimiento',
      [CameraModes.EXTERNAL_FIXED]: 'Cámara Fija',
      [CameraModes.CINEMATIC]: 'Cinemática'
    };
    return names[this.mode];
  }

  setMode(mode) {
    if (Object.values(CameraModes).includes(mode)) {
      this.mode = mode;
    }
  }
}

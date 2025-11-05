/**
 * Camera controller with multiple view modes
 * Enhanced cabin view with realistic positioning and effects
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

    // Camera offsets for different modes (relative to train)
    this.offsets = {
      [CameraModes.DRIVER_VIEW]: new THREE.Vector3(0.3, 3.2, 4), // Slightly offset from center
      [CameraModes.EXTERNAL_FOLLOW]: new THREE.Vector3(0, 8, -20),
      [CameraModes.EXTERNAL_FIXED]: new THREE.Vector3(15, 5, 0),
      [CameraModes.CINEMATIC]: new THREE.Vector3(20, 10, -10)
    };

    this.lookAtOffset = new THREE.Vector3(0, 3, 20); // Look further ahead
    this.smoothing = 0.15; // Smoother movement

    // Cabin camera shake
    this.shakeAmount = 0;
    this.shakeOffset = new THREE.Vector3();
    this.shakeFrequency = 0;

    // Head bob effect
    this.headBobTime = 0;
    this.headBobAmount = 0;

    // Train rotation for proper cabin alignment
    this.trainRotation = 0;

    // For external fixed camera
    this.fixedCameraDistance = 0;
    this.fixedCameraTimer = 0;
    this.fixedCameraDuration = 5; // seconds

    // FOV adjustment for cabin view
    this.defaultFOV = camera.fov;
    this.cabinFOV = 65; // Slightly narrower for more realistic feel
  }

  update(deltaTime, trainPosition, trainSpeed = 0, trainRotation = 0) {
    this.trainRotation = trainRotation;

    switch (this.mode) {
      case CameraModes.DRIVER_VIEW:
        this.updateDriverView(deltaTime, trainPosition, trainSpeed);
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

  updateDriverView(deltaTime, trainPosition, trainSpeed) {
    // Update camera shake based on speed
    this.updateCameraShake(deltaTime, trainSpeed);

    // Update head bob
    this.updateHeadBob(deltaTime, trainSpeed);

    // Base position in cabin
    const offset = this.offsets[CameraModes.DRIVER_VIEW].clone();

    // Apply head bob
    offset.y += Math.sin(this.headBobTime * 2) * this.headBobAmount;
    offset.x += Math.cos(this.headBobTime) * this.headBobAmount * 0.5;

    // Rotate offset to match train orientation
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.trainRotation);

    // Calculate target position
    const targetPos = trainPosition.clone().add(offset);

    // Add camera shake
    targetPos.add(this.shakeOffset);

    // Smooth camera movement
    this.camera.position.lerp(targetPos, this.smoothing);

    // Calculate look-at point (ahead of train, following track direction)
    const lookAtOffset = this.lookAtOffset.clone();
    lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.trainRotation);
    const lookAt = trainPosition.clone().add(lookAtOffset);

    // Smooth camera rotation
    const currentLookAt = new THREE.Vector3(0, 0, -1);
    currentLookAt.applyQuaternion(this.camera.quaternion);
    currentLookAt.add(this.camera.position);

    const targetDirection = lookAt.clone().sub(this.camera.position).normalize();
    const currentDirection = currentLookAt.clone().sub(this.camera.position).normalize();

    currentDirection.lerp(targetDirection, this.smoothing * 2);
    this.camera.lookAt(this.camera.position.clone().add(currentDirection));

    // Adjust FOV for cabin view
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.cabinFOV, 0.1);
    this.camera.updateProjectionMatrix();
  }

  updateCameraShake(deltaTime, speed) {
    // Shake increases with speed
    const speedKmh = speed;
    this.shakeAmount = Math.min(speedKmh / 120, 1) * 0.003; // Max shake at 120 km/h
    this.shakeFrequency += deltaTime * 15 * (1 + speedKmh / 60); // Faster shake at higher speeds

    // Generate shake using sine waves at different frequencies
    this.shakeOffset.set(
      Math.sin(this.shakeFrequency * 2.3) * this.shakeAmount,
      Math.sin(this.shakeFrequency * 3.1) * this.shakeAmount * 0.5,
      Math.sin(this.shakeFrequency * 1.7) * this.shakeAmount * 0.3
    );

    // Add random jitter for realism
    if (speed > 10) {
      this.shakeOffset.x += (Math.random() - 0.5) * this.shakeAmount * 0.5;
      this.shakeOffset.y += (Math.random() - 0.5) * this.shakeAmount * 0.3;
    }
  }

  updateHeadBob(deltaTime, speed) {
    // Subtle head bob based on speed
    if (speed > 5) {
      this.headBobTime += deltaTime * (2 + speed / 60);
      this.headBobAmount = Math.min(speed / 120, 1) * 0.01; // Subtle bob
    } else {
      this.headBobTime = 0;
      this.headBobAmount *= 0.95; // Fade out when stopped
    }
  }

  updateExternalFollow(trainPosition) {
    const offset = this.offsets[CameraModes.EXTERNAL_FOLLOW].clone();

    // Rotate offset to follow behind train
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.trainRotation);

    const targetPos = trainPosition.clone().add(offset);

    this.camera.position.lerp(targetPos, this.smoothing);
    this.camera.lookAt(trainPosition);

    // Reset FOV for external views
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.defaultFOV, 0.1);
    this.camera.updateProjectionMatrix();
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

    // Reset FOV
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.defaultFOV, 0.1);
    this.camera.updateProjectionMatrix();
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

    // Reset FOV
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.defaultFOV, 0.1);
    this.camera.updateProjectionMatrix();
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

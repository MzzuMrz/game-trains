/**
 * Cabin interior model for driver's view
 * Provides immersive cockpit experience
 */

import * as THREE from 'three';

export class CabinInterior {
  constructor() {
    this.group = new THREE.Group();
    this.createCabinInterior();
  }

  createCabinInterior() {
    // Dashboard/control panel
    this.createDashboard();

    // Windshield frame
    this.createWindshieldFrame();

    // Side panels
    this.createSidePanels();

    // Steering/throttle controls
    this.createControls();

    // Instrument gauges
    this.createGauges();

    // Side mirrors
    this.createMirrors();

    // Seats
    this.createSeats();
  }

  createDashboard() {
    // Main dashboard panel
    const dashGeometry = new THREE.BoxGeometry(3, 0.6, 1);
    const dashMaterial = new THREE.MeshLambertMaterial({
      color: 0x2C3E50,
      flatShading: true
    });
    const dashboard = new THREE.Mesh(dashGeometry, dashMaterial);
    dashboard.position.set(0, 2.8, 4.5);
    this.group.add(dashboard);

    // Lower dashboard section
    const lowerDashGeometry = new THREE.BoxGeometry(3.2, 0.4, 0.8);
    const lowerDash = new THREE.Mesh(lowerDashGeometry, dashMaterial);
    lowerDash.position.set(0, 2.4, 4.3);
    this.group.add(lowerDash);
  }

  createWindshieldFrame() {
    const frameMaterial = new THREE.MeshLambertMaterial({
      color: 0x1A1A1A,
      flatShading: true
    });

    // Top frame
    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.15, 0.1),
      frameMaterial
    );
    topFrame.position.set(0, 3.8, 4.8);
    this.group.add(topFrame);

    // Bottom frame
    const bottomFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.15, 0.1),
      frameMaterial
    );
    bottomFrame.position.set(0, 2.6, 4.8);
    this.group.add(bottomFrame);

    // Left frame
    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.4, 0.1),
      frameMaterial
    );
    leftFrame.position.set(-1.85, 3.2, 4.8);
    this.group.add(leftFrame);

    // Right frame
    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.4, 0.1),
      frameMaterial
    );
    rightFrame.position.set(1.85, 3.2, 4.8);
    this.group.add(rightFrame);

    // Center support bar
    const centerBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.2, 0.1),
      frameMaterial
    );
    centerBar.position.set(0, 3.2, 4.8);
    this.group.add(centerBar);

    // Windshield wipers (stationary)
    const wiperGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.05);
    const wiperMaterial = new THREE.MeshLambertMaterial({
      color: 0x000000,
      flatShading: true
    });

    const leftWiper = new THREE.Mesh(wiperGeometry, wiperMaterial);
    leftWiper.position.set(-0.8, 2.7, 4.85);
    leftWiper.rotation.z = -0.3;
    this.group.add(leftWiper);

    const rightWiper = new THREE.Mesh(wiperGeometry, wiperMaterial);
    rightWiper.position.set(0.8, 2.7, 4.85);
    rightWiper.rotation.z = 0.3;
    this.group.add(rightWiper);
  }

  createSidePanels() {
    const panelMaterial = new THREE.MeshLambertMaterial({
      color: 0x34495E,
      flatShading: true
    });

    // Left panel
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.5, 2),
      panelMaterial
    );
    leftPanel.position.set(-1.8, 2.8, 3.5);
    this.group.add(leftPanel);

    // Right panel
    const rightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.5, 2),
      panelMaterial
    );
    rightPanel.position.set(1.8, 2.8, 3.5);
    this.group.add(rightPanel);

    // Door handles
    const handleGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.3);
    const handleMaterial = new THREE.MeshLambertMaterial({
      color: 0x7F8C8D,
      flatShading: true
    });

    const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    leftHandle.position.set(-1.7, 2.5, 3.5);
    this.group.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    rightHandle.position.set(1.7, 2.5, 3.5);
    this.group.add(rightHandle);
  }

  createControls() {
    const controlMaterial = new THREE.MeshLambertMaterial({
      color: 0x7F8C8D,
      flatShading: true
    });

    // Throttle lever (right side)
    const throttleLeverGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    this.throttleLever = new THREE.Mesh(throttleLeverGeometry, controlMaterial);
    this.throttleLever.position.set(0.8, 2.2, 4);
    this.throttleLever.rotation.z = -0.3;
    this.group.add(this.throttleLever);

    // Throttle handle
    const throttleHandle = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xFF5252, flatShading: true })
    );
    throttleHandle.position.set(0.95, 1.95, 4);
    this.group.add(throttleHandle);

    // Brake lever (left side)
    const brakeLeverGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    this.brakeLever = new THREE.Mesh(brakeLeverGeometry, controlMaterial);
    this.brakeLever.position.set(-0.8, 2.2, 4);
    this.brakeLever.rotation.z = 0.3;
    this.group.add(this.brakeLever);

    // Brake handle
    const brakeHandle = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xFFEB3B, flatShading: true })
    );
    brakeHandle.position.set(-0.95, 1.95, 4);
    this.group.add(brakeHandle);

    // Steering wheel (decorative)
    const wheelGeometry = new THREE.TorusGeometry(0.25, 0.04, 8, 12);
    const wheel = new THREE.Mesh(wheelGeometry, controlMaterial);
    wheel.position.set(0, 2.8, 4.3);
    wheel.rotation.x = Math.PI / 6;
    this.group.add(wheel);
  }

  createGauges() {
    // Speedometer
    this.speedometer = this.createGauge(-0.6, 3.2, 4.6, 0x00BCD4);

    // Brake pressure gauge
    this.brakeGauge = this.createGauge(0.6, 3.2, 4.6, 0xFF9800);

    // Power gauge
    this.powerGauge = this.createGauge(0, 3.2, 4.6, 0x4CAF50);

    // Warning lights
    this.createWarningLights();
  }

  createGauge(x, y, z, color) {
    const group = new THREE.Group();

    // Gauge background
    const bgGeometry = new THREE.CircleGeometry(0.15, 12);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x1A1A1A
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.set(x, y, z);
    group.add(background);

    // Gauge ring
    const ringGeometry = new THREE.RingGeometry(0.14, 0.16, 12);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(x, y, z + 0.01);
    group.add(ring);

    // Gauge needle (will be animated)
    const needleGeometry = new THREE.BoxGeometry(0.02, 0.12, 0.01);
    const needleMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF0000
    });
    const needle = new THREE.Mesh(needleGeometry, needleMaterial);
    needle.position.set(x, y + 0.05, z + 0.02);
    group.add(needle);

    this.group.add(group);

    return { group, needle };
  }

  createWarningLights() {
    const lightPositions = [
      { x: -1.2, y: 3.0, color: 0xFF0000 }, // Red (emergency)
      { x: -0.9, y: 3.0, color: 0xFFEB3B }, // Yellow (warning)
      { x: 1.2, y: 3.0, color: 0x4CAF50 },  // Green (ok)
    ];

    lightPositions.forEach(pos => {
      const lightGeometry = new THREE.CircleGeometry(0.05, 8);
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.3
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(pos.x, pos.y, 4.6);
      this.group.add(light);
    });
  }

  createMirrors() {
    const mirrorMaterial = new THREE.MeshStandardMaterial({
      color: 0x88CCFF,
      metalness: 0.9,
      roughness: 0.1,
      flatShading: true
    });

    // Left mirror
    const leftMirrorGroup = new THREE.Group();

    const leftMirrorArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x1A1A1A, flatShading: true })
    );
    leftMirrorArm.position.set(-2.2, 3.3, 4.2);
    leftMirrorGroup.add(leftMirrorArm);

    const leftMirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.15, 0.02),
      mirrorMaterial
    );
    leftMirror.position.set(-2.35, 3.3, 4.2);
    leftMirrorGroup.add(leftMirror);

    this.group.add(leftMirrorGroup);

    // Right mirror
    const rightMirrorGroup = new THREE.Group();

    const rightMirrorArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.3),
      new THREE.MeshLambertMaterial({ color: 0x1A1A1A, flatShading: true })
    );
    rightMirrorArm.position.set(2.2, 3.3, 4.2);
    rightMirrorGroup.add(rightMirrorArm);

    const rightMirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.15, 0.02),
      mirrorMaterial
    );
    rightMirror.position.set(2.35, 3.3, 4.2);
    rightMirrorGroup.add(rightMirror);

    this.group.add(rightMirrorGroup);
  }

  createSeats() {
    const seatMaterial = new THREE.MeshLambertMaterial({
      color: 0x5D4037,
      flatShading: true
    });

    // Driver seat
    const seatBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.15, 0.6),
      seatMaterial
    );
    seatBase.position.set(0.3, 1.8, 3.2);
    this.group.add(seatBase);

    const seatBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.15),
      seatMaterial
    );
    seatBack.position.set(0.3, 2.2, 2.9);
    this.group.add(seatBack);

    // Co-driver seat (optional)
    const coPilotSeatBase = seatBase.clone();
    coPilotSeatBase.position.set(-0.8, 1.8, 3.2);
    this.group.add(coPilotSeatBase);

    const coPilotSeatBack = seatBack.clone();
    coPilotSeatBack.position.set(-0.8, 2.2, 2.9);
    this.group.add(coPilotSeatBack);
  }

  getMesh() {
    return this.group;
  }

  // Update animated elements
  update(speed, throttle, brake) {
    // Animate speedometer needle
    if (this.speedometer) {
      const speedAngle = (speed / 140) * Math.PI; // 0 to 180 degrees
      this.speedometer.needle.rotation.z = -speedAngle + Math.PI / 2;
    }

    // Animate power gauge needle
    if (this.powerGauge) {
      const powerAngle = throttle * Math.PI;
      this.powerGauge.needle.rotation.z = -powerAngle + Math.PI / 2;
    }

    // Animate brake gauge needle
    if (this.brakeGauge) {
      const brakeAngle = brake * Math.PI;
      this.brakeGauge.needle.rotation.z = -brakeAngle + Math.PI / 2;
    }

    // Animate throttle lever
    if (this.throttleLever) {
      this.throttleLever.rotation.z = -0.3 - (throttle * 0.6);
    }

    // Animate brake lever
    if (this.brakeLever) {
      this.brakeLever.rotation.z = 0.3 + (brake * 0.6);
    }
  }

  // Show/hide cabin interior based on camera mode
  setVisible(visible) {
    this.group.visible = visible;
  }
}

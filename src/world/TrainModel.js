/**
 * Low-poly train model generator
 * Creates a simplified diesel locomotive with passenger cars
 */

import * as THREE from 'three';

export class TrainModel {
  constructor() {
    this.group = new THREE.Group();
    this.buildLocomotive();
    this.buildPassengerCars(3);
  }

  buildLocomotive() {
    // Main locomotive body
    const bodyGeometry = new THREE.BoxGeometry(4, 3, 10);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0x2E4053,
      flatShading: true
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.5, 0);
    this.group.add(body);

    // Cabin (front section)
    const cabinGeometry = new THREE.BoxGeometry(3.5, 2, 3);
    const cabinMaterial = new THREE.MeshLambertMaterial({
      color: 0x34495E,
      flatShading: true
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 3.5, 3.5);
    this.group.add(cabin);

    // Windows (simple yellow rectangles)
    const windowGeometry = new THREE.BoxGeometry(3.6, 0.8, 1.5);
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFEB3B });

    // Front window
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(0, 3.5, 4.3);
    this.group.add(frontWindow);

    // Side windows
    for (let i = -3; i <= 3; i += 2) {
      const sideWindow = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.6, 1.2),
        windowMaterial
      );
      sideWindow.position.set(2, 2.5, i);
      this.group.add(sideWindow);

      const sideWindow2 = sideWindow.clone();
      sideWindow2.position.set(-2, 2.5, i);
      this.group.add(sideWindow2);
    }

    // Roof
    const roofGeometry = new THREE.BoxGeometry(4.2, 0.3, 10.5);
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0x566573,
      flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 3.15, 0);
    this.group.add(roof);

    // Wheels (simple cylinders)
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
    const wheelMaterial = new THREE.MeshLambertMaterial({
      color: 0x1C2833,
      flatShading: true
    });

    const wheelPositions = [
      { x: -2.2, z: -3 },
      { x: 2.2, z: -3 },
      { x: -2.2, z: 0 },
      { x: 2.2, z: 0 },
      { x: -2.2, z: 3 },
      { x: 2.2, z: 3 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.5, pos.z);
      this.group.add(wheel);
    });

    // Headlight (front)
    const headlightGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 2, 5.5);
    this.group.add(headlight);

    // Add spotlight for headlight
    this.headlight = new THREE.SpotLight(0xFFFFFF, 1.5, 100, Math.PI / 6, 0.5);
    this.headlight.position.set(0, 2, 5.5);
    this.headlight.target.position.set(0, 0, 15);
    this.group.add(this.headlight);
    this.group.add(this.headlight.target);
  }

  buildPassengerCars(count) {
    for (let i = 0; i < count; i++) {
      const car = this.createPassengerCar();
      car.position.z = -15 * (i + 1); // Space cars apart
      this.group.add(car);
    }
  }

  createPassengerCar() {
    const carGroup = new THREE.Group();

    // Main car body
    const bodyGeometry = new THREE.BoxGeometry(3.5, 2.5, 12);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0xC0392B,
      flatShading: true
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.5, 0);
    carGroup.add(body);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(3.7, 0.3, 12.5);
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0x922B21,
      flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 3, 0);
    carGroup.add(roof);

    // Windows
    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x85C1E9 });
    for (let z = -4; z <= 4; z += 2) {
      // Left side windows
      const windowLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.8, 1.2),
        windowMaterial
      );
      windowLeft.position.set(-1.8, 2, z);
      carGroup.add(windowLeft);

      // Right side windows
      const windowRight = windowLeft.clone();
      windowRight.position.set(1.8, 2, z);
      carGroup.add(windowRight);
    }

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    const wheelMaterial = new THREE.MeshLambertMaterial({
      color: 0x1C2833,
      flatShading: true
    });

    const wheelPositions = [
      { x: -2, z: -4 },
      { x: 2, z: -4 },
      { x: -2, z: 4 },
      { x: 2, z: 4 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.4, pos.z);
      carGroup.add(wheel);
    });

    // Connector between cars
    const connectorGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
    const connectorMaterial = new THREE.MeshLambertMaterial({
      color: 0x34495E,
      flatShading: true
    });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connector.position.set(0, 1, 7);
    carGroup.add(connector);

    return carGroup;
  }

  getMesh() {
    return this.group;
  }

  setHeadlightIntensity(intensity) {
    if (this.headlight) {
      this.headlight.intensity = intensity;
    }
  }

  update(deltaTime) {
    // Animate wheels based on speed if needed
    // This is a placeholder for future wheel rotation animation
  }
}

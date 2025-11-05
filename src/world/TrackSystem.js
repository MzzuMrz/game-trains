/**
 * Track system for generating railway tracks
 * Creates procedural tracks with curves and gradients
 */

import * as THREE from 'three';

export class TrackSystem {
  constructor(totalDistance = 1298) {
    this.totalDistance = totalDistance * 1000; // Convert km to meters
    this.trackWidth = 1.676; // Standard gauge in meters
    this.segments = [];
    this.trackMesh = null;

    this.generateTrack();
  }

  generateTrack() {
    // Create a simple track path
    // In a full implementation, this would use real GPS data
    const points = [];
    const segmentLength = 100; // meters per segment
    const numSegments = Math.floor(this.totalDistance / segmentLength);

    for (let i = 0; i <= numSegments; i++) {
      const z = i * segmentLength;

      // Add some gentle curves for realism
      const curveOffset = Math.sin(i * 0.02) * 20;
      const elevation = Math.sin(i * 0.01) * 2;

      points.push(new THREE.Vector3(curveOffset, elevation, z));
    }

    this.curve = new THREE.CatmullRomCurve3(points);
    this.createTrackMesh();
  }

  createTrackMesh() {
    const group = new THREE.Group();

    // Rails
    const railGeometry = new THREE.BoxGeometry(0.1, 0.15, this.totalDistance);
    const railMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A4A4A,
      flatShading: true
    });

    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-this.trackWidth / 2, 0.1, this.totalDistance / 2);
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(this.trackWidth / 2, 0.1, this.totalDistance / 2);
    group.add(rightRail);

    // Ties (sleepers) - create them at intervals
    const tieGeometry = new THREE.BoxGeometry(2.5, 0.2, 0.15);
    const tieMaterial = new THREE.MeshLambertMaterial({
      color: 0x3E2723,
      flatShading: true
    });

    const tieSpacing = 60; // cm
    const numTies = Math.floor(this.totalDistance / (tieSpacing / 100));

    for (let i = 0; i < numTies; i += 10) { // Only render every 10th tie for performance
      const tie = new THREE.Mesh(tieGeometry, tieMaterial);
      tie.position.set(0, 0, i * (tieSpacing / 100));
      group.add(tie);
    }

    // Ballast (gravel bed)
    const ballastGeometry = new THREE.BoxGeometry(4, 0.3, this.totalDistance);
    const ballastMaterial = new THREE.MeshLambertMaterial({
      color: 0x757575,
      flatShading: true
    });
    const ballast = new THREE.Mesh(ballastGeometry, ballastMaterial);
    ballast.position.set(0, -0.15, this.totalDistance / 2);
    group.add(ballast);

    this.trackMesh = group;
  }

  getMesh() {
    return this.trackMesh;
  }

  getPositionAtDistance(distance) {
    // Get position along track at given distance (in meters)
    const t = distance / this.totalDistance;
    return this.curve.getPoint(Math.min(t, 1));
  }

  getTangentAtDistance(distance) {
    // Get direction (tangent) at given distance
    const t = distance / this.totalDistance;
    return this.curve.getTangent(Math.min(t, 1));
  }

  getSpeedLimitAtDistance(distance) {
    // Simple speed limit system
    // In full version, this would be based on real track data
    const km = distance / 1000;

    // Lower speed limits in urban areas (near start and end)
    if (km < 50 || km > 1248) {
      return 80; // km/h
    }

    // Higher speeds in open countryside
    return 120; // km/h
  }

  getGradientAtDistance(distance) {
    // Calculate gradient (slope) at given distance
    const epsilon = 1;
    const pos1 = this.getPositionAtDistance(distance);
    const pos2 = this.getPositionAtDistance(distance + epsilon);

    return (pos2.y - pos1.y) / epsilon;
  }
}

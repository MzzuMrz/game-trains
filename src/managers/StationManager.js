/**
 * Manages station detection, stops, and passenger boarding
 */

import * as THREE from 'three';
import { stations } from '../data/stations.js';
import { formatDistance } from '../utils/helpers.js';

export class StationManager {
  constructor(scene) {
    this.scene = scene;
    this.stations = stations;
    this.stationMeshes = [];
    this.currentStationIndex = 0;
    this.nextStation = this.stations[0];
    this.atStation = false;
    this.stopTimer = 0;
    this.proximityRange = 100; // meters

    this.createStationModels();
  }

  createStationModels() {
    this.stations.forEach((station, index) => {
      const stationGroup = this.createStationModel(station);
      stationGroup.position.z = station.km * 1000; // Convert km to meters
      this.scene.add(stationGroup);
      this.stationMeshes.push(stationGroup);
    });
  }

  createStationModel(stationData) {
    const group = new THREE.Group();

    // Platform
    const platformGeometry = new THREE.BoxGeometry(10, 0.5, 40);
    const platformMaterial = new THREE.MeshLambertMaterial({
      color: 0xBCBCBC,
      flatShading: true
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(5, 0.25, 0);
    group.add(platform);

    // Station building (simple box)
    const buildingSize = this.getBuildingSize(stationData);
    const buildingGeometry = new THREE.BoxGeometry(
      buildingSize.width,
      buildingSize.height,
      buildingSize.depth
    );
    const buildingMaterial = new THREE.MeshLambertMaterial({
      color: this.getBuildingColor(stationData.zone),
      flatShading: true
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(
      12,
      buildingSize.height / 2,
      0
    );
    group.add(building);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(
      buildingSize.width * 0.7,
      buildingSize.height * 0.3,
      4
    );
    const roofMaterial = new THREE.MeshLambertMaterial({
      color: 0x8B4513,
      flatShading: true
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(
      12,
      buildingSize.height + buildingSize.height * 0.15,
      0
    );
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Station sign
    const signGeometry = new THREE.BoxGeometry(8, 1.5, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({
      color: 0x0D47A1,
      flatShading: true
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(5, 3, -20);
    group.add(sign);

    // Add some lamp posts
    for (let i = -15; i <= 15; i += 10) {
      const lampPost = this.createLampPost();
      lampPost.position.set(8, 0, i);
      group.add(lampPost);
    }

    return group;
  }

  createLampPost() {
    const group = new THREE.Group();

    // Post
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
    const postMaterial = new THREE.MeshLambertMaterial({
      color: 0x424242,
      flatShading: true
    });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 2;
    group.add(post);

    // Lamp
    const lampGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const lampMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFF59D
    });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.y = 4;
    group.add(lamp);

    // Light
    const light = new THREE.PointLight(0xFFF59D, 0.5, 20);
    light.position.y = 4;
    group.add(light);

    return group;
  }

  getBuildingSize(stationData) {
    // Larger buildings for major stations
    const sizes = {
      'San Miguel de Tucumán': { width: 15, height: 8, depth: 25 },
      'Santiago del Estero': { width: 12, height: 7, depth: 20 },
      'Rosario Norte': { width: 14, height: 8, depth: 30 },
      'Retiro': { width: 20, height: 10, depth: 40 }
    };

    return sizes[stationData.name] || { width: 8, height: 5, depth: 15 };
  }

  getBuildingColor(zone) {
    const colors = {
      subtropical: 0xD4A574,
      'semi-arid': 0xC9A96E,
      pampas: 0xE8D4A8,
      urban: 0xB0BEC5
    };
    return colors[zone] || 0xCCCCCC;
  }

  update(deltaTime, trainPositionKm, trainSpeed) {
    // Find next station
    this.nextStation = this.stations.find(s => s.km > trainPositionKm) || this.stations[this.stations.length - 1];

    // Check if at station
    const distanceToStation = Math.abs(this.nextStation.km - trainPositionKm);
    this.atStation = distanceToStation < 0.05; // Within 50 meters

    // Handle station stop
    if (this.atStation && trainSpeed < 1) {
      this.stopTimer += deltaTime;
    } else {
      this.stopTimer = 0;
    }

    return {
      nextStation: this.nextStation,
      distanceToStation: distanceToStation,
      atStation: this.atStation,
      stopProgress: Math.min(this.stopTimer / this.nextStation.stopDuration, 1)
    };
  }

  getNextStationInfo() {
    return this.nextStation;
  }

  getDistanceToNextStation(trainPositionKm) {
    return this.nextStation.km - trainPositionKm;
  }

  isNearStation(trainPositionKm) {
    const distance = this.getDistanceToNextStation(trainPositionKm);
    return distance < (this.proximityRange / 1000); // Convert to km
  }
}

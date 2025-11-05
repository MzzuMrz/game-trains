/**
 * Chunked world system for performance optimization
 * Generates and manages terrain, vegetation, and environment
 */

import * as THREE from 'three';
import { getZoneColor, random } from '../utils/helpers.js';

export class ChunkedWorld {
  constructor(scene, trackSystem) {
    this.scene = scene;
    this.trackSystem = trackSystem;
    this.chunkSize = 2000; // meters
    this.activeChunks = new Map();
    this.renderDistance = 5; // chunks
    this.lastChunkUpdate = -1;
  }

  update(trainPosition) {
    const currentChunk = Math.floor(trainPosition / this.chunkSize);

    if (currentChunk !== this.lastChunkUpdate) {
      this.updateChunks(currentChunk);
      this.lastChunkUpdate = currentChunk;
    }
  }

  updateChunks(currentChunk) {
    // Determine which chunks should be active
    const chunksToKeep = new Set();

    for (let i = -this.renderDistance; i <= this.renderDistance; i++) {
      const chunkIndex = currentChunk + i;
      if (chunkIndex >= 0) {
        chunksToKeep.add(chunkIndex);

        // Load chunk if not already loaded
        if (!this.activeChunks.has(chunkIndex)) {
          this.loadChunk(chunkIndex);
        }
      }
    }

    // Unload chunks that are too far
    for (const [chunkIndex, chunk] of this.activeChunks) {
      if (!chunksToKeep.has(chunkIndex)) {
        this.unloadChunk(chunkIndex);
      }
    }
  }

  loadChunk(chunkIndex) {
    const chunkGroup = new THREE.Group();
    const startZ = chunkIndex * this.chunkSize;

    // Determine zone based on distance
    const zone = this.getZoneForPosition(startZ / 1000);

    // Create terrain
    const terrain = this.createTerrain(zone, startZ);
    chunkGroup.add(terrain);

    // Add vegetation
    const vegetation = this.createVegetation(zone, startZ);
    chunkGroup.add(vegetation);

    // Add environmental objects
    const objects = this.createEnvironmentalObjects(zone, startZ);
    chunkGroup.add(objects);

    this.scene.add(chunkGroup);
    this.activeChunks.set(chunkIndex, chunkGroup);
  }

  unloadChunk(chunkIndex) {
    const chunk = this.activeChunks.get(chunkIndex);
    if (chunk) {
      this.scene.remove(chunk);
      this.activeChunks.delete(chunkIndex);

      // Dispose of geometries and materials
      chunk.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
  }

  createTerrain(zone, startZ) {
    const group = new THREE.Group();

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(
      200,
      this.chunkSize,
      10,
      20
    );

    // Add some height variation
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = random(0, 2);
      positions.setY(i, height);
    }
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshLambertMaterial({
      color: getZoneColor(zone),
      flatShading: true
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.5, startZ + this.chunkSize / 2);
    group.add(ground);

    return group;
  }

  createVegetation(zone, startZ) {
    const group = new THREE.Group();
    const density = this.getVegetationDensity(zone);

    for (let i = 0; i < density; i++) {
      const tree = this.createTree(zone);
      tree.position.set(
        random(-80, -20) * (Math.random() > 0.5 ? 1 : -1),
        0,
        startZ + random(0, this.chunkSize)
      );
      group.add(tree);
    }

    return group;
  }

  createTree(zone) {
    const group = new THREE.Group();

    // Trunk
    const trunkHeight = random(3, 6);
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A3C2A,
      flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    group.add(trunk);

    // Foliage
    const foliageGeometry = new THREE.ConeGeometry(2, 4, 6);
    const foliageColor = this.getFoliageColor(zone);
    const foliageMaterial = new THREE.MeshLambertMaterial({
      color: foliageColor,
      flatShading: true
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + 2;
    group.add(foliage);

    return group;
  }

  createEnvironmentalObjects(zone, startZ) {
    const group = new THREE.Group();

    // Add zone-specific objects
    if (zone === 'subtropical') {
      // Add sugar cane fields
      for (let i = 0; i < 3; i++) {
        const field = this.createField();
        field.position.set(
          random(30, 60) * (Math.random() > 0.5 ? 1 : -1),
          0,
          startZ + random(0, this.chunkSize)
        );
        group.add(field);
      }
    } else if (zone === 'pampas') {
      // Add windmills
      if (Math.random() > 0.7) {
        const windmill = this.createWindmill();
        windmill.position.set(
          random(40, 80) * (Math.random() > 0.5 ? 1 : -1),
          0,
          startZ + random(0, this.chunkSize)
        );
        group.add(windmill);
      }
    } else if (zone === 'urban') {
      // Add buildings
      for (let i = 0; i < 5; i++) {
        const building = this.createBuilding();
        building.position.set(
          random(20, 60) * (Math.random() > 0.5 ? 1 : -1),
          0,
          startZ + random(0, this.chunkSize)
        );
        group.add(building);
      }
    }

    return group;
  }

  createField() {
    const geometry = new THREE.BoxGeometry(15, 1, 20);
    const material = new THREE.MeshLambertMaterial({
      color: 0x9ACD32,
      flatShading: true
    });
    const field = new THREE.Mesh(geometry, material);
    field.position.y = 0.5;
    return field;
  }

  createWindmill() {
    const group = new THREE.Group();

    // Tower
    const towerGeometry = new THREE.CylinderGeometry(0.5, 1, 15, 6);
    const towerMaterial = new THREE.MeshLambertMaterial({
      color: 0xEEEEEE,
      flatShading: true
    });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 7.5;
    group.add(tower);

    return group;
  }

  createBuilding() {
    const width = random(5, 15);
    const height = random(8, 25);
    const depth = random(5, 15);

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({
      color: 0x9E9E9E,
      flatShading: true
    });
    const building = new THREE.Mesh(geometry, material);
    building.position.y = height / 2;
    return building;
  }

  getZoneForPosition(km) {
    if (km < 155) return 'subtropical';
    if (km < 738) return 'semi-arid';
    if (km < 1171) return 'pampas';
    return 'urban';
  }

  getVegetationDensity(zone) {
    const densities = {
      subtropical: 30,
      'semi-arid': 15,
      pampas: 20,
      urban: 5
    };
    return densities[zone] || 20;
  }

  getFoliageColor(zone) {
    const colors = {
      subtropical: 0x228B22,
      'semi-arid': 0x6B8E23,
      pampas: 0x32CD32,
      urban: 0x3CB371
    };
    return colors[zone] || 0x228B22;
  }
}

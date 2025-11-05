/**
 * Enhanced Chunked World System
 * Rich, varied landscapes representing authentic Argentine regions
 */

import * as THREE from 'three';
import { getZoneColor, random, randomInt } from '../utils/helpers.js';

export class ChunkedWorld {
  constructor(scene, trackSystem) {
    this.scene = scene;
    this.trackSystem = trackSystem;
    this.chunkSize = 2000; // meters
    this.activeChunks = new Map();
    this.renderDistance = 5; // chunks
    this.lastChunkUpdate = -1;

    // Persistent objects across chunks
    this.createSky();
    this.createDistantMountains();
    this.createSun();
  }

  createSky() {
    // Sky dome with gradient
    const skyGeometry = new THREE.SphereGeometry(8000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077be) },
        bottomColor: { value: new THREE.Color(0x89cff0) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });

    this.skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skyDome);

    // Add clouds
    this.createClouds();
  }

  createClouds() {
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < 30; i++) {
      const cloud = this.createCloud();
      cloud.position.set(
        random(-4000, 4000),
        random(500, 1200),
        random(-4000, 4000)
      );
      cloudGroup.add(cloud);
    }

    this.scene.add(cloudGroup);
  }

  createCloud() {
    const group = new THREE.Group();
    const cloudMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      flatShading: true,
      transparent: true,
      opacity: 0.7
    });

    // Multiple spheres to form cloud
    for (let i = 0; i < 5; i++) {
      const size = random(40, 80);
      const geometry = new THREE.SphereGeometry(size, 6, 6);
      const cloudPart = new THREE.Mesh(geometry, cloudMaterial);
      cloudPart.position.set(
        random(-50, 50),
        random(-20, 20),
        random(-50, 50)
      );
      group.add(cloudPart);
    }

    return group;
  }

  createDistantMountains() {
    // Mountains visible in Tucumán region
    const mountainGroup = new THREE.Group();

    // Create mountain range on both sides
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 15; i++) {
        const mountain = this.createMountain();
        mountain.position.set(
          side * random(800, 2000),
          random(-50, 0),
          i * 200 - 1000
        );
        mountainGroup.add(mountain);
      }
    }

    this.scene.add(mountainGroup);
    this.mountainGroup = mountainGroup;
  }

  createMountain() {
    const height = random(400, 800);
    const width = random(300, 600);

    const geometry = new THREE.ConeGeometry(width, height, 5);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, random(0.3, 0.5)),
      flatShading: true,
      fog: true
    });

    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.y = height / 2;

    return mountain;
  }

  createSun() {
    // Visible sun sphere
    const sunGeometry = new THREE.SphereGeometry(100, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xFDB813,
      fog: false
    });

    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(1000, 800, 2000);
    this.scene.add(this.sun);
  }

  update(trainPosition) {
    const currentChunk = Math.floor(trainPosition / this.chunkSize);

    if (currentChunk !== this.lastChunkUpdate) {
      this.updateChunks(currentChunk);
      this.lastChunkUpdate = currentChunk;
    }

    // Update mountains visibility based on position
    if (this.mountainGroup) {
      const km = trainPosition / 1000;
      this.mountainGroup.visible = km < 300; // Only visible in northern regions
    }
  }

  updateChunks(currentChunk) {
    const chunksToKeep = new Set();

    for (let i = -this.renderDistance; i <= this.renderDistance; i++) {
      const chunkIndex = currentChunk + i;
      if (chunkIndex >= 0) {
        chunksToKeep.add(chunkIndex);

        if (!this.activeChunks.has(chunkIndex)) {
          this.loadChunk(chunkIndex);
        }
      }
    }

    for (const [chunkIndex, chunk] of this.activeChunks) {
      if (!chunksToKeep.has(chunkIndex)) {
        this.unloadChunk(chunkIndex);
      }
    }
  }

  loadChunk(chunkIndex) {
    const chunkGroup = new THREE.Group();
    const startZ = chunkIndex * this.chunkSize;
    const zone = this.getZoneForPosition(startZ / 1000);

    // Create terrain with elevation
    const terrain = this.createTerrain(zone, startZ, chunkIndex);
    chunkGroup.add(terrain);

    // Add vegetation (trees, bushes)
    const vegetation = this.createVegetation(zone, startZ);
    chunkGroup.add(vegetation);

    // Add zone-specific features
    const features = this.createZoneFeatures(zone, startZ);
    chunkGroup.add(features);

    // Add infrastructure (power lines, fences, roads)
    const infrastructure = this.createInfrastructure(zone, startZ);
    chunkGroup.add(infrastructure);

    this.scene.add(chunkGroup);
    this.activeChunks.set(chunkIndex, chunkGroup);
  }

  unloadChunk(chunkIndex) {
    const chunk = this.activeChunks.get(chunkIndex);
    if (chunk) {
      this.scene.remove(chunk);
      this.activeChunks.delete(chunkIndex);

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

  createTerrain(zone, startZ, chunkIndex) {
    const group = new THREE.Group();

    // Main ground with elevation
    const segments = 30;
    const groundGeometry = new THREE.PlaneGeometry(
      400,
      this.chunkSize,
      segments,
      segments * 2
    );

    // Add elevation variation based on zone
    const positions = groundGeometry.attributes.position;
    const elevationScale = this.getElevationScale(zone);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i); // Y is Z in plane geometry

      // Create rolling hills
      const elevation =
        Math.sin(x * 0.01 + chunkIndex) * elevationScale * 0.5 +
        Math.cos(z * 0.008) * elevationScale * 0.3 +
        Math.sin((x + z) * 0.005) * elevationScale * 0.2;

      positions.setZ(i, elevation);
    }

    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshLambertMaterial({
      color: this.getGroundColor(zone),
      flatShading: true
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.5, startZ + this.chunkSize / 2);
    group.add(ground);

    // Add distant hills on sides
    this.addDistantHills(group, zone, startZ);

    return group;
  }

  getElevationScale(zone) {
    const scales = {
      subtropical: 15,  // Hilly
      'semi-arid': 8,   // Moderate
      pampas: 3,        // Flat
      urban: 2          // Very flat
    };
    return scales[zone] || 5;
  }

  getGroundColor(zone) {
    const colors = {
      subtropical: 0x6B8E23,  // Olive green
      'semi-arid': 0xC2B280,  // Sand/tan
      pampas: 0x7CB342,       // Grass green
      urban: 0x808080         // Gray
    };
    return colors[zone] || 0x90EE90;
  }

  addDistantHills(group, zone, startZ) {
    if (zone === 'urban') return; // No hills in urban areas

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const hillHeight = random(30, 80);
        const hillWidth = random(150, 300);

        const geometry = new THREE.ConeGeometry(hillWidth, hillHeight, 6);
        const material = new THREE.MeshLambertMaterial({
          color: new THREE.Color().setHSL(0.25, 0.4, random(0.35, 0.45)),
          flatShading: true
        });

        const hill = new THREE.Mesh(geometry, material);
        hill.position.set(
          side * random(250, 350),
          hillHeight / 2 - 0.5,
          startZ + random(200, this.chunkSize - 200)
        );
        hill.rotation.y = random(0, Math.PI * 2);

        group.add(hill);
      }
    }
  }

  createVegetation(zone, startZ) {
    const group = new THREE.Group();
    const density = this.getVegetationDensity(zone);

    for (let i = 0; i < density; i++) {
      const treeType = this.selectTreeType(zone);
      const tree = this.createTree(treeType, zone);

      const x = random(-150, -30) * (Math.random() > 0.5 ? 1 : -1);
      const z = startZ + random(0, this.chunkSize);

      tree.position.set(x, 0, z);
      tree.rotation.y = random(0, Math.PI * 2);

      group.add(tree);
    }

    // Add bushes/shrubs
    const bushCount = Math.floor(density * 0.5);
    for (let i = 0; i < bushCount; i++) {
      const bush = this.createBush(zone);
      bush.position.set(
        random(-180, -20) * (Math.random() > 0.5 ? 1 : -1),
        0,
        startZ + random(0, this.chunkSize)
      );
      group.add(bush);
    }

    return group;
  }

  selectTreeType(zone) {
    const types = {
      subtropical: ['pine', 'broadleaf'],
      'semi-arid': ['quebracho', 'sparse'],
      pampas: ['eucalyptus', 'poplar'],
      urban: ['street', 'park']
    };

    const zoneTypes = types[zone] || ['generic'];
    return zoneTypes[randomInt(0, zoneTypes.length - 1)];
  }

  createTree(type, zone) {
    const group = new THREE.Group();

    const trunkHeight = random(4, 8);
    const trunkRadius = random(0.3, 0.5);

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius * 0.8,
      trunkRadius,
      trunkHeight,
      6
    );
    const trunkMaterial = new THREE.MeshLambertMaterial({
      color: 0x4A3C2A,
      flatShading: true
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    group.add(trunk);

    // Foliage based on type
    const foliageColor = this.getFoliageColor(zone, type);
    const foliage = this.createFoliage(type, foliageColor);
    foliage.position.y = trunkHeight;
    group.add(foliage);

    return group;
  }

  createFoliage(type, color) {
    let geometry;

    switch (type) {
      case 'pine':
        geometry = new THREE.ConeGeometry(2, 5, 6);
        break;
      case 'quebracho':
        geometry = new THREE.DodecahedronGeometry(2, 0);
        break;
      case 'eucalyptus':
      case 'poplar':
        geometry = new THREE.CylinderGeometry(1.5, 2, 6, 6);
        break;
      default:
        geometry = new THREE.SphereGeometry(2.5, 6, 6);
    }

    const material = new THREE.MeshLambertMaterial({
      color: color,
      flatShading: true
    });

    return new THREE.Mesh(geometry, material);
  }

  getFoliageColor(zone, type) {
    const baseColors = {
      subtropical: 0x228B22,
      'semi-arid': 0x6B7C3C,
      pampas: 0x32CD32,
      urban: 0x3CB371
    };

    let baseColor = baseColors[zone] || 0x228B22;

    // Add variation
    const color = new THREE.Color(baseColor);
    color.offsetHSL(random(-0.05, 0.05), random(-0.1, 0.1), random(-0.1, 0.1));

    return color.getHex();
  }

  createBush(zone) {
    const geometry = new THREE.SphereGeometry(random(0.8, 1.5), 6, 5);
    const material = new THREE.MeshLambertMaterial({
      color: this.getFoliageColor(zone, 'bush'),
      flatShading: true
    });

    const bush = new THREE.Mesh(geometry, material);
    bush.position.y = 0.5;
    bush.scale.y = 0.7; // Flatten slightly

    return bush;
  }

  getVegetationDensity(zone) {
    const densities = {
      subtropical: 40,
      'semi-arid': 20,
      pampas: 30,
      urban: 8
    };
    return densities[zone] || 25;
  }

  createZoneFeatures(zone, startZ) {
    const group = new THREE.Group();

    switch (zone) {
      case 'subtropical':
        this.addSugarCaneFields(group, startZ);
        break;
      case 'semi-arid':
        this.addDryRiverbeds(group, startZ);
        this.addRocks(group, startZ);
        break;
      case 'pampas':
        this.addAgriculturalFields(group, startZ);
        this.addWindmills(group, startZ);
        this.addSilos(group, startZ);
        break;
      case 'urban':
        this.addBuildings(group, startZ);
        this.addStreetLights(group, startZ);
        break;
    }

    return group;
  }

  addSugarCaneFields(group, startZ) {
    for (let i = 0; i < 3; i++) {
      const field = new THREE.Mesh(
        new THREE.BoxGeometry(40, 3, 60),
        new THREE.MeshLambertMaterial({
          color: 0x9ACD32,
          flatShading: true
        })
      );

      field.position.set(
        random(40, 100) * (Math.random() > 0.5 ? 1 : -1),
        1.5,
        startZ + random(100, this.chunkSize - 100)
      );

      group.add(field);
    }
  }

  addDryRiverbeds(group, startZ) {
    const riverbedGeometry = new THREE.PlaneGeometry(15, this.chunkSize / 2);
    const riverbedMaterial = new THREE.MeshLambertMaterial({
      color: 0xA0826D,
      flatShading: true
    });

    const riverbed = new THREE.Mesh(riverbedGeometry, riverbedMaterial);
    riverbed.rotation.x = -Math.PI / 2;
    riverbed.position.set(
      random(60, 120) * (Math.random() > 0.5 ? 1 : -1),
      -0.3,
      startZ + this.chunkSize / 2
    );

    group.add(riverbed);
  }

  addRocks(group, startZ) {
    for (let i = 0; i < 15; i++) {
      const size = random(1, 3);
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0),
        new THREE.MeshLambertMaterial({
          color: 0x808080,
          flatShading: true
        })
      );

      rock.position.set(
        random(-140, 140),
        size / 2,
        startZ + random(0, this.chunkSize)
      );

      group.add(rock);
    }
  }

  addAgriculturalFields(group, startZ) {
    const fieldTypes = [
      { color: 0xF4E04D, name: 'wheat' },      // Yellow - wheat
      { color: 0x9ACD32, name: 'soy' },        // Green - soy
      { color: 0xDEB887, name: 'corn' }        // Brown - harvested
    ];

    for (let i = 0; i < 4; i++) {
      const fieldType = fieldTypes[randomInt(0, fieldTypes.length - 1)];

      const field = new THREE.Mesh(
        new THREE.BoxGeometry(
          random(50, 100),
          0.5,
          random(80, 150)
        ),
        new THREE.MeshLambertMaterial({
          color: fieldType.color,
          flatShading: true
        })
      );

      field.position.set(
        random(50, 150) * (Math.random() > 0.5 ? 1 : -1),
        0.25,
        startZ + random(200, this.chunkSize - 200)
      );

      group.add(field);
    }
  }

  addWindmills(group, startZ) {
    if (Math.random() > 0.6) {
      const windmill = this.createWindmill();
      windmill.position.set(
        random(80, 150) * (Math.random() > 0.5 ? 1 : -1),
        0,
        startZ + random(300, this.chunkSize - 300)
      );
      group.add(windmill);
    }
  }

  createWindmill() {
    const group = new THREE.Group();

    // Tower
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.5, 20, 8),
      new THREE.MeshLambertMaterial({
        color: 0xEEEEEE,
        flatShading: true
      })
    );
    tower.position.y = 10;
    group.add(tower);

    // Top housing
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshLambertMaterial({
        color: 0xCCCCCC,
        flatShading: true
      })
    );
    housing.position.y = 20;
    group.add(housing);

    return group;
  }

  addSilos(group, startZ) {
    if (Math.random() > 0.7) {
      const silo = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 25, 8),
        new THREE.MeshLambertMaterial({
          color: 0xC0C0C0,
          flatShading: true
        })
      );

      silo.position.set(
        random(70, 130) * (Math.random() > 0.5 ? 1 : -1),
        12.5,
        startZ + random(400, this.chunkSize - 400)
      );

      group.add(silo);
    }
  }

  addBuildings(group, startZ) {
    const buildingCount = randomInt(8, 15);

    for (let i = 0; i < buildingCount; i++) {
      const building = this.createUrbanBuilding();
      building.position.set(
        random(30, 120) * (Math.random() > 0.5 ? 1 : -1),
        0,
        startZ + random(100, this.chunkSize - 100)
      );
      group.add(building);
    }
  }

  createUrbanBuilding() {
    const width = random(8, 20);
    const height = random(15, 45);
    const depth = random(8, 20);

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color().setHSL(0, 0, random(0.5, 0.7)),
      flatShading: true
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.y = height / 2;

    // Add windows
    const windowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFEB3B,
      transparent: true,
      opacity: 0.6
    });

    const windowsPerFloor = Math.floor(width / 3);
    const floors = Math.floor(height / 3);

    for (let floor = 0; floor < floors; floor++) {
      for (let win = 0; win < windowsPerFloor; win++) {
        const window = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 1.2),
          windowMaterial
        );
        window.position.set(
          -width / 2 + (win + 1) * (width / (windowsPerFloor + 1)),
          -height / 2 + (floor + 0.5) * (height / floors),
          depth / 2 + 0.01
        );
        building.add(window);
      }
    }

    return building;
  }

  addStreetLights(group, startZ) {
    const lightCount = Math.floor(this.chunkSize / 80);

    for (let i = 0; i < lightCount; i++) {
      const light = this.createStreetLight();
      light.position.set(
        random(25, 35) * (Math.random() > 0.5 ? 1 : -1),
        0,
        startZ + i * 80
      );
      group.add(light);
    }
  }

  createStreetLight() {
    const group = new THREE.Group();

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 6, 6),
      new THREE.MeshLambertMaterial({
        color: 0x4A4A4A,
        flatShading: true
      })
    );
    pole.position.y = 3;
    group.add(pole);

    // Light
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.4),
      new THREE.MeshBasicMaterial({
        color: 0xFFFFCC
      })
    );
    light.position.y = 6;
    group.add(light);

    return group;
  }

  createInfrastructure(zone, startZ) {
    const group = new THREE.Group();

    // Telegraph/power poles along track
    this.addTelegraphPoles(group, startZ);

    // Fences near track
    if (zone !== 'urban') {
      this.addFences(group, startZ);
    }

    // Roads parallel to track
    if (Math.random() > 0.5) {
      this.addRoad(group, startZ);
    }

    return group;
  }

  addTelegraphPoles(group, startZ) {
    const poleCount = Math.floor(this.chunkSize / 50);

    for (let i = 0; i < poleCount; i++) {
      const pole = this.createTelegraphPole();
      pole.position.set(
        12, // Right next to track
        0,
        startZ + i * 50
      );
      group.add(pole);
    }
  }

  createTelegraphPole() {
    const group = new THREE.Group();

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 8, 6),
      new THREE.MeshLambertMaterial({
        color: 0x4A3C2A,
        flatShading: true
      })
    );
    pole.position.y = 4;
    group.add(pole);

    // Cross beam
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.15, 0.15),
      new THREE.MeshLambertMaterial({
        color: 0x4A3C2A,
        flatShading: true
      })
    );
    beam.position.y = 8;
    group.add(beam);

    return group;
  }

  addFences(group, startZ) {
    // Fence on one side of track
    const fenceCount = Math.floor(this.chunkSize / 3);
    const side = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < fenceCount; i++) {
      const fencePost = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.5, 0.1),
        new THREE.MeshLambertMaterial({
          color: 0x8B7355,
          flatShading: true
        })
      );

      fencePost.position.set(
        side * 8,
        0.75,
        startZ + i * 3
      );

      group.add(fencePost);
    }
  }

  addRoad(group, startZ) {
    const roadGeometry = new THREE.PlaneGeometry(6, this.chunkSize);
    const roadMaterial = new THREE.MeshLambertMaterial({
      color: 0x3E3E3E,
      flatShading: true
    });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(
      random(30, 50) * (Math.random() > 0.5 ? 1 : -1),
      0,
      startZ + this.chunkSize / 2
    );

    group.add(road);

    // Add road markings
    const markingGeometry = new THREE.PlaneGeometry(0.3, 5);
    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF
    });

    const markingCount = Math.floor(this.chunkSize / 15);
    for (let i = 0; i < markingCount; i++) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(
        road.position.x,
        0.02,
        startZ + i * 15
      );
      group.add(marking);
    }
  }

  getZoneForPosition(km) {
    if (km < 155) return 'subtropical';
    if (km < 738) return 'semi-arid';
    if (km < 1171) return 'pampas';
    return 'urban';
  }

  updateDayNightCycle(hour) {
    // Update sky colors based on time
    if (this.skyDome && this.skyDome.material.uniforms) {
      let topColor, bottomColor;

      if (hour < 6 || hour > 20) {
        // Night
        topColor = new THREE.Color(0x000033);
        bottomColor = new THREE.Color(0x000055);
      } else if (hour < 8 || hour > 18) {
        // Dawn/Dusk
        topColor = new THREE.Color(0x4A5899);
        bottomColor = new THREE.Color(0xFF6B35);
      } else {
        // Day
        topColor = new THREE.Color(0x0077be);
        bottomColor = new THREE.Color(0x89cff0);
      }

      this.skyDome.material.uniforms.topColor.value.lerp(topColor, 0.01);
      this.skyDome.material.uniforms.bottomColor.value.lerp(bottomColor, 0.01);
    }

    // Update sun position
    if (this.sun) {
      const sunAngle = ((hour - 6) / 12) * Math.PI;
      this.sun.position.x = Math.cos(sunAngle) * 3000;
      this.sun.position.y = Math.sin(sunAngle) * 3000;
    }
  }
}

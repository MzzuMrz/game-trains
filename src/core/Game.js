/**
 * Main game class - Tucumán to Retiro Train Simulator
 * Coordinates all game systems and manages the game loop
 */

import * as THREE from 'three';
import { TrainModel } from '../world/TrainModel.js';
import { TrackSystem } from '../world/TrackSystem.js';
import { TrainPhysics } from '../physics/TrainPhysics.js';
import { CameraController } from './CameraController.js';
import { StationManager } from '../managers/StationManager.js';
import { ChunkedWorld } from '../world/ChunkedWorld.js';
import { UIController } from '../managers/UIController.js';
import { CabinInterior } from '../world/CabinInterior.js';

export class Game {
  constructor() {
    this.container = document.getElementById('canvas-container');

    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Game systems
    this.trainModel = null;
    this.cabinInterior = null;
    this.trackSystem = null;
    this.trainPhysics = null;
    this.cameraController = null;
    this.stationManager = null;
    this.world = null;
    this.ui = null;

    // Game state
    this.gameTime = 6 * 3600; // Start at 6:00 AM
    this.timeScale = 1;
    this.isPaused = false;
    this.clock = new THREE.Clock();

    // Input state
    this.keys = {};

    this.initialize();
  }

  async initialize() {
    this.ui = new UIController();
    this.ui.updateLoadingProgress(10, 'Inicializando Three.js...');

    await this.initializeScene();
    this.ui.updateLoadingProgress(30, 'Creando tren...');

    await this.initializeTrain();
    this.ui.updateLoadingProgress(50, 'Generando vías...');

    await this.initializeTrack();
    this.ui.updateLoadingProgress(70, 'Cargando estaciones...');

    await this.initializeStations();
    this.ui.updateLoadingProgress(85, 'Generando mundo...');

    await this.initializeWorld();
    this.ui.updateLoadingProgress(95, 'Configurando controles...');

    this.setupControls();
    this.setupLighting();

    this.ui.updateLoadingProgress(100, '¡Listo!');

    setTimeout(() => {
      this.ui.hideLoadingScreen();
      this.ui.showHUD();
      this.start();
    }, 500);
  }

  async initializeScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 5, -10);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  async initializeTrain() {
    this.trainModel = new TrainModel();
    this.scene.add(this.trainModel.getMesh());

    // Add cabin interior
    this.cabinInterior = new CabinInterior();
    this.trainModel.getMesh().add(this.cabinInterior.getMesh());

    this.trainPhysics = new TrainPhysics({
      mass: 300000,
      maxPower: 1600,
      maxSpeed: 120
    });
  }

  async initializeTrack() {
    this.trackSystem = new TrackSystem(1298);
    this.scene.add(this.trackSystem.getMesh());
  }

  async initializeStations() {
    this.stationManager = new StationManager(this.scene);
  }

  async initializeWorld() {
    this.world = new ChunkedWorld(this.scene, this.trackSystem);
    this.world.update(0); // Load initial chunks
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    this.scene.add(sunLight);

    this.sunLight = sunLight;
  }

  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Camera mode switch
      if (e.key.toLowerCase() === 'c') {
        const modeName = this.cameraController.cycleMode();
        this.ui.updateCameraMode(modeName);
      }

      // Time scale controls
      if (e.key === '+' || e.key === '=') {
        this.timeScale = Math.min(this.timeScale * 2, 60);
        this.ui.updateTimeScale(this.timeScale);
      }
      if (e.key === '-' || e.key === '_') {
        this.timeScale = Math.max(this.timeScale / 2, 1);
        this.ui.updateTimeScale(this.timeScale);
      }

      // Pause
      if (e.key === 'p') {
        this.isPaused = !this.isPaused;
      }

      // Horn (just for fun)
      if (e.key === 'h') {
        console.log('🎺 Horn!');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Initialize camera controller
    this.cameraController = new CameraController(
      this.camera,
      this.trainModel.getMesh()
    );
    this.ui.updateCameraMode(this.cameraController.getModeName());
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isPaused) {
      const deltaTime = Math.min(this.clock.getDelta(), 0.1);
      this.update(deltaTime);
    }

    this.render();
  }

  update(deltaTime) {
    const scaledDeltaTime = deltaTime * this.timeScale;

    // Update game time
    this.gameTime += scaledDeltaTime;

    // Handle input
    this.handleInput();

    // Update train physics
    const trainPos = this.trainPhysics.getPosition();
    const gradient = this.trackSystem.getGradientAtDistance(trainPos);
    const speedLimit = this.trackSystem.getSpeedLimitAtDistance(trainPos);

    this.trainPhysics.update(scaledDeltaTime, gradient, speedLimit);

    // Update train position
    const position = this.trackSystem.getPositionAtDistance(trainPos);
    const tangent = this.trackSystem.getTangentAtDistance(trainPos);

    const trainMesh = this.trainModel.getMesh();
    trainMesh.position.copy(position);

    // Rotate train to follow track
    const angle = Math.atan2(tangent.x, tangent.z);
    trainMesh.rotation.y = angle;

    // Update headlight based on time of day
    const hour = (this.gameTime / 3600) % 24;
    const isNight = hour < 6 || hour > 20;
    this.trainModel.setHeadlightIntensity(isNight ? 1.5 : 0.3);

    // Update sun position for day/night cycle
    this.updateDayNightCycle(hour);

    // Update camera with speed and rotation
    const speedKmh = this.trainPhysics.getSpeedKmh();
    this.cameraController.update(deltaTime, position, speedKmh, angle);

    // Update cabin interior
    this.cabinInterior.update(
      speedKmh,
      this.trainPhysics.getThrottle(),
      this.trainPhysics.getBrake()
    );

    // Show/hide cabin interior based on camera mode
    const isDriverView = this.cameraController.mode === 'DRIVER_VIEW';
    this.cabinInterior.setVisible(isDriverView);

    // Update world chunks
    this.world.update(trainPos);

    // Update stations
    const stationInfo = this.stationManager.update(
      scaledDeltaTime,
      this.trainPhysics.getPositionKm(),
      this.trainPhysics.getSpeedKmh()
    );

    // Update UI
    this.updateUI(stationInfo);
  }

  handleInput() {
    // Throttle control (W key)
    if (this.keys['w']) {
      const newThrottle = Math.min(this.trainPhysics.getThrottle() + 0.02, 1);
      this.trainPhysics.setThrottle(newThrottle);
    } else if (this.trainPhysics.getThrottle() > 0) {
      const newThrottle = Math.max(this.trainPhysics.getThrottle() - 0.01, 0);
      this.trainPhysics.setThrottle(newThrottle);
    }

    // Brake control (S key)
    if (this.keys['s']) {
      const newBrake = Math.min(this.trainPhysics.getBrake() + 0.03, 1);
      this.trainPhysics.setBrake(newBrake);
    } else if (this.trainPhysics.getBrake() > 0 && !this.keys[' ']) {
      const newBrake = Math.max(this.trainPhysics.getBrake() - 0.02, 0);
      this.trainPhysics.setBrake(newBrake);
    }

    // Emergency brake (Space)
    if (this.keys[' ']) {
      this.trainPhysics.setEmergencyBrake(true);
    } else {
      this.trainPhysics.setEmergencyBrake(false);
    }
  }

  updateDayNightCycle(hour) {
    // Update sun position
    const sunAngle = ((hour - 6) / 12) * Math.PI;
    this.sunLight.position.x = Math.cos(sunAngle) * 100;
    this.sunLight.position.y = Math.sin(sunAngle) * 100;

    // Update sky color
    let skyColor, fogColor;
    if (hour < 6 || hour > 20) {
      // Night
      skyColor = new THREE.Color(0x001133);
      fogColor = new THREE.Color(0x001133);
      this.sunLight.intensity = 0.2;
    } else if (hour < 8 || hour > 18) {
      // Dawn/Dusk
      skyColor = new THREE.Color(0xFF6B35);
      fogColor = new THREE.Color(0xFF6B35);
      this.sunLight.intensity = 0.5;
    } else {
      // Day
      skyColor = new THREE.Color(0x87CEEB);
      fogColor = new THREE.Color(0x87CEEB);
      this.sunLight.intensity = 0.8;
    }

    this.scene.background.lerp(skyColor, 0.01);
    this.scene.fog.color.lerp(fogColor, 0.01);
  }

  updateUI(stationInfo) {
    this.ui.updateSpeed(this.trainPhysics.getSpeedKmh());
    this.ui.updateThrottle(this.trainPhysics.getThrottle());
    this.ui.updateBrake(this.trainPhysics.getBrake());
    this.ui.updatePosition(this.trainPhysics.getPositionKm());
    this.ui.updateTime(this.gameTime);
    this.ui.updateFPS();

    if (stationInfo.nextStation) {
      this.ui.updateStationInfo(
        stationInfo.nextStation,
        stationInfo.distanceToStation
      );
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

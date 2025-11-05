/**
 * Train physics simulation
 * Handles acceleration, braking, momentum, and realistic train behavior
 */

import { kmhToMs, msToKmh, clamp } from '../utils/helpers.js';

export class TrainPhysics {
  constructor(config = {}) {
    // Train properties
    this.mass = config.mass || 300000; // kg (300 tons)
    this.maxPower = config.maxPower || 1600; // HP
    this.maxSpeed = kmhToMs(config.maxSpeed || 120); // m/s
    this.maxBrakeForce = config.maxBrakeForce || 150000; // N

    // State
    this.position = 0; // meters along track
    this.velocity = 0; // m/s
    this.acceleration = 0; // m/s²

    // Controls
    this.throttle = 0; // 0-1
    this.brake = 0; // 0-1
    this.emergencyBrake = false;

    // Physics constants
    this.rollingResistance = 0.001;
    this.airResistance = 0.5;
    this.gravity = 9.81;
  }

  update(deltaTime, gradient = 0, speedLimit = 120) {
    const speedLimitMs = kmhToMs(speedLimit);

    // Calculate forces
    const tractionForce = this.calculateTractionForce();
    const brakeForce = this.calculateBrakeForce();
    const resistanceForce = this.calculateResistanceForce();
    const gravityForce = this.calculateGravityForce(gradient);

    // Net force
    const netForce = tractionForce - brakeForce - resistanceForce - gravityForce;

    // Acceleration (F = ma)
    this.acceleration = netForce / this.mass;

    // Update velocity
    this.velocity += this.acceleration * deltaTime;

    // Enforce speed limit with gentle braking
    if (this.velocity > speedLimitMs) {
      this.velocity = speedLimitMs;
      this.acceleration = 0;
    }

    // Clamp velocity to realistic range
    this.velocity = clamp(this.velocity, 0, this.maxSpeed);

    // Update position
    this.position += this.velocity * deltaTime;

    // Prevent negative position
    if (this.position < 0) {
      this.position = 0;
      this.velocity = 0;
    }
  }

  calculateTractionForce() {
    if (this.throttle <= 0 || this.velocity >= this.maxSpeed) {
      return 0;
    }

    // Power curve: max power at low speeds, decreasing at high speeds
    const powerWatts = this.maxPower * 745.7; // Convert HP to Watts
    const force = (powerWatts / Math.max(this.velocity, 1)) * this.throttle;

    // Limit maximum tractive effort
    const maxTractiveEffort = 200000; // N
    return Math.min(force, maxTractiveEffort);
  }

  calculateBrakeForce() {
    if (this.emergencyBrake) {
      return this.maxBrakeForce;
    }

    return this.maxBrakeForce * this.brake;
  }

  calculateResistanceForce() {
    // Rolling resistance
    const rollingForce = this.rollingResistance * this.mass * this.gravity;

    // Air resistance (quadratic with speed)
    const airForce = this.airResistance * this.velocity * this.velocity;

    return rollingForce + airForce;
  }

  calculateGravityForce(gradient) {
    // Force due to track gradient (slope)
    // Positive gradient = uphill (opposing motion)
    // Negative gradient = downhill (assisting motion)
    return this.mass * this.gravity * gradient;
  }

  setThrottle(value) {
    this.throttle = clamp(value, 0, 1);
    if (this.throttle > 0) {
      this.brake = 0;
    }
  }

  setBrake(value) {
    this.brake = clamp(value, 0, 1);
    if (this.brake > 0) {
      this.throttle = 0;
    }
  }

  setEmergencyBrake(active) {
    this.emergencyBrake = active;
    if (active) {
      this.throttle = 0;
      this.brake = 1;
    }
  }

  getSpeed() {
    return this.velocity;
  }

  getSpeedKmh() {
    return msToKmh(this.velocity);
  }

  getPosition() {
    return this.position;
  }

  getPositionKm() {
    return this.position / 1000;
  }

  getThrottle() {
    return this.throttle;
  }

  getBrake() {
    return this.brake;
  }

  isMoving() {
    return this.velocity > 0.1;
  }

  isStopped() {
    return this.velocity < 0.1;
  }
}

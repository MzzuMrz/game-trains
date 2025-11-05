/**
 * Entry point for the Tucumán - Retiro Train Simulator
 */

import { Game } from './core/Game.js';

// Initialize the game when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚂 Iniciando Simulador de Tren: Tucumán - Retiro');
  console.log('📍 Recorrido: 1,298 km a través de Argentina');

  const game = new Game();

  // Expose game to window for debugging
  window.game = game;

  console.log('✅ Juego inicializado');
  console.log('🎮 Controles:');
  console.log('  W - Acelerar');
  console.log('  S - Frenar');
  console.log('  SPACE - Freno de emergencia');
  console.log('  C - Cambiar cámara');
  console.log('  +/- - Acelerar/desacelerar tiempo');
  console.log('  P - Pausar');
  console.log('  H - Bocina');
});

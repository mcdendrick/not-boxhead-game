import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import Stats from 'stats.js';
import { Player } from '../entities/Player';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { UIManager } from '../ui/UIManager';
import { AudioManager } from '../audio/AudioManager';
import { EnemyManager } from './EnemyManager';
import { WeaponManager } from '../weapons/WeaponManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private controls: PointerLockControls;
  private stats: Stats;
  
  private player: Player;
  private level: Level;
  private inputManager: InputManager;
  private uiManager: UIManager;
  private audioManager: AudioManager;
  private enemyManager: EnemyManager;
  private weaponManager: WeaponManager;
  private physicsWorld: PhysicsWorld;
  
  private isRunning: boolean = false;
  private score: number = 0;
  private currentWave: number = 1;
  
  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    document.getElementById('game-container')?.appendChild(this.renderer.domElement);
    
    // Initialize clock for time-based animations
    this.clock = new THREE.Clock();
    
    // Initialize controls
    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.scene.add(this.controls.getObject());
    
    // Initialize stats for performance monitoring
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
    
    // Initialize game components
    this.physicsWorld = new PhysicsWorld();
    this.level = new Level(this.scene, this.physicsWorld);
    this.audioManager = new AudioManager();
    
    // Initialize player
    this.player = new Player(this.controls, this.camera, this.physicsWorld);
    
    // Initialize weapon manager and connect to player
    this.weaponManager = new WeaponManager(this.scene, this.camera, this.audioManager);
    this.player.setWeaponManager(this.weaponManager);
    
    // Initialize remaining managers
    this.inputManager = new InputManager(this.controls, this.player);
    this.uiManager = new UIManager();
    this.enemyManager = new EnemyManager(this.scene, this.physicsWorld, this.player);
    
    // Set up event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Add basic lighting
    this.setupLighting();
    
    // Create skybox
    this.createSkybox();
  }
  
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }
  
  private createSkybox(): void {
    // Create a large cube with faces pointing inward
    const size = 500;
    const skyboxGeometry = new THREE.BoxGeometry(size, size, size);
    
    // Create materials for each face with different colors
    const materialArray = [
      new THREE.MeshBasicMaterial({ color: 0x0077ff, side: THREE.BackSide }), // right side
      new THREE.MeshBasicMaterial({ color: 0x0066dd, side: THREE.BackSide }), // left side
      new THREE.MeshBasicMaterial({ color: 0x00aaff, side: THREE.BackSide }), // top side
      new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide }), // bottom side
      new THREE.MeshBasicMaterial({ color: 0x0088ee, side: THREE.BackSide }), // front side
      new THREE.MeshBasicMaterial({ color: 0x0099ff, side: THREE.BackSide })  // back side
    ];
    
    // Create the skybox mesh
    const skybox = new THREE.Mesh(skyboxGeometry, materialArray);
    this.scene.add(skybox);
  }
  
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  public start(): void {
    this.isRunning = true;
    this.controls.lock();
    this.clock.start();
    this.audioManager.playMusic('game');
    
    // Make sure to start the first wave
    this.currentWave = 1;
    this.uiManager.updateWave(this.currentWave);
    this.enemyManager.startWave(this.currentWave);
    
    // Start the animation loop
    this.animate();
  }
  
  public restart(): void {
    // Reset game state
    this.score = 0;
    this.currentWave = 1;
    
    // Reset managers
    this.player.reset();
    this.enemyManager.reset();
    this.weaponManager.reset();
    
    // Update UI
    this.uiManager.updateScore(this.score);
    this.uiManager.updateWave(this.currentWave);
    this.uiManager.updateHealth(this.player.getHealth());
    this.uiManager.updateAmmo(this.weaponManager.getCurrentAmmo(), this.weaponManager.getTotalAmmo());
    
    // Start the game
    this.start();
  }
  
  public gameOver(): void {
    this.isRunning = false;
    this.controls.unlock();
    this.audioManager.stopMusic();
    this.audioManager.playSound('gameOver');
    
    // Show game over screen
    const gameOver = document.getElementById('game-over');
    const gameUI = document.getElementById('game-ui');
    
    if (gameOver) {
      const finalScore = document.getElementById('final-score');
      const finalWave = document.getElementById('final-wave');
      
      if (finalScore) {
        finalScore.textContent = this.score.toString();
      }
      
      if (finalWave) {
        finalWave.textContent = this.currentWave.toString();
      }
      
      gameOver.classList.remove('hidden');
    }
    
    if (gameUI) {
      gameUI.style.display = 'none';
    }
  }
  
  private update(deltaTime: number): void {
    // Update physics
    this.physicsWorld.update(deltaTime);
    
    // Update player
    this.player.update(deltaTime);
    
    // Update enemies
    this.enemyManager.update(deltaTime);
    
    // Update weapons
    this.weaponManager.update(deltaTime);
    
    // Check for collisions
    this.checkCollisions();
    
    // Check wave completion
    if (this.enemyManager.isWaveComplete()) {
      this.currentWave++;
      this.uiManager.updateWave(this.currentWave);
      this.enemyManager.startWave(this.currentWave);
      this.audioManager.playSound('waveComplete');
      
      // Unlock weapons based on wave progression
      this.checkWeaponUnlocks();
    }
    
    // Check player health
    if (this.player.getHealth() <= 0) {
      this.gameOver();
    }
    
    // Update UI
    this.uiManager.updateHealth(this.player.getHealth());
    this.uiManager.updateAmmo(this.weaponManager.getCurrentAmmo(), this.weaponManager.getTotalAmmo());
    this.uiManager.updateWeaponName(this.weaponManager.getCurrentWeapon().getName());
  }
  
  private checkCollisions(): void {
    // Check enemy-player collisions
    const enemies = this.enemyManager.getEnemies();
    for (const enemy of enemies) {
      if (enemy.isCollidingWith(this.player)) {
        this.player.takeDamage(enemy.getDamage());
        this.audioManager.playSound('playerHit');
      }
    }
    
    // Check bullet-enemy collisions
    const bullets = this.weaponManager.getActiveBullets();
    for (const bullet of bullets) {
      for (const enemy of enemies) {
        if (bullet.isCollidingWith(enemy)) {
          enemy.takeDamage(bullet.getDamage());
          bullet.destroy();
          this.audioManager.playSound('enemyHit');
          
          // Check if enemy died
          if (enemy.getHealth() <= 0) {
            this.score += enemy.getScoreValue();
            this.uiManager.updateScore(this.score);
            this.enemyManager.removeEnemy(enemy);
            this.audioManager.playSound('enemyDeath');
          }
          
          break;
        }
      }
    }
  }
  
  private checkWeaponUnlocks(): void {
    // Unlock weapons based on wave progression
    // Wave 2: Unlock Shotgun
    if (this.currentWave === 2) {
      this.player.unlockWeapon(1); // Shotgun
      // Switch to the newly unlocked weapon
      this.player.switchWeapon(1);
      this.uiManager.showMessage("Shotgun Unlocked!", 3000);
      this.audioManager.playSound('weaponUnlock');
    }
    // Wave 4: Unlock Assault Rifle
    else if (this.currentWave === 4) {
      this.player.unlockWeapon(2); // Assault Rifle
      // Switch to the newly unlocked weapon
      this.player.switchWeapon(2);
      this.uiManager.showMessage("Assault Rifle Unlocked!", 3000);
      this.audioManager.playSound('weaponUnlock');
    }
    // Wave 6: Unlock Rocket Launcher
    else if (this.currentWave === 6) {
      this.player.unlockWeapon(3); // Rocket Launcher
      // Switch to the newly unlocked weapon
      this.player.switchWeapon(3);
      this.uiManager.showMessage("Rocket Launcher Unlocked!", 3000);
      this.audioManager.playSound('weaponUnlock');
    }
    // Wave 8: Unlock Minigun
    else if (this.currentWave === 8) {
      this.player.unlockWeapon(4); // Minigun
      // Switch to the newly unlocked weapon
      this.player.switchWeapon(4);
      this.uiManager.showMessage("Minigun Unlocked!", 3000);
      this.audioManager.playSound('weaponUnlock');
    }
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    this.stats.begin();
    
    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
    
    this.stats.end();
  }
} 
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Player } from '../entities/Player';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { UIManager } from '../ui/UIManager';
import { AudioManager } from '../audio/AudioManager';
import { EnemyManager } from './EnemyManager';
import { WeaponManager } from '../weapons/WeaponManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { ExplodingZombie } from '../entities/ExplodingZombie';

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
  private isPaused: boolean = false;
  private score: number = 0;
  private currentWave: number = 1;
  
  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Set initial camera position
    this.camera.position.set(0, 2, 0);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add renderer to DOM
    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
      console.warn('Game container not found, appending to body');
    }
    
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
    this.inputManager = new InputManager(this.controls, this.player, this);
    this.uiManager = new UIManager();
    this.enemyManager = new EnemyManager(this.scene, this.physicsWorld, this.player);
    
    // Set up event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Add basic lighting
    this.setupLighting();
    
    // Create skybox
    this.createSkybox();
    
    // Ensure first frame is rendered
    this.renderer.render(this.scene, this.camera);
    
    // Make game instance globally accessible for UI interactions
    (window as any).gameInstance = this;
    
    console.log('Game initialized');
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
    // Lock pointer controls
    this.controls.lock();
    
    // Start the clock
    this.clock.start();
    
    // Set game as running
    this.isRunning = true;
    
    // Add event listener for pointer lock changes
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.renderer.domElement) {
        this.isRunning = true;
        this.clock.start(); // Restart clock when focus is regained
      } else {
        this.isRunning = false;
      }
    });
    
    // Start the first wave
    this.enemyManager.startWave(this.currentWave);
    this.uiManager.updateWave(this.currentWave);
    
    // Make sure player's collision detection is initialized
    this.player.updateCollisionObjects();
    
    // Start the game loop with proper binding
    const boundAnimate = this.animate.bind(this);
    boundAnimate();
    
    // Play background music
    try {
      this.audioManager.playMusic('game');
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }
  
  public restart(): void {
    // Reset game state
    this.score = 0;
    this.currentWave = 1;
    
    // Reset UI
    this.uiManager.updateScore(this.score);
    this.uiManager.updateWave(this.currentWave);
    this.uiManager.updateHealth(this.player.getMaxHealth());
    
    // Reset player
    this.player.reset();
    
    // Make sure player's collision detection is updated
    this.player.updateCollisionObjects();
    
    // Reset enemies
    this.enemyManager.reset();
    
    // Reset weapons
    this.weaponManager.reset();
    
    // Start the first wave
    this.enemyManager.startWave(this.currentWave);
    
    // Hide game over screen if visible
    const gameOver = document.getElementById('game-over');
    if (gameOver) {
      gameOver.classList.add('hidden');
    }
    
    // Show game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.style.display = 'block';
    }
    
    // Lock controls
    this.controls.lock();
    
    // Restart clock and set game as running
    this.clock.start();
    this.isRunning = true;
    
    // Play background music
    this.audioManager.playMusic('game');
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
  
  public togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }
  
  private pauseGame(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.clock.stop(); // Stop the clock to prevent time from advancing
    
    // Pause audio
    this.audioManager.pauseMusic();
    
    // Show pause menu
    this.uiManager.showPauseMenu(true);
    
    // Unlock controls to allow mouse interaction with the pause menu
    this.controls.unlock();
  }
  
  private resumeGame(): void {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    this.clock.start(); // Restart the clock
    
    // Resume audio
    this.audioManager.resumeMusic();
    
    // Hide pause menu
    this.uiManager.showPauseMenu(false);
    
    // Lock controls again
    this.controls.lock();
  }
  
  private update(deltaTime: number): void {
    // Skip updates if game is paused
    if (this.isPaused) return;
    
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
    
    // Show invulnerability indicator when player is invulnerable
    this.uiManager.showInvulnerabilityIndicator(this.player.isInvulnerable());
  }
  
  private checkCollisions(): void {
    // Check enemy-player collisions
    const enemies = this.enemyManager.getEnemies();
    for (const enemy of enemies) {
      if (enemy.isCollidingWith(this.player)) {
        // Only apply damage if player is not invulnerable
        if (!this.player.isInvulnerable()) {
          // Player takes damage from enemy
          this.player.takeDamage(enemy.getDamage());
          
          // Show damage indicator in the direction of the enemy
          const playerPosition = this.player.getPosition();
          const enemyPosition = enemy.getPosition();
          const direction = new THREE.Vector3().subVectors(enemyPosition, playerPosition).normalize();
          
          let damageDirection = 'front';
          const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
          
          if (angle > -45 && angle < 45) {
            damageDirection = 'front';
          } else if (angle >= 45 && angle < 135) {
            damageDirection = 'right';
          } else if (angle <= -45 && angle > -135) {
            damageDirection = 'left';
          } else {
            damageDirection = 'back';
          }
          
          this.uiManager.showDamageIndicator(damageDirection);
          
          // Play damage sound
          this.audioManager.playSound('playerDamage');
        }
      }
      
      // Check if exploding zombie is near player
      if (enemy instanceof ExplodingZombie && enemy.isExploding && 
          enemy.getPosition().distanceTo(this.player.getPosition()) < enemy.getExplosionRadius()) {
        // Only apply explosion damage if player is not invulnerable
        if (!this.player.isInvulnerable()) {
          // Player takes explosion damage (reduced to 5% per frame instead of 10%)
          this.player.takeDamage(enemy.getExplosionDamage() * 0.05);
          
          // Show damage indicator in all directions
          this.uiManager.showDamageIndicator('all');
          
          // Play explosion damage sound
          this.audioManager.playSound('explosion');
        }
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
    try {
      // Always request next frame, even if not running
      requestAnimationFrame(this.animate.bind(this));
      
      // Only update and render if the game is running
      if (!this.isRunning) return;
      
      this.stats.begin();
      
      // Only update if not paused
      if (!this.isPaused) {
        const deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap delta time to prevent large jumps
        this.update(deltaTime);
      }
      
      // Always render the scene, even when paused
      this.renderer.render(this.scene, this.camera);
      
      this.stats.end();
    } catch (error) {
      console.error('Error in animate loop:', error);
    }
  }
} 
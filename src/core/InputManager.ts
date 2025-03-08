import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Player } from '../entities/Player';
import { Game } from './Game';

export class InputManager {
  private controls: PointerLockControls;
  private player: Player;
  private game: Game;
  
  private keys: { [key: string]: boolean } = {};
  private mouseButtons: { [button: number]: boolean } = {};
  
  // Track last pause press time to prevent multiple toggles
  private lastPauseTime: number = 0;
  private readonly PAUSE_COOLDOWN: number = 300; // ms
  
  constructor(controls: PointerLockControls, player: Player, game: Game) {
    this.controls = controls;
    this.player = player;
    this.game = game;
    
    // Set up event listeners
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Lock pointer on click
    document.addEventListener('click', () => {
      if (!this.controls.isLocked) {
        this.controls.lock();
      }
    });
    
    // Handle pointer lock change
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
    
    // Handle player movement
    this.updatePlayerMovement();
    
    // Handle weapon switching
    if (event.code === 'Digit1') {
      console.log('Switching to weapon 0 (Pistol)');
      this.player.switchWeapon(0);
    } else if (event.code === 'Digit2') {
      console.log('Switching to weapon 1 (Shotgun)');
      this.player.switchWeapon(1);
    } else if (event.code === 'Digit3') {
      console.log('Switching to weapon 2 (Assault Rifle)');
      this.player.switchWeapon(2);
    } else if (event.code === 'Digit4') {
      console.log('Switching to weapon 3 (Rocket Launcher)');
      this.player.switchWeapon(3);
    } else if (event.code === 'Digit5') {
      console.log('Switching to weapon 4 (Minigun)');
      this.player.switchWeapon(4);
    } else if (event.code === 'KeyQ') {
      console.log('Switching to previous weapon');
      this.player.switchToPreviousWeapon();
    } else if (event.code === 'KeyE') {
      console.log('Switching to next weapon');
      this.player.switchToNextWeapon();
    }
    
    // Handle reload
    if (event.code === 'KeyR') {
      console.log('Reloading weapon');
      this.player.reload();
    }
    
    // Handle pause
    if (event.code === 'KeyP') {
      const currentTime = Date.now();
      if (currentTime - this.lastPauseTime > this.PAUSE_COOLDOWN) {
        console.log('Toggling pause');
        this.game.togglePause();
        this.lastPauseTime = currentTime;
      }
    }
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
    
    // Update player movement
    this.updatePlayerMovement();
  }
  
  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons[event.button] = true;
    
    // Handle shooting (left mouse button)
    if (event.button === 0) {
      this.player.startShooting();
    }
  }
  
  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons[event.button] = false;
    
    // Handle shooting (left mouse button)
    if (event.button === 0) {
      this.player.stopShooting();
    }
  }
  
  private onPointerLockChange(): void {
    if (!this.controls.isLocked) {
      // Reset keys and mouse buttons when pointer is unlocked
      this.keys = {};
      this.mouseButtons = {};
      
      // Stop player movement and shooting
      this.updatePlayerMovement();
      this.player.stopShooting();
    }
  }
  
  private updatePlayerMovement(): void {
    const moveForward = this.keys['KeyW'] || false;
    const moveBackward = this.keys['KeyS'] || false;
    const moveLeft = this.keys['KeyA'] || false;
    const moveRight = this.keys['KeyD'] || false;
    const jump = this.keys['Space'] || false;
    const sprint = this.keys['ShiftLeft'] || false;
    
    this.player.setMovement(moveForward, moveBackward, moveLeft, moveRight, jump, sprint);
  }
  
  public update(): void {
    // Check for continuous shooting
    if (this.mouseButtons[0]) {
      this.player.startShooting();
    } else {
      this.player.stopShooting();
    }
    
    // Update player movement
    this.updatePlayerMovement();
  }
} 
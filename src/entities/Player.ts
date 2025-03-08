import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from '../weapons/Weapon';
import { Pistol } from '../weapons/Pistol';
import { Shotgun } from '../weapons/Shotgun';
import { AssaultRifle } from '../weapons/AssaultRifle';
import { RocketLauncher } from '../weapons/RocketLauncher';
import { Minigun } from '../weapons/Minigun';
import { WeaponManager } from '../weapons/WeaponManager';

export class Player {
  private controls: PointerLockControls;
  private camera: THREE.PerspectiveCamera;
  private physicsWorld: PhysicsWorld;
  
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private position: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = true;
  private isSprinting: boolean = false;
  
  private health: number = 100;
  private maxHealth: number = 100;
  
  private weapons: Weapon[] = [];
  private currentWeaponIndex: number = 0;
  private isShooting: boolean = false;
  private weaponManager: WeaponManager | null = null;
  
  // Track which weapons are unlocked
  private unlockedWeapons: boolean[] = [true, false, false, false, false]; // Only pistol unlocked initially
  
  private readonly PLAYER_HEIGHT: number = 1.8;
  private readonly PLAYER_RADIUS: number = 0.5;
  private readonly WALK_SPEED: number = 5.0;
  private readonly SPRINT_SPEED: number = 8.0;
  private readonly JUMP_FORCE: number = 1.0; // Reduced to prevent extremely high jumps
  
  constructor(controls: PointerLockControls, camera: THREE.PerspectiveCamera, physicsWorld: PhysicsWorld) {
    this.controls = controls;
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    
    // Set initial position
    this.controls.getObject().position.copy(this.position);
    
    // Initialize weapons
    this.initializeWeapons();
  }
  
  private initializeWeapons(): void {
    // Add default weapons
    this.weapons.push(new Pistol());
    this.weapons.push(new Shotgun());
    this.weapons.push(new AssaultRifle());
    this.weapons.push(new RocketLauncher());
    this.weapons.push(new Minigun());
    
    // Set current weapon to pistol (the only unlocked weapon initially)
    this.currentWeaponIndex = 0;
  }
  
  public update(deltaTime: number): void {
    // Update velocity based on movement input
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    const speed = this.isSprinting ? this.SPRINT_SPEED : this.WALK_SPEED;
    
    // Get camera direction vectors
    const cameraObject = this.controls.getObject();
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraObject.quaternion);
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraObject.quaternion);
    
    // Zero out the y component to keep movement horizontal
    cameraDirection.y = 0;
    cameraRight.y = 0;
    cameraDirection.normalize();
    cameraRight.normalize();
    
    // Calculate movement direction based on input and camera orientation
    this.direction.set(0, 0, 0);
    
    if (this.moveForward) {
      this.direction.add(cameraDirection);
    }
    if (this.moveBackward) {
      this.direction.sub(cameraDirection);
    }
    if (this.moveRight) {
      this.direction.add(cameraRight);
    }
    if (this.moveLeft) {
      this.direction.sub(cameraRight);
    }
    
    // Normalize direction if moving
    if (this.direction.lengthSq() > 0) {
      this.direction.normalize();
      
      // Apply movement speed
      this.velocity.x = this.direction.x * speed * deltaTime;
      this.velocity.z = this.direction.z * speed * deltaTime;
    }
    
    // Apply gravity
    this.velocity.y -= 7.5 * deltaTime; // Increased to match physics world gravity
    
    // Update position
    this.controls.getObject().position.x += this.velocity.x;
    this.controls.getObject().position.y += this.velocity.y;
    this.controls.getObject().position.z += this.velocity.z;
    
    // Check for ground collision
    if (this.controls.getObject().position.y < this.PLAYER_HEIGHT) {
      this.velocity.y = 0;
      this.controls.getObject().position.y = this.PLAYER_HEIGHT;
      this.canJump = true;
    }
    
    // Update current weapon
    if (this.isShooting) {
      this.shoot();
    }
    
    // Update position for collision detection
    this.position.copy(this.controls.getObject().position);
  }
  
  public setMovement(forward: boolean, backward: boolean, left: boolean, right: boolean, jump: boolean, sprint: boolean): void {
    this.moveForward = forward;
    this.moveBackward = backward;
    this.moveLeft = left;
    this.moveRight = right;
    this.isSprinting = sprint;
    
    if (jump && this.canJump) {
      this.velocity.y = this.JUMP_FORCE;
      this.canJump = false;
    }
  }
  
  public startShooting(): void {
    this.isShooting = true;
  }
  
  public stopShooting(): void {
    this.isShooting = false;
  }
  
  public setWeaponManager(weaponManager: WeaponManager): void {
    this.weaponManager = weaponManager;
  }
  
  public shoot(): void {
    if (this.weaponManager) {
      this.weaponManager.shoot();
    } else if (this.weapons.length > 0) {
      // Fallback to direct weapon usage if weaponManager not set
      this.weapons[this.currentWeaponIndex].shoot();
    }
  }
  
  public reload(): void {
    if (this.weapons.length > 0) {
      this.weapons[this.currentWeaponIndex].reload();
    }
  }
  
  public switchWeapon(index: number): void {
    console.log(`Player.switchWeapon(${index}) called. Unlocked: ${this.unlockedWeapons[index]}`);
    // Only switch to unlocked weapons
    if (index >= 0 && index < this.weapons.length && this.unlockedWeapons[index]) {
      this.currentWeaponIndex = index;
      console.log(`Switched to weapon ${index}: ${this.weapons[index].getName()}`);
      
      // Update the weapon manager if available
      if (this.weaponManager) {
        console.log('Notifying WeaponManager of weapon switch');
        this.weaponManager.switchWeapon(index);
      } else {
        console.log('WeaponManager is null, cannot notify');
      }
    }
  }
  
  public switchToPreviousWeapon(): void {
    console.log('Player.switchToPreviousWeapon() called');
    let newIndex = this.currentWeaponIndex;
    
    // Find the previous unlocked weapon
    do {
      newIndex = (newIndex - 1 + this.weapons.length) % this.weapons.length;
      console.log(`Checking weapon ${newIndex}: Unlocked: ${this.unlockedWeapons[newIndex]}`);
      // If we've checked all weapons and none are unlocked, break to avoid infinite loop
      if (newIndex === this.currentWeaponIndex) break;
    } while (!this.unlockedWeapons[newIndex]);
    
    // Only switch if we found an unlocked weapon
    if (this.unlockedWeapons[newIndex]) {
      this.currentWeaponIndex = newIndex;
      console.log(`Switched to previous weapon ${newIndex}: ${this.weapons[newIndex].getName()}`);
      
      // Update the weapon manager if available
      if (this.weaponManager) {
        console.log('Notifying WeaponManager of weapon switch');
        this.weaponManager.switchWeapon(newIndex);
      } else {
        console.log('WeaponManager is null, cannot notify');
      }
    }
  }
  
  public switchToNextWeapon(): void {
    console.log('Player.switchToNextWeapon() called');
    let newIndex = this.currentWeaponIndex;
    
    // Find the next unlocked weapon
    do {
      newIndex = (newIndex + 1) % this.weapons.length;
      console.log(`Checking weapon ${newIndex}: Unlocked: ${this.unlockedWeapons[newIndex]}`);
      // If we've checked all weapons and none are unlocked, break to avoid infinite loop
      if (newIndex === this.currentWeaponIndex) break;
    } while (!this.unlockedWeapons[newIndex]);
    
    // Only switch if we found an unlocked weapon
    if (this.unlockedWeapons[newIndex]) {
      this.currentWeaponIndex = newIndex;
      console.log(`Switched to next weapon ${newIndex}: ${this.weapons[newIndex].getName()}`);
      
      // Update the weapon manager if available
      if (this.weaponManager) {
        console.log('Notifying WeaponManager of weapon switch');
        this.weaponManager.switchWeapon(newIndex);
      } else {
        console.log('WeaponManager is null, cannot notify');
      }
    }
  }
  
  public unlockWeapon(index: number): void {
    if (index >= 0 && index < this.unlockedWeapons.length) {
      this.unlockedWeapons[index] = true;
      
      // Reset the weapon to ensure it has full ammo when unlocked
      if (index < this.weapons.length) {
        this.weapons[index].reset();
      }
    }
  }
  
  public isWeaponUnlocked(index: number): boolean {
    return index >= 0 && index < this.unlockedWeapons.length && this.unlockedWeapons[index];
  }
  
  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }
  
  public heal(amount: number): void {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  
  public getHealth(): number {
    return this.health;
  }
  
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }
  
  public reset(): void {
    // Reset position
    this.position.set(0, 2, 0);
    this.controls.getObject().position.copy(this.position);
    
    // Reset velocity
    this.velocity.set(0, 0, 0);
    
    // Reset health
    this.health = this.maxHealth;
    
    // Reset weapons
    this.weapons.forEach(weapon => weapon.reset());
    this.currentWeaponIndex = 0;
    
    // Reset unlocked weapons (keep only pistol unlocked)
    this.unlockedWeapons = [true, false, false, false, false];
    
    // Reset movement
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.canJump = true;
    this.isShooting = false;
  }
} 
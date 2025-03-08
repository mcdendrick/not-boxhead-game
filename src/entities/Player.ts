import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Weapon } from '../weapons/Weapon';
import { Pistol } from '../weapons/Pistol';
import { Shotgun } from '../weapons/Shotgun';
import { AssaultRifle } from '../weapons/AssaultRifle';
import { RocketLauncher } from '../weapons/RocketLauncher';
import { Minigun } from '../weapons/Minigun';
import { WeaponManager } from '../weapons/WeaponManager';
import * as CANNON from 'cannon-es';

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
  
  // Damage cooldown system
  private invulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;
  private readonly INVULNERABILITY_DURATION: number = 1.5; // Increased from 1.0 to 1.5 seconds
  
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
  
  // Collision detection
  private collisionObjects: CANNON.Body[] = [];
  
  constructor(controls: PointerLockControls, camera: THREE.PerspectiveCamera, physicsWorld: PhysicsWorld) {
    this.controls = controls;
    this.camera = camera;
    this.physicsWorld = physicsWorld;
    
    // Set initial position
    this.position.set(0, this.PLAYER_HEIGHT, 0);
    this.controls.getObject().position.copy(this.position);
    
    // Ensure camera is at the correct height
    this.camera.position.y = this.PLAYER_HEIGHT;
    
    // Initialize weapons
    this.initializeWeapons();
    
    // Get all static bodies from the physics world for collision detection
    this.updateCollisionObjects();
  }
  
  public updateCollisionObjects(): void {
    // Get all bodies from the physics world
    const world = this.physicsWorld.getWorld();
    this.collisionObjects = [];
    
    // Add all static bodies to collision objects
    world.bodies.forEach(body => {
      if (body.mass === 0) { // Static bodies have mass of 0
        this.collisionObjects.push(body);
      }
    });
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
    this.velocity.y -= 9.8 * deltaTime;
    
    // Store current position before movement
    const previousPosition = this.controls.getObject().position.clone();
    
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
    
    // Check for wall collisions
    this.checkWallCollisions(previousPosition);
    
    // Update current weapon
    if (this.isShooting) {
      this.shoot();
    }
    
    // Update position for collision detection
    this.position.copy(this.controls.getObject().position);
    
    // Update invulnerability timer
    if (this.invulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
      }
    }
  }
  
  private checkWallCollisions(previousPosition: THREE.Vector3): void {
    // Simple collision detection with walls and obstacles
    const playerPosition = this.controls.getObject().position.clone();
    
    // Check each collision object
    for (const body of this.collisionObjects) {
      // Skip non-box shapes for simplicity
      if (!body.shapes[0] || !(body.shapes[0] instanceof CANNON.Box)) continue;
      
      const boxShape = body.shapes[0] as CANNON.Box;
      const halfExtents = boxShape.halfExtents;
      
      // Get the world position and rotation of the body
      const bodyPosition = body.position;
      const bodyQuaternion = body.quaternion;
      
      // Create a box3 for the obstacle
      const boxMin = new THREE.Vector3(
        bodyPosition.x - halfExtents.x,
        bodyPosition.y - halfExtents.y,
        bodyPosition.z - halfExtents.z
      );
      
      const boxMax = new THREE.Vector3(
        bodyPosition.x + halfExtents.x,
        bodyPosition.y + halfExtents.y,
        bodyPosition.z + halfExtents.z
      );
      
      // Check if player is colliding with the box
      if (this.isCollidingWithBox(playerPosition, boxMin, boxMax)) {
        // Handle collision by reverting to previous position
        // But only in the X and Z directions to allow jumping
        this.controls.getObject().position.x = previousPosition.x;
        this.controls.getObject().position.z = previousPosition.z;
        
        // Add a small push-back effect to prevent getting stuck
        const pushDirection = new THREE.Vector3(
          playerPosition.x - bodyPosition.x,
          0,
          playerPosition.z - bodyPosition.z
        ).normalize();
        
        // Apply a small push in the direction away from the obstacle
        this.controls.getObject().position.x += pushDirection.x * 0.1;
        this.controls.getObject().position.z += pushDirection.z * 0.1;
        
        break;
      }
    }
  }
  
  private isCollidingWithBox(playerPos: THREE.Vector3, boxMin: THREE.Vector3, boxMax: THREE.Vector3): boolean {
    // Check if player's bounding cylinder intersects with the box
    // For simplicity, we'll use a cylinder approximation (just check a circle in the XZ plane)
    
    // First, check if player's Y position is within the box's Y range (with some margin for the player height)
    const playerBottom = playerPos.y - this.PLAYER_HEIGHT / 2;
    const playerTop = playerPos.y + this.PLAYER_HEIGHT / 2;
    
    if (playerTop < boxMin.y || playerBottom > boxMax.y) {
      return false; // No collision in Y axis
    }
    
    // Now check XZ plane using circle vs. rectangle collision
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(boxMin.x, Math.min(playerPos.x, boxMax.x));
    const closestZ = Math.max(boxMin.z, Math.min(playerPos.z, boxMax.z));
    
    // Calculate distance from closest point to circle center
    const distanceX = playerPos.x - closestX;
    const distanceZ = playerPos.z - closestZ;
    const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;
    
    // Check if distance is less than player radius
    return distanceSquared < (this.PLAYER_RADIUS * this.PLAYER_RADIUS);
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
      console.log(`Unlocked weapon ${index}: ${this.weapons[index].getName()}`);
    }
  }
  
  public isWeaponUnlocked(index: number): boolean {
    return index >= 0 && index < this.unlockedWeapons.length && this.unlockedWeapons[index];
  }
  
  public takeDamage(amount: number): void {
    // Skip damage if player is invulnerable
    if (this.invulnerable) return;
    
    // Apply damage
    this.health = Math.max(0, this.health - amount);
    console.log(`Player took ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
    
    // Make player invulnerable for a short time
    this.invulnerable = true;
    this.invulnerabilityTimer = this.INVULNERABILITY_DURATION;
  }
  
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    console.log(`Player healed ${amount} health. Health: ${this.health}/${this.maxHealth}`);
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
    // Reset player position
    this.position.set(0, this.PLAYER_HEIGHT, 0);
    this.controls.getObject().position.copy(this.position);
    
    // Reset velocity
    this.velocity.set(0, 0, 0);
    
    // Reset health
    this.health = this.maxHealth;
    
    // Reset invulnerability
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;
    
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
    
    // Update collision objects
    this.updateCollisionObjects();
  }
  
  public isInvulnerable(): boolean {
    return this.invulnerable;
  }
} 
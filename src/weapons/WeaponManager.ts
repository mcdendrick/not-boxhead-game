import * as THREE from 'three';
import { Camera } from 'three';
import { Weapon } from './Weapon';
import { Pistol } from './Pistol';
import { Shotgun } from './Shotgun';
import { AssaultRifle } from './AssaultRifle';
import { RocketLauncher } from './RocketLauncher';
import { Minigun } from './Minigun';
import { AudioManager } from '../audio/AudioManager';
import { Bullet } from './Bullet';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class WeaponManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private audioManager: AudioManager;
  
  private weapons: Weapon[] = [];
  private currentWeaponIndex: number = 0;
  
  private bullets: Bullet[] = [];
  private raycaster: THREE.Raycaster;
  
  private weaponModel: THREE.Group | null = null;
  
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, audioManager: AudioManager) {
    this.scene = scene;
    this.camera = camera;
    this.audioManager = audioManager;
    this.raycaster = new THREE.Raycaster();
    
    // Initialize weapons
    this.initializeWeapons();
    
    // Create initial weapon model
    this.createWeaponModel();
  }
  
  private initializeWeapons(): void {
    // Create weapons
    const pistol = new Pistol();
    const shotgun = new Shotgun();
    const assaultRifle = new AssaultRifle();
    const rocketLauncher = new RocketLauncher();
    const minigun = new Minigun();
    
    // Set audio manager for each weapon
    pistol.setAudioManager(this.audioManager);
    shotgun.setAudioManager(this.audioManager);
    assaultRifle.setAudioManager(this.audioManager);
    rocketLauncher.setAudioManager(this.audioManager);
    minigun.setAudioManager(this.audioManager);
    
    // Add to weapons array
    this.weapons.push(pistol);
    this.weapons.push(shotgun);
    this.weapons.push(assaultRifle);
    this.weapons.push(rocketLauncher);
    this.weapons.push(minigun);
    
    // Set current weapon to pistol
    this.currentWeaponIndex = 0;
  }
  
  public update(deltaTime: number): void {
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Update bullet
      bullet.update(deltaTime);
      
      // Remove if expired
      if (bullet.isExpired()) {
        bullet.destroy();
        this.bullets.splice(i, 1);
      }
    }
  }
  
  public shoot(): void {
    if (this.weapons.length === 0) return;
    
    const currentWeapon = this.weapons[this.currentWeaponIndex];
    
    // Try to shoot
    if (currentWeapon.shoot()) {
      // Create bullet or handle hit scan
      this.handleWeaponFire(currentWeapon);
    }
  }
  
  private handleWeaponFire(weapon: Weapon): void {
    // Set up raycaster from camera
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Calculate muzzle position based on weapon type
    let muzzlePosition = new THREE.Vector3();
    
    if (this.weaponModel) {
      // Get the weapon model's world position
      this.weaponModel.updateWorldMatrix(true, false);
      
      // Different muzzle positions based on weapon type
      if (weapon instanceof Pistol) {
        // Position at the end of the barrel
        muzzlePosition.set(0, 0, -0.2);
      } else if (weapon instanceof Shotgun) {
        // Position at the end of the double barrel
        muzzlePosition.set(0, 0, -0.3);
      } else if (weapon instanceof AssaultRifle) {
        // Position at the end of the assault rifle barrel
        muzzlePosition.set(0, 0, -0.4);
      } else if (weapon instanceof RocketLauncher) {
        // Position at the end of the rocket launcher tube
        muzzlePosition.set(0, 0, -0.5);
      } else if (weapon instanceof Minigun) {
        // Position at the end of the minigun barrels
        muzzlePosition.set(0, 0, -0.5);
      }
      
      // Apply the weapon model's transformation to the muzzle position
      muzzlePosition.applyMatrix4(this.weaponModel.matrixWorld);
    } else {
      // Fallback to camera position if no weapon model
      muzzlePosition.copy(this.camera.position);
    }
    
    // For hitscan weapons (pistol, shotgun, assault rifle, minigun)
    if (weapon instanceof Pistol || 
        weapon instanceof Shotgun || 
        weapon instanceof AssaultRifle || 
        weapon instanceof Minigun) {
      
      // Get intersection with objects in the scene
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      
      if (intersects.length > 0) {
        // Hit something
        const hit = intersects[0];
        
        // Create bullet projectile
        this.createBulletProjectile(muzzlePosition, hit.point);
        
        // Create impact effect
        this.createImpactEffect(hit.point, hit.face?.normal || new THREE.Vector3(0, 1, 0));
      } else {
        // Didn't hit anything, create bullet to max range
        const endPoint = new THREE.Vector3().copy(this.raycaster.ray.direction)
          .multiplyScalar(weapon.getRange())
          .add(this.camera.position);
          
        this.createBulletProjectile(muzzlePosition, endPoint);
      }
      
      // For shotgun, create multiple projectiles
      if (weapon instanceof Shotgun) {
        // Create 5 additional spread shots
        for (let i = 0; i < 5; i++) {
          const spreadDir = new THREE.Vector3().copy(this.raycaster.ray.direction);
          
          // Add random spread
          spreadDir.x += (Math.random() - 0.5) * 0.1;
          spreadDir.y += (Math.random() - 0.5) * 0.1;
          spreadDir.z += (Math.random() - 0.5) * 0.1;
          spreadDir.normalize();
          
          const spreadRay = new THREE.Raycaster(this.camera.position, spreadDir);
          const spreadIntersects = spreadRay.intersectObjects(this.scene.children, true);
          
          if (spreadIntersects.length > 0) {
            const hit = spreadIntersects[0];
            this.createBulletProjectile(muzzlePosition, hit.point);
            this.createImpactEffect(hit.point, hit.face?.normal || new THREE.Vector3(0, 1, 0));
          } else {
            const endPoint = new THREE.Vector3().copy(spreadDir)
              .multiplyScalar(weapon.getRange())
              .add(this.camera.position);
              
            this.createBulletProjectile(muzzlePosition, endPoint);
          }
        }
      }
    } 
    // For projectile weapons (rocket launcher)
    else if (weapon instanceof RocketLauncher) {
      // Create a rocket projectile with improved visibility and properties
      const rocket = new Bullet(
        this.scene,
        muzzlePosition.clone(),
        this.raycaster.ray.direction.clone(),
        20, // Increased speed for better gameplay
        3,  // Reduced lifetime for faster impact
        weapon.getDamage(),
        true // Explosive
      );
      
      // Add rocket trail effect
      this.createRocketTrailEffect(rocket);
      
      this.bullets.push(rocket);
    }
  }
  
  private createBulletProjectile(start: THREE.Vector3, end: THREE.Vector3): void {
    // Calculate direction and distance
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    
    // Create a bullet with high speed for a quick projectile effect
    const bullet = new Bullet(
      this.scene,
      start.clone(),
      direction,
      50, // High speed
      1,  // Short lifetime
      this.getCurrentWeapon().getDamage(),
      false
    );
    
    this.bullets.push(bullet);
  }
  
  private createImpactEffect(position: THREE.Vector3, normal: THREE.Vector3): void {
    // Create a simple impact effect (particle system could be added here)
    const geometry = new THREE.CircleGeometry(0.1, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const impact = new THREE.Mesh(geometry, material);
    impact.position.copy(position);
    
    // Orient to face normal
    impact.lookAt(position.clone().add(normal));
    
    this.scene.add(impact);
    
    // Remove after a short time
    setTimeout(() => {
      this.scene.remove(impact);
      geometry.dispose();
      material.dispose();
    }, 300);
  }
  
  private createRocketTrailEffect(rocket: Bullet): void {
    // Create a continuous trail effect that follows the rocket
    const trailInterval = setInterval(() => {
      // Check if the rocket still exists
      if (rocket.isExpired() || !this.bullets.includes(rocket)) {
        clearInterval(trailInterval);
        return;
      }
      
      // Get current rocket position
      const position = rocket.getPosition();
      
      // Create a small particle at the rocket's position
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.7
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      this.scene.add(particle);
      
      // Animate the particle
      const startTime = Date.now();
      const duration = 500; // ms
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          // Expand slightly
          const scale = 1 + progress * 2;
          particle.scale.set(scale, scale, scale);
          
          // Fade out
          if (material.opacity) {
            material.opacity = 0.7 * (1 - progress);
          }
          
          requestAnimationFrame(animate);
        } else {
          // Remove
          this.scene.remove(particle);
          geometry.dispose();
          material.dispose();
        }
      };
      
      animate();
    }, 50); // Create a new particle every 50ms
  }
  
  public reload(): void {
    if (this.weapons.length === 0) return;
    
    this.weapons[this.currentWeaponIndex].reload();
  }
  
  public switchWeapon(direction: number): void {
    if (this.weapons.length === 0) return;

    this.currentWeaponIndex = (this.currentWeaponIndex + direction + this.weapons.length) % this.weapons.length;
    console.log(`Switched to weapon: ${this.getCurrentWeapon().getName()}`);
    
    // Recreate the weapon model when switching weapons
    this.createWeaponModel();
  }
  
  public getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }
  
  public getCurrentAmmo(): number {
    if (this.weapons.length === 0) return 0;
    
    return this.weapons[this.currentWeaponIndex].getCurrentAmmo();
  }
  
  public getTotalAmmo(): number {
    if (this.weapons.length === 0) return 0;
    
    return this.weapons[this.currentWeaponIndex].getTotalAmmo();
  }
  
  public getActiveBullets(): Bullet[] {
    return this.bullets;
  }
  
  public reset(): void {
    // Reset all weapons
    this.weapons.forEach(weapon => weapon.reset());
    
    // Clear bullets
    this.bullets.forEach(bullet => bullet.destroy());
    this.bullets = [];
    
    // Reset to pistol
    this.currentWeaponIndex = 0;
  }
  
  private createWeaponModel(): void {
    // Remove any existing weapon model
    if (this.weaponModel) {
      this.scene.remove(this.weaponModel);
      if (this.camera) {
        this.camera.remove(this.weaponModel);
      }
      this.weaponModel = null;
    }
    
    // Create a new weapon model based on the current weapon
    this.weaponModel = new THREE.Group();
    
    // Add the appropriate weapon model based on the current weapon type
    let weaponMesh: THREE.Mesh;
    
    if (this.weapons[this.currentWeaponIndex] instanceof Pistol) {
      weaponMesh = this.createPistolModel();
    } else if (this.weapons[this.currentWeaponIndex] instanceof Shotgun) {
      weaponMesh = this.createShotgunModel();
    } else if (this.weapons[this.currentWeaponIndex] instanceof AssaultRifle) {
      weaponMesh = this.createAssaultRifleModel();
    } else if (this.weapons[this.currentWeaponIndex] instanceof RocketLauncher) {
      weaponMesh = this.createRocketLauncherModel();
    } else if (this.weapons[this.currentWeaponIndex] instanceof Minigun) {
      weaponMesh = this.createMinigunModel();
    } else {
      // Default to pistol if no match
      weaponMesh = this.createPistolModel();
    }
    
    this.weaponModel.add(weaponMesh);
    
    // Position the weapon model in the view
    this.weaponModel.position.set(0.3, -0.2, -0.5);
    
    // Add the weapon model to the camera so it moves with the player's view
    this.camera.add(this.weaponModel);
  }
  
  private createPistolModel(): THREE.Mesh {
    const group = new THREE.Group();
    
    // Barrel - adjusted to face forward
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    barrel.rotation.x = Math.PI / 2; // Rotate to face forward
    barrel.position.set(0, 0.02, -0.15);
    group.add(barrel);
    
    // Main body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    body.position.set(0, 0, 0);
    group.add(body);
    
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    handle.position.set(0, -0.08, 0.02);
    group.add(handle);
    
    return group as unknown as THREE.Mesh;
  }
  
  private createShotgunModel(): THREE.Mesh {
    const group = new THREE.Group();
    
    // Double barrel - adjusted to face forward
    const barrelLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    barrelLeft.rotation.x = Math.PI / 2; // Rotate to face forward
    barrelLeft.position.set(-0.03, 0, -0.2);
    group.add(barrelLeft);
    
    const barrelRight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    barrelRight.rotation.x = Math.PI / 2; // Rotate to face forward
    barrelRight.position.set(0.03, 0, -0.2);
    group.add(barrelRight);
    
    // Barrel connector
    const barrelConnector = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    barrelConnector.position.set(0, 0, -0.05);
    group.add(barrelConnector);
    
    // Wooden stock
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Brown color for wood
    );
    stock.position.set(0, 0, 0.1);
    group.add(stock);
    
    // Grip
    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    );
    grip.position.set(0, -0.08, 0.05);
    grip.rotation.x = Math.PI / 6; // Angle the grip slightly
    group.add(grip);
    
    // Trigger
    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.03, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    trigger.position.set(0, -0.02, 0.05);
    group.add(trigger);
    
    return group as unknown as THREE.Mesh;
  }
  
  private createAssaultRifleModel(): THREE.Mesh {
    const group = new THREE.Group();
    
    // Barrel - adjusted to face forward
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    barrel.rotation.set(Math.PI / 2, 0, 0); // Rotated to face forward
    barrel.position.set(0, 0, -0.2);
    group.add(barrel);
    
    // Body - adjusted position
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    body.position.set(0, -0.02, 0);
    group.add(body);
    
    // Magazine - adjusted position
    const magazine = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    magazine.position.set(0, -0.1, 0);
    group.add(magazine);
    
    // Stock - adjusted position
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    stock.position.set(0, 0, 0.15);
    group.add(stock);
    
    return group as unknown as THREE.Mesh;
  }
  
  private createRocketLauncherModel(): THREE.Mesh {
    const group = new THREE.Group();
    
    // Main tube - adjusted to face forward
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    tube.rotation.set(Math.PI / 2, 0, 0); // Rotated to face forward
    tube.position.set(0, 0, -0.2);
    group.add(tube);
    
    // Sight - adjusted position
    const sight = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.06, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    sight.position.set(0, 0.08, 0);
    group.add(sight);
    
    // Handle - adjusted position
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.1, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    handle.position.set(0, -0.1, 0.1);
    handle.rotation.set(Math.PI / 6, 0, 0);
    group.add(handle);
    
    return group as unknown as THREE.Mesh;
  }
  
  private createMinigunModel(): THREE.Mesh {
    const group = new THREE.Group();
    
    // Main barrel housing
    const barrelHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    barrelHousing.rotation.x = Math.PI / 2; // Rotate to face forward
    barrelHousing.position.set(0, 0, -0.2);
    group.add(barrelHousing);
    
    // Individual barrels
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      barrel.rotation.x = Math.PI / 2; // Rotate to face forward
      barrel.position.set(
        0.03 * Math.cos(angle),
        0.03 * Math.sin(angle),
        -0.2
      );
      group.add(barrel);
    }
    
    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    body.position.set(0, 0, 0);
    group.add(body);
    
    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    handle.position.set(0, -0.1, 0.05);
    handle.rotation.x = Math.PI / 6; // Angle the grip slightly
    group.add(handle);
    
    // Second grip (front)
    const frontGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.08, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    frontGrip.position.set(0, -0.08, -0.1);
    group.add(frontGrip);
    
    return group as unknown as THREE.Mesh;
  }
} 
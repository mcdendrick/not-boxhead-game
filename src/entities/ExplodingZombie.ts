import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Enemy } from './Enemy';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class ExplodingZombie extends Enemy {
  private explosionRadius: number = 5;
  private explosionDamage: number = 30;
  public isExploding: boolean = false;
  private explosionTimer: number | null = null;
  
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, position: THREE.Vector3) {
    super(scene, physicsWorld, position);
    
    // Override default values
    this.health = 40;
    this.maxHealth = 40;
    this.damage = 0; // No direct damage, only explosion
    this.speed = 2.0; // Faster than basic, slower than fast zombie
    this.scoreValue = 200;
  }
  
  protected createMesh(): THREE.Mesh {
    // Create a simple box mesh for the exploding zombie
    const geometry = new THREE.BoxGeometry(0.7, 1.7, 0.5);
    
    // Create materials for different sides - yellowish/orange color
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), // right
      new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), // left
      new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), // top
      new THREE.MeshStandardMaterial({ color: 0xFFAA00 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0xDD8800 }), // front - face
      new THREE.MeshStandardMaterial({ color: 0xFFAA00 })  // back
    ];
    
    // Create mesh with geometry and materials
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(this.position);
    mesh.position.y = 0.85; // Half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add arms
    this.addArms(mesh);
    
    return mesh;
  }
  
  private addArms(zombieMesh: THREE.Mesh): void {
    // Left arm
    const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.45, 0, 0);
    leftArm.castShadow = true;
    zombieMesh.add(leftArm);
    
    // Right arm
    const rightArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.45, 0, 0);
    rightArm.castShadow = true;
    zombieMesh.add(rightArm);
  }
  
  public update(deltaTime: number, playerPosition: THREE.Vector3): void {
    if (this.isDying || this.isDestroyed || this.isExploding) return;
    
    super.update(deltaTime, playerPosition);
    
    // Check distance to player
    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    
    // If close to player, start explosion sequence
    if (distanceToPlayer < 3 && !this.isExploding) {
      this.startExplosion();
    }
    
    // Pulse effect to indicate it's about to explode
    if (!this.isDying && !this.isDestroyed) {
      const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      this.mesh.scale.set(pulseScale, pulseScale, pulseScale);
    }
  }
  
  private startExplosion(): void {
    if (this.isExploding) return;
    
    this.isExploding = true;
    
    // Stop movement
    this.body.velocity.set(0, 0, 0);
    
    // Flash effect
    const flashInterval = setInterval(() => {
      if (this.isDying || this.isDestroyed) {
        clearInterval(flashInterval);
        return;
      }
      
      // Toggle color between orange and red
      const materials = this.mesh.material as THREE.MeshStandardMaterial[];
      if (Array.isArray(materials)) {
        const color = materials[0].color.getHex() === 0xFFAA00 ? 0xFF0000 : 0xFFAA00;
        materials.forEach(mat => mat.color.setHex(color));
      }
    }, 200);
    
    // Explode after delay
    this.explosionTimer = window.setTimeout(() => {
      clearInterval(flashInterval);
      this.explode();
    }, 2000);
  }
  
  private explode(): void {
    if (this.isDying || this.isDestroyed) return;
    
    // Create explosion effect
    const explosionGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const explosionMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF5500,
      transparent: true,
      opacity: 0.8
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(this.mesh.position);
    this.scene.add(explosion);
    
    // Animate explosion
    const startTime = Date.now();
    const duration = 500; // ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Expand
        const scale = 1 + progress * (this.explosionRadius * 2);
        explosion.scale.set(scale, scale, scale);
        
        // Fade out
        if (explosionMaterial.opacity) {
          explosionMaterial.opacity = 0.8 * (1 - progress);
        }
        
        requestAnimationFrame(animate);
      } else {
        // Remove
        this.scene.remove(explosion);
        explosionGeometry.dispose();
        explosionMaterial.dispose();
      }
    };
    
    animate();
    
    // Apply damage to nearby objects (would be handled by game logic)
    // This would typically be done by the game checking for objects within the explosion radius
    
    // Die after explosion
    this.die();
  }
  
  protected die(): void {
    // Clear explosion timer if it exists
    if (this.explosionTimer !== null) {
      clearTimeout(this.explosionTimer);
      this.explosionTimer = null;
    }
    
    super.die();
  }
  
  public getExplosionRadius(): number {
    return this.explosionRadius;
  }
  
  public getExplosionDamage(): number {
    return this.explosionDamage;
  }
} 
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Player } from './Player';

export abstract class Enemy {
  protected scene: THREE.Scene;
  protected physicsWorld: PhysicsWorld;
  protected position: THREE.Vector3;
  
  protected mesh: THREE.Mesh;
  protected body: CANNON.Body;
  
  protected health: number;
  protected maxHealth: number;
  protected damage: number;
  protected speed: number;
  protected scoreValue: number;
  
  protected isDying: boolean = false;
  protected isDestroyed: boolean = false;
  
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, position: THREE.Vector3) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.position = position.clone();
    
    // Default values to be overridden by subclasses
    this.health = 100;
    this.maxHealth = 100;
    this.damage = 10;
    this.speed = 2;
    this.scoreValue = 100;
    
    // Create mesh and physics body
    this.mesh = this.createMesh();
    this.body = this.createBody();
    
    // Store reference to this entity in the mesh's userData for area damage detection
    this.mesh.userData.entity = this;
    
    // Add to scene
    this.scene.add(this.mesh);
  }
  
  protected abstract createMesh(): THREE.Mesh;
  
  protected createBody(): CANNON.Body {
    // Create a physics body for the enemy
    const radius = 0.5; // Default radius
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
      shape: shape
    });
    
    // Add to physics world
    this.physicsWorld.getWorld().addBody(body);
    
    return body;
  }
  
  public update(deltaTime: number, playerPosition: THREE.Vector3): void {
    if (this.isDying || this.isDestroyed) return;
    
    // Update position from physics
    this.position.copy(this.body.position as unknown as THREE.Vector3);
    this.mesh.position.copy(this.position);
    
    // Move towards player
    this.moveTowardsPlayer(deltaTime, playerPosition);
    
    // Prevent zombies from jumping by forcing Y velocity to zero
    this.body.velocity.y = 0;
    
    // Make sure enemy stays upright
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 
      Math.atan2(this.body.velocity.z, this.body.velocity.x));
    this.mesh.quaternion.copy(this.body.quaternion as unknown as THREE.Quaternion);
  }
  
  protected moveTowardsPlayer(deltaTime: number, playerPosition: THREE.Vector3): void {
    // Calculate direction to player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, this.mesh.position)
      .normalize();
    
    // Apply force in that direction
    const force = direction.multiplyScalar(this.speed * 10 * deltaTime);
    this.body.applyForce(
      new CANNON.Vec3(force.x, 0, force.z),
      new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z)
    );
    
    // Limit velocity
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    if (speed > this.speed) {
      const factor = this.speed / speed;
      this.body.velocity.x *= factor;
      this.body.velocity.z *= factor;
    }
  }
  
  public takeDamage(amount: number): void {
    if (this.isDying || this.isDestroyed) return;
    
    this.health -= amount;
    
    // Check if dead
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }
  
  protected die(): void {
    if (this.isDying) return;
    
    this.isDying = true;
    
    // Play death animation
    this.playDeathAnimation();
  }
  
  protected playDeathAnimation(): void {
    // Simple death animation - scale down and fade out
    const duration = 1000; // 1 second
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale down
      const scale = 1 - progress;
      this.mesh.scale.set(scale, scale, scale);
      
      // Fade out (if material has opacity)
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.opacity = 1 - progress;
        this.mesh.material.transparent = true;
      } else if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(mat => {
          mat.opacity = 1 - progress;
          mat.transparent = true;
        });
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.destroy();
      }
    };
    
    animate();
  }
  
  public destroy(): void {
    if (this.isDestroyed) return;
    
    // Remove from scene
    this.scene.remove(this.mesh);
    
    // Remove from physics world
    this.physicsWorld.getWorld().removeBody(this.body);
    
    // Dispose of geometry and material
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    } else if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(mat => mat.dispose());
    }
    
    this.isDestroyed = true;
  }
  
  public isCollidingWith(player: Player): boolean {
    // Simple collision check based on distance
    const distance = this.mesh.position.distanceTo(player.getPosition());
    return distance < 1.5; // Collision radius
  }
  
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
  
  public getHealth(): number {
    return this.health;
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public getScoreValue(): number {
    return this.scoreValue;
  }
  
  public isDead(): boolean {
    return this.health <= 0;
  }
} 
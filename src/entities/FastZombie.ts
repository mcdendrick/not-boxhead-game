import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Enemy } from './Enemy';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class FastZombie extends Enemy {
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, position: THREE.Vector3) {
    super(scene, physicsWorld, position);
    
    // Override default values - faster but weaker
    this.health = 60;
    this.maxHealth = 60;
    this.damage = 3;
    this.speed = 3.0; // Faster than basic zombie
    this.scoreValue = 150;
  }
  
  protected createMesh(): THREE.Mesh {
    // Create a simple box mesh for the fast zombie - smaller and thinner
    const geometry = new THREE.BoxGeometry(0.6, 1.6, 0.4);
    
    // Create materials for different sides - reddish color
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xAA3333 }), // right
      new THREE.MeshStandardMaterial({ color: 0xAA3333 }), // left
      new THREE.MeshStandardMaterial({ color: 0xAA3333 }), // top
      new THREE.MeshStandardMaterial({ color: 0xAA3333 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x882222 }), // front - face
      new THREE.MeshStandardMaterial({ color: 0xAA3333 })  // back
    ];
    
    // Create mesh with geometry and materials
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(this.position);
    mesh.position.y = 0.8; // Half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add arms
    this.addArms(mesh);
    
    return mesh;
  }
  
  private addArms(zombieMesh: THREE.Mesh): void {
    // Left arm - thinner
    const leftArmGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0xAA3333 });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.4, 0, 0);
    leftArm.castShadow = true;
    zombieMesh.add(leftArm);
    
    // Right arm - thinner
    const rightArmGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0xAA3333 });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.4, 0, 0);
    rightArm.castShadow = true;
    zombieMesh.add(rightArm);
  }
  
  public update(deltaTime: number, playerPosition: THREE.Vector3): void {
    super.update(deltaTime, playerPosition);
    
    if (!this.isDying && !this.isDestroyed) {
      // Animate arms if moving - faster animation for fast zombie
      const velocity = this.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      
      if (speed > 0.5) {
        // Get arm meshes (assuming they are the first two children)
        const leftArm = this.mesh.children[0] as THREE.Mesh;
        const rightArm = this.mesh.children[1] as THREE.Mesh;
        
        if (leftArm && rightArm) {
          // Faster arm swinging animation
          const swingAmount = Math.sin(Date.now() * 0.02) * 0.7; // Faster and wider swing
          leftArm.rotation.x = swingAmount;
          rightArm.rotation.x = -swingAmount;
        }
      }
    }
  }
  
  protected moveTowardsPlayer(deltaTime: number, playerPosition: THREE.Vector3): void {
    // Fast zombies occasionally make quick lunges towards the player
    if (Math.random() < 0.01) { // 1% chance per frame to lunge
      // Calculate direction to player
      const direction = new THREE.Vector3()
        .subVectors(playerPosition, this.mesh.position)
        .normalize();
      
      // Apply a stronger impulse in that direction (only horizontal)
      const lungeForce = new THREE.Vector3(
        direction.x * this.speed * 50,
        0, // No vertical force
        direction.z * this.speed * 50
      );
      
      this.body.applyImpulse(
        new CANNON.Vec3(lungeForce.x, 0, lungeForce.z),
        new CANNON.Vec3(this.body.position.x, this.body.position.y, this.body.position.z)
      );
    } else {
      // Normal movement
      super.moveTowardsPlayer(deltaTime, playerPosition);
    }
  }
} 
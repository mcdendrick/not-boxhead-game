import * as THREE from 'three';
import { Enemy } from './Enemy';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class BasicZombie extends Enemy {
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, position: THREE.Vector3) {
    super(scene, physicsWorld, position);
    
    // Override default values
    this.health = 100;
    this.maxHealth = 100;
    this.damage = 10;
    this.speed = 2.0;
    this.scoreValue = 100;
  }
  
  protected createMesh(): THREE.Mesh {
    // Create a simple box mesh for the basic zombie
    const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    
    // Create materials for different sides
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x5D8233 }), // right
      new THREE.MeshStandardMaterial({ color: 0x5D8233 }), // left
      new THREE.MeshStandardMaterial({ color: 0x5D8233 }), // top
      new THREE.MeshStandardMaterial({ color: 0x5D8233 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x3A5311 }), // front - face
      new THREE.MeshStandardMaterial({ color: 0x5D8233 })  // back
    ];
    
    // Create mesh with geometry and materials
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(this.position);
    mesh.position.y = 0.9; // Half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add arms
    this.addArms(mesh);
    
    return mesh;
  }
  
  private addArms(zombieMesh: THREE.Mesh): void {
    // Left arm
    const leftArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0x5D8233 });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.5, 0, 0);
    leftArm.castShadow = true;
    zombieMesh.add(leftArm);
    
    // Right arm
    const rightArmGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0x5D8233 });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.5, 0, 0);
    rightArm.castShadow = true;
    zombieMesh.add(rightArm);
  }
  
  public update(deltaTime: number, playerPosition: THREE.Vector3): void {
    super.update(deltaTime, playerPosition);
    
    // Additional basic zombie behavior can be added here
    // For example, making arms swing while moving
    
    if (!this.isDying && !this.isDestroyed) {
      // Animate arms if moving
      const velocity = this.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      
      if (speed > 0.5) {
        // Get arm meshes (assuming they are the first two children)
        const leftArm = this.mesh.children[0] as THREE.Mesh;
        const rightArm = this.mesh.children[1] as THREE.Mesh;
        
        if (leftArm && rightArm) {
          // Simple arm swinging animation
          const swingAmount = Math.sin(Date.now() * 0.01) * 0.5;
          leftArm.rotation.x = swingAmount;
          rightArm.rotation.x = -swingAmount;
        }
      }
    }
  }
} 
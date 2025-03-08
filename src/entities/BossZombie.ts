import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Enemy } from './Enemy';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class BossZombie extends Enemy {
  private attackCooldown: number = 0;
  private readonly ATTACK_COOLDOWN_MAX: number = 3; // seconds
  private readonly ATTACK_RANGE: number = 15;
  
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, position: THREE.Vector3) {
    super(scene, physicsWorld, position);
    
    // Override default values - much stronger than regular zombies
    this.health = 500;
    this.maxHealth = 500;
    this.damage = 25;
    this.speed = 1.5; // Slower but more powerful
    this.scoreValue = 1000;
  }
  
  protected createMesh(): THREE.Mesh {
    // Create a larger box mesh for the boss zombie
    const geometry = new THREE.BoxGeometry(1.5, 3.0, 1.0);
    
    // Create materials for different sides - dark purple color
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x660066 }), // right
      new THREE.MeshStandardMaterial({ color: 0x660066 }), // left
      new THREE.MeshStandardMaterial({ color: 0x660066 }), // top
      new THREE.MeshStandardMaterial({ color: 0x660066 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x440044 }), // front - face
      new THREE.MeshStandardMaterial({ color: 0x660066 })  // back
    ];
    
    // Create mesh with geometry and materials
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.copy(this.position);
    mesh.position.y = 1.5; // Half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add arms and spikes
    this.addArms(mesh);
    this.addSpikes(mesh);
    
    return mesh;
  }
  
  private addArms(zombieMesh: THREE.Mesh): void {
    // Left arm - thicker
    const leftArmGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0x660066 });
    const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
    leftArm.position.set(-0.95, 0, 0);
    leftArm.castShadow = true;
    zombieMesh.add(leftArm);
    
    // Right arm - thicker
    const rightArmGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0x660066 });
    const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
    rightArm.position.set(0.95, 0, 0);
    rightArm.castShadow = true;
    zombieMesh.add(rightArm);
  }
  
  private addSpikes(zombieMesh: THREE.Mesh): void {
    // Add spikes on top
    const spikeGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
    const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x880088 });
    
    // Create multiple spikes on top
    const spikePositions = [
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0.5, 1.3, 0),
      new THREE.Vector3(-0.5, 1.3, 0),
      new THREE.Vector3(0, 1.3, 0.3),
      new THREE.Vector3(0, 1.3, -0.3)
    ];
    
    spikePositions.forEach(pos => {
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      spike.position.copy(pos);
      spike.castShadow = true;
      zombieMesh.add(spike);
    });
  }
  
  public update(deltaTime: number, playerPosition: THREE.Vector3): void {
    if (this.isDying || this.isDestroyed) return;
    
    super.update(deltaTime, playerPosition);
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
    
    // Check if can attack
    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);
    if (this.attackCooldown <= 0 && distanceToPlayer < this.ATTACK_RANGE) {
      this.performSpecialAttack(playerPosition);
      this.attackCooldown = this.ATTACK_COOLDOWN_MAX;
    }
    
    // Animate arms if moving
    if (!this.isDying && !this.isDestroyed) {
      const velocity = this.body.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      
      if (speed > 0.5) {
        // Get arm meshes (assuming they are the first two children)
        const leftArm = this.mesh.children[0] as THREE.Mesh;
        const rightArm = this.mesh.children[1] as THREE.Mesh;
        
        if (leftArm && rightArm) {
          // Slower arm swinging animation for boss
          const swingAmount = Math.sin(Date.now() * 0.005) * 0.3;
          leftArm.rotation.x = swingAmount;
          rightArm.rotation.x = -swingAmount;
        }
      }
    }
  }
  
  private performSpecialAttack(playerPosition: THREE.Vector3): void {
    // Ground pound effect without jumping
    this.createGroundPoundEffect();
    
    // Create a timer to trigger the shockwave after a delay
    setTimeout(() => {
      if (!this.isDying && !this.isDestroyed) {
        // Create shockwave effect
        this.createShockwaveEffect();
      }
    }, 1000); // 1 second delay
  }
  
  private createGroundPoundEffect(): void {
    // Create a warning circle on the ground
    const geometry = new THREE.CircleGeometry(5, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const circle = new THREE.Mesh(geometry, material);
    circle.rotation.x = -Math.PI / 2; // Lay flat on ground
    circle.position.set(this.mesh.position.x, 0.1, this.mesh.position.z);
    this.scene.add(circle);
    
    // Animate warning circle
    const startTime = Date.now();
    const duration = 1000; // ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1 && !this.isDying && !this.isDestroyed) {
        // Pulse effect
        const scale = 1 + Math.sin(progress * Math.PI * 5) * 0.2;
        circle.scale.set(scale, scale, scale);
        
        // Increase opacity
        if (material.opacity) {
          material.opacity = 0.3 + progress * 0.3;
        }
        
        requestAnimationFrame(animate);
      } else {
        // Remove
        this.scene.remove(circle);
        geometry.dispose();
        material.dispose();
      }
    };
    
    animate();
  }
  
  private createShockwaveEffect(): void {
    // Create expanding ring
    const geometry = new THREE.RingGeometry(0.5, 1, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF0000,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = -Math.PI / 2; // Lay flat on ground
    ring.position.set(this.mesh.position.x, 0.1, this.mesh.position.z);
    this.scene.add(ring);
    
    // Animate expanding ring
    const startTime = Date.now();
    const duration = 1000; // ms
    const maxRadius = 10;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Expand ring
        const scale = progress * maxRadius;
        ring.scale.set(scale, scale, scale);
        
        // Fade out
        if (material.opacity) {
          material.opacity = 0.7 * (1 - progress);
        }
        
        requestAnimationFrame(animate);
      } else {
        // Remove
        this.scene.remove(ring);
        geometry.dispose();
        material.dispose();
      }
    };
    
    animate();
  }
  
  protected die(): void {
    // Play special death animation for boss
    this.playBossDeathAnimation();
  }
  
  private playBossDeathAnimation(): void {
    if (this.isDying) return;
    
    this.isDying = true;
    
    // Create explosion particles
    for (let i = 0; i < 20; i++) {
      this.createExplosionParticle();
    }
    
    // Delayed final explosion
    setTimeout(() => {
      // Create final explosion
      const explosionGeometry = new THREE.SphereGeometry(1, 16, 16);
      const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF00FF,
        transparent: true,
        opacity: 0.8
      });
      
      const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
      explosion.position.copy(this.mesh.position);
      this.scene.add(explosion);
      
      // Animate explosion
      const startTime = Date.now();
      const duration = 1000; // ms
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          // Expand
          const scale = 1 + progress * 10;
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
          
          // Complete death
          this.destroy();
        }
      };
      
      animate();
      
      // Hide the mesh
      this.mesh.visible = false;
      
    }, 2000);
  }
  
  private createExplosionParticle(): void {
    // Create a simple particle
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF00FF,
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Random position around the boss
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2
    );
    
    particle.position.copy(this.mesh.position).add(offset);
    this.scene.add(particle);
    
    // Random velocity
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 5,
      Math.random() * 5,
      (Math.random() - 0.5) * 5
    );
    
    // Animate particle
    const startTime = Date.now();
    const duration = 1000 + Math.random() * 1000; // 1-2 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Move particle
        particle.position.add(velocity.clone().multiplyScalar(0.01));
        
        // Apply gravity
        velocity.y -= 0.1;
        
        // Fade out
        if (material.opacity) {
          material.opacity = 0.8 * (1 - progress);
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
  }
} 
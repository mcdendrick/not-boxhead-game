import * as THREE from 'three';

export class Bullet {
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private direction: THREE.Vector3;
  private speed: number;
  private lifetime: number;
  private damage: number;
  private isExplosive: boolean;
  private creationTime: number;
  private destroyed: boolean = false;
  
  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    lifetime: number,
    damage: number,
    isExplosive: boolean = false
  ) {
    this.scene = scene;
    this.position = position.clone();
    this.direction = direction.normalize();
    this.speed = speed;
    this.lifetime = lifetime;
    this.damage = damage;
    this.isExplosive = isExplosive;
    this.creationTime = Date.now();
    
    // Create mesh based on bullet type
    this.mesh = this.createMesh();
    
    // Add to scene
    this.scene.add(this.mesh);
  }
  
  private createMesh(): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    if (this.isExplosive) {
      // Rocket
      geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
      material = new THREE.MeshStandardMaterial({ color: 0x333333 });
      
      // Rotate to point in direction of travel
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(this.position);
      
      // Orient along direction
      const axis = new THREE.Vector3(0, 1, 0);
      mesh.quaternion.setFromUnitVectors(axis, this.direction);
      
      return mesh;
    } else {
      // Regular bullet
      geometry = new THREE.SphereGeometry(0.05, 8, 8);
      material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(this.position);
      return mesh;
    }
  }
  
  public update(deltaTime: number): void {
    if (this.destroyed) return;
    
    // Move bullet
    const moveAmount = this.speed * deltaTime;
    const movement = this.direction.clone().multiplyScalar(moveAmount);
    this.position.add(movement);
    this.mesh.position.copy(this.position);
    
    // Add trail effect for rockets
    if (this.isExplosive) {
      this.createTrailEffect();
    }
  }
  
  private createTrailEffect(): void {
    // Create a simple particle for the trail
    const geometry = new THREE.SphereGeometry(0.03, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Position slightly behind the rocket
    const trailPos = this.position.clone().sub(
      this.direction.clone().multiplyScalar(0.2)
    );
    particle.position.copy(trailPos);
    
    // Add to scene
    this.scene.add(particle);
    
    // Fade out and remove
    const startTime = Date.now();
    const duration = 300; // ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1 && !this.destroyed) {
        // Fade out
        if (material.opacity) {
          material.opacity = 0.8 * (1 - progress);
        }
        
        // Shrink
        const scale = 1 - progress;
        particle.scale.set(scale, scale, scale);
        
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
  
  public explode(): void {
    if (this.destroyed) return;
    
    if (this.isExplosive) {
      // Create explosion effect with multiple components
      this.createExplosionEffect();
      
      // Apply area damage
      this.applyAreaDamage();
    }
    
    // Destroy the bullet
    this.destroy();
  }
  
  private createExplosionEffect(): void {
    // 1. Core explosion sphere
    const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3300,
      transparent: true,
      opacity: 0.9
    });
    
    const coreExplosion = new THREE.Mesh(coreGeometry, coreMaterial);
    coreExplosion.position.copy(this.position);
    this.scene.add(coreExplosion);
    
    // 2. Outer explosion sphere
    const outerGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.7
    });
    
    const outerExplosion = new THREE.Mesh(outerGeometry, outerMaterial);
    outerExplosion.position.copy(this.position);
    this.scene.add(outerExplosion);
    
    // 3. Smoke sphere
    const smokeGeometry = new THREE.SphereGeometry(1.0, 16, 16);
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.5
    });
    
    const smokeExplosion = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smokeExplosion.position.copy(this.position);
    this.scene.add(smokeExplosion);
    
    // 4. Particle system for debris
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff8800,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within a small sphere
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      
      const pos = this.position.clone().add(offset);
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      
      // Random velocity outward
      const velocity = offset.normalize().multiplyScalar(Math.random() * 5 + 2);
      velocities.push(velocity);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
    
    // Animate all explosion components
    const startTime = Date.now();
    const duration = 1000; // ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Core explosion animation
        const coreScale = 1 + progress * 4;
        coreExplosion.scale.set(coreScale, coreScale, coreScale);
        if (coreMaterial.opacity) {
          coreMaterial.opacity = 0.9 * (1 - progress);
        }
        
        // Outer explosion animation
        const outerScale = 1 + progress * 6;
        outerExplosion.scale.set(outerScale, outerScale, outerScale);
        if (outerMaterial.opacity) {
          outerMaterial.opacity = 0.7 * (1 - progress);
        }
        
        // Smoke animation
        const smokeScale = 1 + progress * 8;
        smokeExplosion.scale.set(smokeScale, smokeScale, smokeScale);
        if (smokeMaterial.opacity) {
          smokeMaterial.opacity = 0.5 * (1 - Math.pow(progress, 0.5));
        }
        
        // Particle animation
        for (let i = 0; i < particleCount; i++) {
          const pos = new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
          );
          
          // Update position based on velocity
          pos.add(velocities[i].clone().multiplyScalar(0.016)); // Assuming 60fps
          
          // Apply gravity
          velocities[i].y -= 0.05;
          
          // Update buffer
          positions[i * 3] = pos.x;
          positions[i * 3 + 1] = pos.y;
          positions[i * 3 + 2] = pos.z;
        }
        
        // Update particle positions
        particleGeometry.attributes.position.needsUpdate = true;
        
        // Continue animation
        requestAnimationFrame(animate);
      } else {
        // Remove all explosion components
        this.scene.remove(coreExplosion);
        this.scene.remove(outerExplosion);
        this.scene.remove(smokeExplosion);
        this.scene.remove(particles);
        
        // Dispose geometries and materials
        coreGeometry.dispose();
        coreMaterial.dispose();
        outerGeometry.dispose();
        outerMaterial.dispose();
        smokeGeometry.dispose();
        smokeMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
      }
    };
    
    animate();
  }
  
  private applyAreaDamage(): void {
    // Get all enemies from the scene
    const enemies: any[] = [];
    this.scene.traverse((object) => {
      // Check if object is an enemy (has takeDamage method)
      if (object.userData && typeof object.userData.entity?.takeDamage === 'function') {
        enemies.push(object.userData.entity);
      }
    });
    
    // Define explosion radius and damage falloff
    const explosionRadius = 8;
    const maxDamage = this.damage;
    
    // Apply damage to enemies within radius
    for (const enemy of enemies) {
      if (typeof enemy.getPosition === 'function') {
        const enemyPosition = enemy.getPosition();
        const distance = this.position.distanceTo(enemyPosition);
        
        if (distance <= explosionRadius) {
          // Calculate damage based on distance (linear falloff)
          const damageMultiplier = 1 - (distance / explosionRadius);
          const damage = Math.floor(maxDamage * damageMultiplier);
          
          // Apply damage to enemy
          enemy.takeDamage(damage);
        }
      }
    }
  }
  
  public destroy(): void {
    if (this.destroyed) return;
    
    // Remove from scene
    this.scene.remove(this.mesh);
    
    // Dispose of geometry and material
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    } else if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(mat => mat.dispose());
    }
    
    this.destroyed = true;
  }
  
  public isExpired(): boolean {
    return this.destroyed || (Date.now() - this.creationTime) > (this.lifetime * 1000);
  }
  
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public isCollidingWith(object: { getPosition: () => THREE.Vector3 }): boolean {
    if (!object || !object.getPosition) return false;
    
    const objectPosition = object.getPosition();
    const distance = this.position.distanceTo(objectPosition);
    
    // Use a larger collision radius to make hitting enemies easier
    const collisionRadius = 1.0; // Increased from default
    
    return distance < collisionRadius;
  }
} 
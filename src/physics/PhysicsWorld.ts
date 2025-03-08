import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class PhysicsWorld {
  private world: CANNON.World;
  private bodies: CANNON.Body[] = [];
  private meshes: THREE.Mesh[] = [];
  
  constructor() {
    // Initialize Cannon.js world
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0); // Earth gravity
    this.world.broadphase = new CANNON.NaiveBroadphase();
    
    // Set solver iterations - using any type assertion to avoid TypeScript error
    // This is a valid property in Cannon.js but TypeScript definitions might be outdated
    (this.world.solver as any).iterations = 10;
    
    // Add ground
    this.addGround();
  }
  
  private addGround(): void {
    // Create a ground plane
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // Mass 0 makes it static
      shape: groundShape
    });
    
    // Rotate the ground plane to be horizontal
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, 0, 0);
    
    this.world.addBody(groundBody);
    this.bodies.push(groundBody);
  }
  
  public update(deltaTime: number): void {
    // Step the physics world
    this.world.step(deltaTime);
    
    // Update mesh positions based on physics bodies
    for (let i = 0; i < this.bodies.length; i++) {
      if (this.meshes[i]) {
        this.meshes[i].position.copy(this.bodies[i].position as unknown as THREE.Vector3);
        this.meshes[i].quaternion.copy(this.bodies[i].quaternion as unknown as THREE.Quaternion);
      }
    }
  }
  
  public addBox(size: THREE.Vector3, position: THREE.Vector3, mass: number = 1): { body: CANNON.Body, mesh: THREE.Mesh } {
    // Create Cannon.js body
    const boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const boxBody = new CANNON.Body({
      mass: mass,
      shape: boxShape
    });
    boxBody.position.set(position.x, position.y, position.z);
    
    // Create Three.js mesh
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.copy(position);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    
    // Add to world and arrays
    this.world.addBody(boxBody);
    this.bodies.push(boxBody);
    this.meshes.push(boxMesh);
    
    return { body: boxBody, mesh: boxMesh };
  }
  
  public addSphere(radius: number, position: THREE.Vector3, mass: number = 1): { body: CANNON.Body, mesh: THREE.Mesh } {
    // Create Cannon.js body
    const sphereShape = new CANNON.Sphere(radius);
    const sphereBody = new CANNON.Body({
      mass: mass,
      shape: sphereShape
    });
    sphereBody.position.set(position.x, position.y, position.z);
    
    // Create Three.js mesh
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.copy(position);
    sphereMesh.castShadow = true;
    sphereMesh.receiveShadow = true;
    
    // Add to world and arrays
    this.world.addBody(sphereBody);
    this.bodies.push(sphereBody);
    this.meshes.push(sphereMesh);
    
    return { body: sphereBody, mesh: sphereMesh };
  }
  
  public addCylinder(radius: number, height: number, position: THREE.Vector3, mass: number = 1): { body: CANNON.Body, mesh: THREE.Mesh } {
    // Create Cannon.js body
    const cylinderShape = new CANNON.Cylinder(radius, radius, height, 16);
    const cylinderBody = new CANNON.Body({
      mass: mass,
      shape: cylinderShape
    });
    cylinderBody.position.set(position.x, position.y, position.z);
    
    // Create Three.js mesh
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMesh.position.copy(position);
    cylinderMesh.castShadow = true;
    cylinderMesh.receiveShadow = true;
    
    // Add to world and arrays
    this.world.addBody(cylinderBody);
    this.bodies.push(cylinderBody);
    this.meshes.push(cylinderMesh);
    
    return { body: cylinderBody, mesh: cylinderMesh };
  }
  
  public removeBody(body: CANNON.Body): void {
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.world.removeBody(body);
      this.bodies.splice(index, 1);
      this.meshes.splice(index, 1);
    }
  }
  
  public getWorld(): CANNON.World {
    return this.world;
  }
  
  public checkCollision(body1: CANNON.Body, body2: CANNON.Body): boolean {
    // Simple collision check based on distance
    const distance = body1.position.distanceTo(body2.position);
    const radius1 = (body1.shapes[0] as CANNON.Sphere).radius || 0.5;
    const radius2 = (body2.shapes[0] as CANNON.Sphere).radius || 0.5;
    
    return distance < (radius1 + radius2);
  }
} 
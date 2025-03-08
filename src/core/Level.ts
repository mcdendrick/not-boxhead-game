import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Level {
  private scene: THREE.Scene;
  private physicsWorld: PhysicsWorld;
  
  private walls: THREE.Mesh[] = [];
  private obstacles: THREE.Mesh[] = [];
  private spawnPoints: THREE.Vector3[] = [];
  
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    
    // Create the level
    this.createFloor();
    this.createWalls();
    this.createObstacles();
    this.createSpawnPoints();
  }
  
  private createFloor(): void {
    // Create a large floor plane
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666, 
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }
  
  private createWalls(): void {
    // Create walls around the perimeter
    const wallHeight = 5;
    const wallThickness = 1;
    const arenaSize = 50;
    
    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.3
    });
    
    // North wall
    const northWallGeometry = new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -arenaSize / 2);
    northWall.receiveShadow = true;
    northWall.castShadow = true;
    this.scene.add(northWall);
    this.walls.push(northWall);
    
    // Add physics body for north wall
    this.physicsWorld.addBox(
      new THREE.Vector3(arenaSize, wallHeight, wallThickness),
      northWall.position,
      0 // Static body
    );
    
    // South wall
    const southWallGeometry = new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness);
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, arenaSize / 2);
    southWall.receiveShadow = true;
    southWall.castShadow = true;
    this.scene.add(southWall);
    this.walls.push(southWall);
    
    // Add physics body for south wall
    this.physicsWorld.addBox(
      new THREE.Vector3(arenaSize, wallHeight, wallThickness),
      southWall.position,
      0 // Static body
    );
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(arenaSize / 2, wallHeight / 2, 0);
    eastWall.receiveShadow = true;
    eastWall.castShadow = true;
    this.scene.add(eastWall);
    this.walls.push(eastWall);
    
    // Add physics body for east wall
    this.physicsWorld.addBox(
      new THREE.Vector3(wallThickness, wallHeight, arenaSize),
      eastWall.position,
      0 // Static body
    );
    
    // West wall
    const westWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize);
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
    westWall.position.set(-arenaSize / 2, wallHeight / 2, 0);
    westWall.receiveShadow = true;
    westWall.castShadow = true;
    this.scene.add(westWall);
    this.walls.push(westWall);
    
    // Add physics body for west wall
    this.physicsWorld.addBox(
      new THREE.Vector3(wallThickness, wallHeight, arenaSize),
      westWall.position,
      0 // Static body
    );
  }
  
  private createObstacles(): void {
    // Create some obstacles in the arena
    const obstacleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x994400,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Add some boxes as obstacles
    const boxPositions = [
      new THREE.Vector3(-10, 1, -10),
      new THREE.Vector3(10, 1, 10),
      new THREE.Vector3(-15, 1, 15),
      new THREE.Vector3(15, 1, -15),
      new THREE.Vector3(0, 1, -20),
      new THREE.Vector3(0, 1, 20),
      new THREE.Vector3(-20, 1, 0),
      new THREE.Vector3(20, 1, 0)
    ];
    
    boxPositions.forEach(position => {
      const boxSize = new THREE.Vector3(
        2 + Math.random() * 2,
        2 + Math.random() * 2,
        2 + Math.random() * 2
      );
      
      const boxGeometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
      const box = new THREE.Mesh(boxGeometry, obstacleMaterial);
      box.position.copy(position);
      box.castShadow = true;
      box.receiveShadow = true;
      this.scene.add(box);
      this.obstacles.push(box);
      
      // Add physics body for the box
      this.physicsWorld.addBox(boxSize, position, 0); // Static body
    });
    
    // Add some cylinders as obstacles
    const cylinderPositions = [
      new THREE.Vector3(-5, 1.5, -15),
      new THREE.Vector3(5, 1.5, 15),
      new THREE.Vector3(-15, 1.5, 5),
      new THREE.Vector3(15, 1.5, -5)
    ];
    
    cylinderPositions.forEach(position => {
      const radius = 1 + Math.random();
      const height = 3 + Math.random() * 2;
      
      const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 16);
      const cylinder = new THREE.Mesh(cylinderGeometry, obstacleMaterial);
      cylinder.position.copy(position);
      cylinder.castShadow = true;
      cylinder.receiveShadow = true;
      this.scene.add(cylinder);
      this.obstacles.push(cylinder);
      
      // Add physics body for the cylinder
      this.physicsWorld.addCylinder(radius, height, position, 0); // Static body
    });
  }
  
  private createSpawnPoints(): void {
    // Create spawn points around the perimeter
    const arenaSize = 45; // Slightly smaller than the walls
    const spawnDistance = arenaSize / 2;
    
    // Create spawn points in a circle around the perimeter
    const numSpawnPoints = 16;
    for (let i = 0; i < numSpawnPoints; i++) {
      const angle = (i / numSpawnPoints) * Math.PI * 2;
      const x = Math.cos(angle) * spawnDistance;
      const z = Math.sin(angle) * spawnDistance;
      
      this.spawnPoints.push(new THREE.Vector3(x, 0, z));
    }
  }
  
  public getSpawnPoints(): THREE.Vector3[] {
    return this.spawnPoints;
  }
  
  public getRandomSpawnPoint(): THREE.Vector3 {
    const index = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[index].clone();
  }
} 
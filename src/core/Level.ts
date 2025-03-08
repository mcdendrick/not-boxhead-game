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
    // Create walls around the perimeter with openings
    const wallHeight = 5;
    const wallThickness = 1;
    const arenaSize = 50;
    const gapSize = 10; // Size of the opening in each wall
    
    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 0.7,
      metalness: 0.3
    });
    
    // Create wall segments with gaps
    this.createWallSegments('north', wallMaterial, arenaSize, wallHeight, wallThickness, gapSize);
    this.createWallSegments('south', wallMaterial, arenaSize, wallHeight, wallThickness, gapSize);
    this.createWallSegments('east', wallMaterial, arenaSize, wallHeight, wallThickness, gapSize);
    this.createWallSegments('west', wallMaterial, arenaSize, wallHeight, wallThickness, gapSize);
  }
  
  private createWallSegments(side: string, material: THREE.Material, arenaSize: number, wallHeight: number, wallThickness: number, gapSize: number): void {
    const halfArenaSize = arenaSize / 2;
    const segmentSize = (arenaSize - gapSize) / 2;
    
    let wallGeometry: THREE.BoxGeometry;
    let wallSegment1: THREE.Mesh = new THREE.Mesh();
    let wallSegment2: THREE.Mesh = new THREE.Mesh();
    
    switch(side) {
      case 'north':
        // North wall segments (left and right of the gap)
        wallGeometry = new THREE.BoxGeometry(segmentSize, wallHeight, wallThickness);
        
        // Left segment
        wallSegment1 = new THREE.Mesh(wallGeometry, material);
        wallSegment1.position.set(-halfArenaSize + segmentSize/2, wallHeight/2, -halfArenaSize);
        
        // Right segment
        wallSegment2 = new THREE.Mesh(wallGeometry, material);
        wallSegment2.position.set(halfArenaSize - segmentSize/2, wallHeight/2, -halfArenaSize);
        
        break;
        
      case 'south':
        // South wall segments
        wallGeometry = new THREE.BoxGeometry(segmentSize, wallHeight, wallThickness);
        
        // Left segment
        wallSegment1 = new THREE.Mesh(wallGeometry, material);
        wallSegment1.position.set(-halfArenaSize + segmentSize/2, wallHeight/2, halfArenaSize);
        
        // Right segment
        wallSegment2 = new THREE.Mesh(wallGeometry, material);
        wallSegment2.position.set(halfArenaSize - segmentSize/2, wallHeight/2, halfArenaSize);
        
        break;
        
      case 'east':
        // East wall segments
        wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, segmentSize);
        
        // Front segment
        wallSegment1 = new THREE.Mesh(wallGeometry, material);
        wallSegment1.position.set(halfArenaSize, wallHeight/2, -halfArenaSize + segmentSize/2);
        
        // Back segment
        wallSegment2 = new THREE.Mesh(wallGeometry, material);
        wallSegment2.position.set(halfArenaSize, wallHeight/2, halfArenaSize - segmentSize/2);
        
        break;
        
      case 'west':
        // West wall segments
        wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, segmentSize);
        
        // Front segment
        wallSegment1 = new THREE.Mesh(wallGeometry, material);
        wallSegment1.position.set(-halfArenaSize, wallHeight/2, -halfArenaSize + segmentSize/2);
        
        // Back segment
        wallSegment2 = new THREE.Mesh(wallGeometry, material);
        wallSegment2.position.set(-halfArenaSize, wallHeight/2, halfArenaSize - segmentSize/2);
        
        break;
    }
    
    // Add wall segments to the scene
    wallSegment1.receiveShadow = true;
    wallSegment1.castShadow = true;
    this.scene.add(wallSegment1);
    this.walls.push(wallSegment1);
    
    wallSegment2.receiveShadow = true;
    wallSegment2.castShadow = true;
    this.scene.add(wallSegment2);
    this.walls.push(wallSegment2);
    
    // Add physics bodies for wall segments
    let size: THREE.Vector3;
    
    if (side === 'north' || side === 'south') {
      size = new THREE.Vector3(segmentSize, wallHeight, wallThickness);
    } else {
      size = new THREE.Vector3(wallThickness, wallHeight, segmentSize);
    }
    
    this.physicsWorld.addBox(size, wallSegment1.position, 0); // Static body
    this.physicsWorld.addBox(size, wallSegment2.position, 0); // Static body
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
    // Create spawn points around the perimeter, aligned with the wall openings
    const arenaSize = 45; // Slightly smaller than the walls
    const spawnDistance = arenaSize / 2 + 5; // Position outside the walls
    
    // Create spawn points in a circle around the perimeter
    const numSpawnPoints = 16;
    for (let i = 0; i < numSpawnPoints; i++) {
      const angle = (i / numSpawnPoints) * Math.PI * 2;
      const x = Math.cos(angle) * spawnDistance;
      const z = Math.sin(angle) * spawnDistance;
      
      this.spawnPoints.push(new THREE.Vector3(x, 0, z));
    }
    
    // Add specific spawn points at the wall openings
    const halfArenaSize = 50 / 2;
    
    // North opening
    this.spawnPoints.push(new THREE.Vector3(0, 0, -halfArenaSize - 2));
    
    // South opening
    this.spawnPoints.push(new THREE.Vector3(0, 0, halfArenaSize + 2));
    
    // East opening
    this.spawnPoints.push(new THREE.Vector3(halfArenaSize + 2, 0, 0));
    
    // West opening
    this.spawnPoints.push(new THREE.Vector3(-halfArenaSize - 2, 0, 0));
  }
  
  public getSpawnPoints(): THREE.Vector3[] {
    return this.spawnPoints;
  }
  
  public getRandomSpawnPoint(): THREE.Vector3 {
    const index = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[index].clone();
  }
} 
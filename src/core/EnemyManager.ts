import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { BasicZombie } from '../entities/BasicZombie';
import { FastZombie } from '../entities/FastZombie';
import { ExplodingZombie } from '../entities/ExplodingZombie';
import { BossZombie } from '../entities/BossZombie';

export class EnemyManager {
  private scene: THREE.Scene;
  private physicsWorld: PhysicsWorld;
  private player: Player;
  
  private enemies: Enemy[] = [];
  private spawnPoints: THREE.Vector3[] = [];
  
  private currentWave: number = 0;
  private enemiesRemaining: number = 0;
  private spawnInterval: number | null = null;
  private isSpawning: boolean = false;
  
  constructor(scene: THREE.Scene, physicsWorld: PhysicsWorld, player: Player) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.player = player;
    
    // Create spawn points in a circle around the arena
    this.createSpawnPoints();
  }
  
  private createSpawnPoints(): void {
    // Create spawn points in a circle
    const radius = 40;
    const numPoints = 16;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      this.spawnPoints.push(new THREE.Vector3(x, 0, z));
    }
  }
  
  public startWave(waveNumber: number): void {
    this.currentWave = waveNumber;
    this.isSpawning = true;
    
    // Calculate number of enemies based on wave number
    const baseEnemies = 5;
    const enemiesPerWave = 3;
    this.enemiesRemaining = baseEnemies + (waveNumber - 1) * enemiesPerWave;
    
    // Determine spawn rate based on wave number
    const baseSpawnDelay = 2000; // 2 seconds
    const minSpawnDelay = 500; // 0.5 seconds
    const spawnDelay = Math.max(minSpawnDelay, baseSpawnDelay - (waveNumber - 1) * 200);
    
    // Start spawning enemies
    this.spawnInterval = window.setInterval(() => {
      this.spawnEnemy();
      
      if (this.enemies.length >= this.enemiesRemaining) {
        this.stopSpawning();
      }
    }, spawnDelay);
  }
  
  private stopSpawning(): void {
    if (this.spawnInterval !== null) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.isSpawning = false;
  }
  
  private spawnEnemy(): void {
    if (this.enemies.length >= this.enemiesRemaining) {
      this.stopSpawning();
      return;
    }
    
    // Get random spawn point
    const spawnIndex = Math.floor(Math.random() * this.spawnPoints.length);
    const spawnPosition = this.spawnPoints[spawnIndex].clone();
    
    // Determine enemy type based on wave and randomness
    let enemy: Enemy;
    const enemyTypeRoll = Math.random();
    
    if (this.currentWave % 5 === 0 && this.enemies.length === 0) {
      // Boss wave - spawn a boss zombie first
      enemy = new BossZombie(this.scene, this.physicsWorld, spawnPosition);
    } else if (this.currentWave >= 3 && enemyTypeRoll < 0.1) {
      // 10% chance for exploding zombie after wave 3
      enemy = new ExplodingZombie(this.scene, this.physicsWorld, spawnPosition);
    } else if (this.currentWave >= 2 && enemyTypeRoll < 0.3) {
      // 20% chance for fast zombie after wave 2
      enemy = new FastZombie(this.scene, this.physicsWorld, spawnPosition);
    } else {
      // Default to basic zombie
      enemy = new BasicZombie(this.scene, this.physicsWorld, spawnPosition);
    }
    
    // Add enemy to the list
    this.enemies.push(enemy);
  }
  
  public update(deltaTime: number): void {
    // Update all enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Update enemy
      enemy.update(deltaTime, this.player.getPosition());
      
      // Remove dead enemies
      if (enemy.isDead()) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }
  }
  
  public isWaveComplete(): boolean {
    return !this.isSpawning && this.enemies.length === 0;
  }
  
  public getEnemies(): Enemy[] {
    return this.enemies;
  }
  
  public removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      enemy.destroy();
      this.enemies.splice(index, 1);
    }
  }
  
  public reset(): void {
    // Clear all enemies
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];
    
    // Reset wave state
    this.currentWave = 0;
    this.enemiesRemaining = 0;
    this.stopSpawning();
  }
} 
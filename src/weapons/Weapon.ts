import * as THREE from 'three';
import { AudioManager } from '../audio/AudioManager';

export abstract class Weapon {
  protected name: string;
  protected damage: number;
  protected range: number;
  protected fireRate: number; // Shots per second
  protected reloadTime: number; // Seconds
  protected magazineSize: number;
  protected currentAmmo: number;
  protected totalAmmo: number;
  protected isReloading: boolean = false;
  protected lastFireTime: number = 0;
  
  protected audioManager: AudioManager | null = null;
  protected model: THREE.Group | null = null;
  
  constructor(name: string, damage: number, range: number, fireRate: number, 
              reloadTime: number, magazineSize: number, totalAmmo: number) {
    this.name = name;
    this.damage = damage;
    this.range = range;
    this.fireRate = fireRate;
    this.reloadTime = reloadTime;
    this.magazineSize = magazineSize;
    this.currentAmmo = magazineSize;
    this.totalAmmo = totalAmmo;
  }
  
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  public shoot(): boolean {
    // Check if can shoot
    if (this.isReloading) return false;
    if (this.currentAmmo <= 0) {
      this.playEmptySound();
      return false;
    }
    
    // Check fire rate
    const now = Date.now();
    const timeSinceLastFire = now - this.lastFireTime;
    if (timeSinceLastFire < (1000 / this.fireRate)) {
      return false;
    }
    
    // Update ammo and last fire time
    this.currentAmmo--;
    this.lastFireTime = now;
    
    // Play sound
    this.playShootSound();
    
    // Auto-reload if empty
    if (this.currentAmmo <= 0 && this.totalAmmo > 0) {
      this.reload();
    }
    
    return true;
  }
  
  public reload(): boolean {
    if (this.isReloading || this.currentAmmo === this.magazineSize || this.totalAmmo <= 0) {
      return false;
    }
    
    this.isReloading = true;
    this.playReloadSound();
    
    // Reload after delay
    setTimeout(() => {
      const ammoNeeded = this.magazineSize - this.currentAmmo;
      const ammoToAdd = Math.min(ammoNeeded, this.totalAmmo);
      
      this.currentAmmo += ammoToAdd;
      this.totalAmmo -= ammoToAdd;
      
      this.isReloading = false;
    }, this.reloadTime * 1000);
    
    return true;
  }
  
  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }
  
  public getTotalAmmo(): number {
    return this.totalAmmo;
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public getRange(): number {
    return this.range;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public isCurrentlyReloading(): boolean {
    return this.isReloading;
  }
  
  public addAmmo(amount: number): void {
    this.totalAmmo += amount;
  }
  
  public reset(): void {
    this.currentAmmo = this.magazineSize;
    this.isReloading = false;
    this.lastFireTime = 0;
  }
  
  protected playShootSound(): void {
    if (this.audioManager) {
      this.audioManager.playSound(this.getShootSoundName());
    }
  }
  
  protected playReloadSound(): void {
    if (this.audioManager) {
      this.audioManager.playSound('reload');
    }
  }
  
  protected playEmptySound(): void {
    if (this.audioManager) {
      this.audioManager.playSound('empty');
    }
  }
  
  protected abstract getShootSoundName(): string;
} 
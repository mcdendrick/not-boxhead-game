import { Weapon } from './Weapon';

export class Minigun extends Weapon {
  private soundCooldown: number = 0;
  
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Minigun', 8, 60, 20, 4.0, 100, 500);
  }
  
  protected getShootSoundName(): string {
    return 'minigunShot';
  }

  // Override shoot method to better handle automatic fire sound
  public shoot(): boolean {
    const didShoot = super.shoot();
    
    // Reset sound cooldown when we successfully shoot
    if (didShoot) {
      this.soundCooldown = 0;
    }
    
    return didShoot;
  }
} 
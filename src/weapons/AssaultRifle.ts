import { Weapon } from './Weapon';

export class AssaultRifle extends Weapon {
  private soundCooldown: number = 0;
  
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Assault Rifle', 10, 70, 10, 2.0, 30, 240);
  }
  
  protected getShootSoundName(): string {
    return 'assaultRifleShot';
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
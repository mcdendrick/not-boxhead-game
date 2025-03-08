import { Weapon } from './Weapon';

export class Minigun extends Weapon {
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Minigun', 8, 60, 20, 4.0, 100, 500);
  }
  
  protected getShootSoundName(): string {
    return 'minigunShot';
  }
} 
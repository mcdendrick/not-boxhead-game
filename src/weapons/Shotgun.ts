import { Weapon } from './Weapon';

export class Shotgun extends Weapon {
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Shotgun', 15, 20, 1, 2.5, 8, 64);
  }
  
  protected getShootSoundName(): string {
    return 'shotgunShot';
  }
} 
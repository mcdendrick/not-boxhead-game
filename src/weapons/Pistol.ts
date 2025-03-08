import { Weapon } from './Weapon';

export class Pistol extends Weapon {
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Pistol', 20, 50, 2, 1.5, 12, 120);
  }
  
  protected getShootSoundName(): string {
    return 'pistolShot';
  }
} 
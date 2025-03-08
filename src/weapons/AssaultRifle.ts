import { Weapon } from './Weapon';

export class AssaultRifle extends Weapon {
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Assault Rifle', 10, 70, 10, 2.0, 30, 240);
  }
  
  protected getShootSoundName(): string {
    return 'rifleShot';
  }
} 
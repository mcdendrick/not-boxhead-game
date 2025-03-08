import { Weapon } from './Weapon';

export class RocketLauncher extends Weapon {
  constructor() {
    // name, damage, range, fireRate, reloadTime, magazineSize, totalAmmo
    super('Rocket Launcher', 150, 100, 0.5, 3.0, 2, 12);
  }
  
  protected getShootSoundName(): string {
    return 'rocketShot';
  }
} 
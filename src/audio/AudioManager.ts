import { Howl, Howler } from 'howler';

interface Sound {
  howl: Howl;
  volume: number;
}

export class AudioManager {
  private sounds: Map<string, Sound> = new Map();
  private music: Map<string, Sound> = new Map();
  private currentMusic: Howl | null = null;
  
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private isMuted: boolean = false;
  
  constructor() {
    this.initializeSounds();
    this.initializeMusic();
  }
  
  private initializeSounds(): void {
    // Weapon sounds
    this.registerSound('pistolShot', '/assets/audio/pistol_shot.mp3', 0.7);
    this.registerSound('shotgunShot', '/assets/audio/shotgun_shot.mp3', 0.8);
    this.registerSound('rifleShot', '/assets/audio/rifle_shot.mp3', 0.7);
    this.registerSound('rocketShot', '/assets/audio/rocket_shot.mp3', 0.8);
    this.registerSound('minigunShot', '/assets/audio/minigun_shot.mp3', 0.6);
    this.registerSound('reload', '/assets/audio/reload.mp3', 0.6);
    this.registerSound('empty', '/assets/audio/empty.mp3', 0.5);
    this.registerSound('weaponUnlock', '/assets/audio/weapon_unlock.mp3', 0.8);
    
    // Player sounds
    this.registerSound('playerHit', '/assets/audio/player_hit.mp3', 0.7);
    this.registerSound('playerDeath', '/assets/audio/player_death.mp3', 0.8);
    this.registerSound('playerJump', '/assets/audio/player_jump.mp3', 0.5);
    this.registerSound('playerLand', '/assets/audio/player_land.mp3', 0.5);
    this.registerSound('footstep', '/assets/audio/footstep.mp3', 0.4);
    
    // Enemy sounds
    this.registerSound('enemyHit', '/assets/audio/enemy_hit.mp3', 0.6);
    this.registerSound('enemyDeath', '/assets/audio/enemy_death.mp3', 0.7);
    this.registerSound('enemyAttack', '/assets/audio/enemy_attack.mp3', 0.7);
    this.registerSound('enemySpawn', '/assets/audio/enemy_spawn.mp3', 0.6);
    
    // Game sounds
    this.registerSound('gameOver', '/assets/audio/game_over.mp3', 0.8);
    this.registerSound('waveComplete', '/assets/audio/wave_complete.mp3', 0.8);
    this.registerSound('powerUp', '/assets/audio/power_up.mp3', 0.7);
    this.registerSound('explosion', '/assets/audio/explosion.mp3', 0.8);
  }
  
  private initializeMusic(): void {
    // Register music tracks
    this.registerMusic('menu', '/assets/audio/menu_music.mp3', 0.5);
    this.registerMusic('game', '/assets/audio/game_music.mp3', 0.5);
    this.registerMusic('boss', '/assets/audio/boss_music.mp3', 0.6);
    this.registerMusic('gameOver', '/assets/audio/game_over_music.mp3', 0.5);
  }
  
  private registerSound(id: string, url: string, volume: number): void {
    const sound = new Howl({
      src: [url],
      volume: volume * this.sfxVolume * this.masterVolume,
      preload: true
    });
    
    this.sounds.set(id, { howl: sound, volume });
  }
  
  private registerMusic(id: string, url: string, volume: number): void {
    const music = new Howl({
      src: [url],
      volume: volume * this.musicVolume * this.masterVolume,
      loop: true,
      preload: true
    });
    
    this.music.set(id, { howl: music, volume });
  }
  
  public playSound(id: string): void {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(id);
    if (sound) {
      sound.howl.play();
    } else {
      console.warn(`Sound with id "${id}" not found.`);
    }
  }
  
  public playMusic(id: string): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    const music = this.music.get(id);
    if (music) {
      music.howl.play();
      this.currentMusic = music.howl;
    } else {
      console.warn(`Music with id "${id}" not found.`);
    }
  }
  
  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
  
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }
  
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
  }
  
  private updateVolumes(): void {
    // Update sound volumes
    for (const [id, sound] of this.sounds.entries()) {
      sound.howl.volume(sound.volume * this.sfxVolume * this.masterVolume);
    }
    
    // Update music volumes
    for (const [id, music] of this.music.entries()) {
      music.howl.volume(music.volume * this.musicVolume * this.masterVolume);
    }
  }
} 
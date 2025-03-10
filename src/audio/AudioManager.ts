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
    console.log('AudioManager initialized');
    this.initializeSounds();
    this.initializeMusic();
    
    // Debug: Check if Howler is working
    console.log('Howler initialized:', Howler);
    console.log('Howler context:', Howler.ctx?.state);
    
    // Try to unlock audio context on user interaction
    this.setupAudioUnlock();
  }
  
  private setupAudioUnlock(): void {
    // Add a one-time event listener to unlock audio
    const unlockAudio = () => {
      console.log('Attempting to unlock audio...');
      
      // Play a silent sound to unlock audio
      const silentSound = new Howl({
        src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAJAQgAAgAAAAiRVU4AAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZB4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZDYP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZE4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'],
        volume: 0.001,
        onend: () => {
          console.log('Silent sound played, audio should be unlocked');
        },
        onloaderror: (id, error) => {
          console.error('Error loading silent sound:', error);
        }
      });
      
      silentSound.play();
      
      // Remove event listeners once audio is unlocked
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }
  
  private initializeSounds(): void {
    console.log('Initializing sounds...');
    
    // Weapon sounds - use only the files that actually exist
    this.registerSound('pistolShot', './src/assets/audio/pistol-shot.wav', 0.7);
    this.registerSound('rifleShot', './src/assets/audio/rifle-shots.wav', 0.7);
    this.registerSound('assaultRifleShot', './src/assets/audio/assault-rifle-shot.wav', 0.7);
    this.registerSound('reload', './src/assets/audio/reload.wav', 0.6);
    this.registerSound('rocketShot', './src/assets/audio/rocket-launch.wav', 0.8);
    this.registerSound('empty', './src/assets/audio/empty-gun.wav', 0.5); 
    
    // Player sounds
    this.registerSound('playerJump', './src/assets/audio/jump.wav', 0.3); 
    this.registerSound('playerLand', './src/assets/audio/landing-sound.wav', 0.1); 
    this.registerSound('footstep', './src/assets/audio/running.wav', 0.1);
    
    // Enemy sounds
    this.registerSound('enemyDeath', './src/assets/audio/zombie-death.wav', 0.7);
    this.registerSound('enemySpawn', './src/assets/audio/zombie-growl.wav', 0.6);

    // Stage sounds
    this.registerSound('waveComplete', './src/assets/audio/zombie-growl.wav', 0.8); 
    
    // Fallback sounds for missing files - use existing sounds as substitutes
    this.registerSound('shotgunShot', './src/assets/audio/pistol-shot.wav', 0.8); // Use pistol sound as fallback
    this.registerSound('minigunShot', './src/assets/audio/assault-rifle-shot.wav', 0.6); // Use assault rifle sound as fallback
    this.registerSound('weaponUnlock', './src/assets/audio/jump.wav', 0.8); // Use jump sound as fallback
    this.registerSound('playerDamage', './src/assets/audio/landing-sound.wav', 0.7); // Use landing sound as fallback
    this.registerSound('playerDeath', './src/assets/audio/zombie-death.wav', 0.8); // Use zombie death as fallback
    this.registerSound('enemyHit', './src/assets/audio/landing-sound.wav', 0.2); // Use landing sound as fallback
    this.registerSound('enemyAttack', './src/assets/audio/zombie-growl.wav', 0.7); // Use zombie growl as fallback
    this.registerSound('gameOver', './src/assets/audio/zombie-death.wav', 0.8); // Use zombie death as fallback
    this.registerSound('powerUp', './src/assets/audio/jump.wav', 0.7); // Use jump sound as fallback
    this.registerSound('explosion', './src/assets/audio/pistol-shot.wav', 0.8); // Use pistol sound as fallback
    
    console.log('Sounds initialized:', this.sounds.size, 'sounds registered');
  }
  
  private initializeMusic(): void {
    console.log('Initializing music...');
    
    // Since we don't have actual music files, use some of the longer sound effects as temporary music
    this.registerMusic('menu', './src/assets/audio/zombie-growl.wav', 0.5);
    //this.registerMusic('game', './src/assets/audio/zombie-growl.wav', 0.5); //TODO
    this.registerMusic('boss', './src/assets/audio/zombie-growl.wav', 0.6);
    this.registerMusic('gameOver', './src/assets/audio/zombie-death.wav', 0.5);
    
    console.log('Music initialized:', this.music.size, 'tracks registered');
  }
  
  private registerSound(id: string, url: string, volume: number): void {
    console.log(`Registering sound: ${id} with URL: ${url}`);
    
    const sound = new Howl({
      src: [url],
      volume: volume * this.sfxVolume * this.masterVolume,
      preload: true,
      onload: () => {
        console.log(`Sound loaded successfully: ${id}`);
      },
      onloaderror: (id, error) => {
        console.error(`Error loading sound ${id}:`, error);
      }
    });
    
    this.sounds.set(id, { howl: sound, volume });
  }
  
  private registerMusic(id: string, url: string, volume: number): void {
    console.log(`Registering music: ${id} with URL: ${url}`);
    
    const music = new Howl({
      src: [url],
      volume: volume * this.musicVolume * this.masterVolume,
      loop: true,
      preload: true,
      onload: () => {
        console.log(`Music loaded successfully: ${id}`);
      },
      onloaderror: (id, error) => {
        console.error(`Error loading music ${id}:`, error);
      }
    });
    
    this.music.set(id, { howl: music, volume });
  }
  
  public playSound(id: string): void {
    if (this.isMuted) {
      console.log(`Sound ${id} not played because audio is muted`);
      return;
    }
    
    const sound = this.sounds.get(id);
    if (sound) {
      console.log(`Playing sound: ${id}`);
      
      // Special handling for certain sounds to prevent issues
      if (id === 'empty') {
        // For empty gun sound, stop any previous instances before playing
        sound.howl.stop();
      } else if (id === 'footstep') {
        // For footstep sounds, stop any previous instances to prevent overlap
        sound.howl.stop();
        
        // Set a shorter duration for footstep sounds
        const soundId = sound.howl.play();
        if (soundId) {
          setTimeout(() => {
            if (sound.howl.playing(soundId)) {
              sound.howl.stop(soundId);
            }
          }, 300); // Stop after 300ms
          return;
        }
      }
      
      sound.howl.play();
    } else {
      console.warn(`Sound with id "${id}" not found.`);
    }
  }
  
  public playMusic(id: string): void {
    console.log(`Attempting to play music: ${id}`);
    
    if (this.currentMusic) {
      console.log('Stopping current music');
      this.currentMusic.stop();
    }
    
    const music = this.music.get(id);
    if (music) {
      console.log(`Playing music: ${id}`);
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
  
  public pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }
  
  public resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play();
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
  
  public getSound(id: string): Howl | null {
    const sound = this.sounds.get(id);
    return sound ? sound.howl : null;
  }
  
  public playSoundInstance(id: string): void {
    if (this.isMuted) {
      console.log(`Sound ${id} not played because audio is muted`);
      return;
    }
    
    const sound = this.sounds.get(id);
    if (sound) {
      console.log(`Playing sound instance: ${id}`);
      // Play the sound
      sound.howl.play();
      
      // Limit the number of concurrent instances of the same sound
      // This prevents memory issues while still allowing enough overlap
      this.limitConcurrentInstances(id, 5); // Allow up to 5 instances
    } else {
      console.warn(`Sound with id "${id}" not found.`);
    }
  }
  
  private limitConcurrentInstances(id: string, maxInstances: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      // For footstep sounds, be more strict to prevent overwhelming repetition
      const actualMaxInstances = id === 'footstep' ? 1 : maxInstances;
      
      // Get all currently playing instances
      const playingIds = sound.howl.playing();
      
      // Check if we have multiple playing instances (playing() returns an array of IDs when multiple sounds are playing)
      if (Array.isArray(playingIds) && playingIds.length > actualMaxInstances) {
        // If there are too many instances, stop all but the newest one
        // Sort IDs by creation time (lower ID = older)
        playingIds.sort((a, b) => a - b);
        
        // For footstep sounds, stop ALL previous instances to ensure clean playback
        if (id === 'footstep') {
          for (let i = 0; i < playingIds.length - 1; i++) {
            sound.howl.stop(playingIds[i]);
          }
        } else {
          // For other sounds, keep the newest maxInstances
          for (let i = 0; i < playingIds.length - actualMaxInstances; i++) {
            sound.howl.stop(playingIds[i]);
          }
        }
      }
    }
  }
} 
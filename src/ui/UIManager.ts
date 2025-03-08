export class UIManager {
  private healthBar: HTMLElement | null;
  private healthFill: HTMLElement | null;
  private ammoCounter: HTMLElement | null;
  private waveCounter: HTMLElement | null;
  private scoreDisplay: HTMLElement | null;
  private weaponName: HTMLElement | null;
  
  constructor() {
    // Get UI elements
    this.healthBar = document.getElementById('health-bar');
    this.healthFill = document.querySelector('.health-fill') as HTMLElement;
    this.ammoCounter = document.getElementById('ammo-counter');
    this.waveCounter = document.getElementById('wave-counter');
    this.scoreDisplay = document.getElementById('score-display');
    this.weaponName = document.getElementById('weapon-name');
  }
  
  public updateHealth(health: number): void {
    if (this.healthFill) {
      // Update health bar width
      const healthPercent = Math.max(0, Math.min(100, health));
      this.healthFill.style.width = `${healthPercent}%`;
      
      // Change color based on health
      if (healthPercent < 25) {
        this.healthFill.style.backgroundColor = 'var(--health-low-color)';
      } else {
        this.healthFill.style.backgroundColor = 'var(--health-color)';
      }
    }
  }
  
  public updateAmmo(currentAmmo: number, totalAmmo: number): void {
    if (this.ammoCounter) {
      this.ammoCounter.textContent = `${currentAmmo} / ${totalAmmo}`;
    }
  }
  
  public updateWave(wave: number): void {
    if (this.waveCounter) {
      this.waveCounter.textContent = `Wave: ${wave}`;
    }
  }
  
  public updateScore(score: number): void {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score: ${score}`;
    }
  }
  
  public updateWeaponName(name: string): void {
    if (this.weaponName) {
      this.weaponName.textContent = name;
    }
  }
  
  public showMessage(message: string, duration: number = 3000): void {
    // Create a temporary message element
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    
    // Add to the game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.appendChild(messageElement);
      
      // Add styles
      messageElement.style.position = 'absolute';
      messageElement.style.top = '50%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translate(-50%, -50%)';
      messageElement.style.color = 'var(--text-color)';
      messageElement.style.fontSize = '2rem';
      messageElement.style.fontWeight = 'bold';
      messageElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
      messageElement.style.textAlign = 'center';
      messageElement.style.zIndex = '20';
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.3s ease';
      
      // Animate in
      setTimeout(() => {
        messageElement.style.opacity = '1';
      }, 10);
      
      // Remove after duration
      setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
          if (gameUI.contains(messageElement)) {
            gameUI.removeChild(messageElement);
          }
        }, 300);
      }, duration);
    }
  }
  
  public showDamageIndicator(direction: string): void {
    // Create a damage indicator element
    const indicator = document.createElement('div');
    indicator.className = 'damage-indicator';
    
    // Add to the game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.appendChild(indicator);
      
      // Position based on direction
      indicator.style.position = 'absolute';
      indicator.style.width = '100px';
      indicator.style.height = '100px';
      indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
      indicator.style.zIndex = '15';
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.3s ease';
      
      switch (direction) {
        case 'front':
          indicator.style.top = '0';
          indicator.style.left = '50%';
          indicator.style.transform = 'translateX(-50%)';
          break;
        case 'back':
          indicator.style.bottom = '0';
          indicator.style.left = '50%';
          indicator.style.transform = 'translateX(-50%)';
          break;
        case 'left':
          indicator.style.top = '50%';
          indicator.style.left = '0';
          indicator.style.transform = 'translateY(-50%)';
          break;
        case 'right':
          indicator.style.top = '50%';
          indicator.style.right = '0';
          indicator.style.transform = 'translateY(-50%)';
          break;
      }
      
      // Animate in and out
      setTimeout(() => {
        indicator.style.opacity = '1';
        
        setTimeout(() => {
          indicator.style.opacity = '0';
          setTimeout(() => {
            if (gameUI.contains(indicator)) {
              gameUI.removeChild(indicator);
            }
          }, 300);
        }, 500);
      }, 10);
    }
  }
} 
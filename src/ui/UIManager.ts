export class UIManager {
  private healthBar: HTMLElement | null;
  private healthFill: HTMLElement | null;
  private ammoCounter: HTMLElement | null;
  private waveCounter: HTMLElement | null;
  private scoreDisplay: HTMLElement | null;
  private weaponName: HTMLElement | null;
  private invulnerabilityIndicator: HTMLElement | null = null;
  private pauseMenu: HTMLElement | null = null;
  
  constructor() {
    // Get UI elements
    this.healthBar = document.getElementById('health-bar');
    this.healthFill = document.querySelector('.health-fill') as HTMLElement;
    this.ammoCounter = document.getElementById('ammo-counter');
    this.waveCounter = document.getElementById('wave-counter');
    this.scoreDisplay = document.getElementById('score-display');
    this.weaponName = document.getElementById('weapon-name');
    
    // Create invulnerability indicator
    this.createInvulnerabilityIndicator();
    
    // Create pause menu
    this.createPauseMenu();
    
    // Add keyboard shortcut hints
    this.addKeyboardShortcutHints();
  }
  
  private createInvulnerabilityIndicator(): void {
    // Create the invulnerability indicator element
    this.invulnerabilityIndicator = document.createElement('div');
    this.invulnerabilityIndicator.className = 'invulnerability-indicator';
    
    // Style the indicator
    this.invulnerabilityIndicator.style.position = 'absolute';
    this.invulnerabilityIndicator.style.top = '0';
    this.invulnerabilityIndicator.style.left = '0';
    this.invulnerabilityIndicator.style.width = '100%';
    this.invulnerabilityIndicator.style.height = '100%';
    this.invulnerabilityIndicator.style.border = '5px solid rgba(255, 255, 255, 0.5)';
    this.invulnerabilityIndicator.style.boxSizing = 'border-box';
    this.invulnerabilityIndicator.style.pointerEvents = 'none';
    this.invulnerabilityIndicator.style.zIndex = '10';
    this.invulnerabilityIndicator.style.display = 'none';
    
    // Add to the game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.appendChild(this.invulnerabilityIndicator);
    }
  }
  
  private createPauseMenu(): void {
    // Create overlay for the entire screen
    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '90';
    overlay.style.display = 'none';
    
    // Create the pause menu element
    this.pauseMenu = document.createElement('div');
    this.pauseMenu.className = 'pause-menu';
    
    // Style the pause menu
    this.pauseMenu.style.position = 'absolute';
    this.pauseMenu.style.top = '50%';
    this.pauseMenu.style.left = '50%';
    this.pauseMenu.style.transform = 'translate(-50%, -50%)';
    this.pauseMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.pauseMenu.style.color = 'white';
    this.pauseMenu.style.padding = '20px';
    this.pauseMenu.style.borderRadius = '10px';
    this.pauseMenu.style.textAlign = 'center';
    this.pauseMenu.style.zIndex = '100';
    this.pauseMenu.style.display = 'none';
    this.pauseMenu.style.minWidth = '300px';
    this.pauseMenu.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    this.pauseMenu.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    
    // Add pause menu title
    const title = document.createElement('h2');
    title.textContent = 'GAME PAUSED';
    title.style.marginBottom = '20px';
    title.style.fontSize = '24px';
    title.style.textTransform = 'uppercase';
    title.style.letterSpacing = '2px';
    title.style.color = '#4CAF50';
    this.pauseMenu.appendChild(title);
    
    // Add resume button
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'Resume Game';
    resumeButton.style.padding = '10px 20px';
    resumeButton.style.margin = '10px';
    resumeButton.style.backgroundColor = '#4CAF50';
    resumeButton.style.border = 'none';
    resumeButton.style.color = 'white';
    resumeButton.style.borderRadius = '5px';
    resumeButton.style.cursor = 'pointer';
    resumeButton.style.fontSize = '16px';
    resumeButton.style.transition = 'background-color 0.3s';
    resumeButton.onmouseover = () => {
      resumeButton.style.backgroundColor = '#45a049';
    };
    resumeButton.onmouseout = () => {
      resumeButton.style.backgroundColor = '#4CAF50';
    };
    resumeButton.onclick = () => {
      // Find the game instance and resume
      const gameInstance = (window as any).gameInstance;
      if (gameInstance && typeof gameInstance.togglePause === 'function') {
        gameInstance.togglePause();
      }
    };
    this.pauseMenu.appendChild(resumeButton);
    
    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Press "P" to resume';
    instructions.style.marginTop = '20px';
    instructions.style.fontSize = '14px';
    instructions.style.opacity = '0.7';
    this.pauseMenu.appendChild(instructions);
    
    // Add to the game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.appendChild(overlay);
      gameUI.appendChild(this.pauseMenu);
      
      // Store reference to overlay for showing/hiding
      (this.pauseMenu as any).overlay = overlay;
    } else {
      document.body.appendChild(overlay);
      document.body.appendChild(this.pauseMenu);
      
      // Store reference to overlay for showing/hiding
      (this.pauseMenu as any).overlay = overlay;
    }
  }
  
  private addKeyboardShortcutHints(): void {
    const gameUI = document.getElementById('game-ui');
    if (!gameUI) return;
    
    // Create hints container
    const hintsContainer = document.createElement('div');
    hintsContainer.className = 'keyboard-hints';
    hintsContainer.style.position = 'absolute';
    hintsContainer.style.bottom = '10px';
    hintsContainer.style.right = '10px';
    hintsContainer.style.color = 'rgba(255, 255, 255, 0.7)';
    hintsContainer.style.fontSize = '12px';
    hintsContainer.style.textAlign = 'right';
    hintsContainer.style.fontFamily = 'monospace';
    
    // Add pause hint
    const pauseHint = document.createElement('div');
    pauseHint.textContent = 'Press [P] to Pause';
    pauseHint.style.marginBottom = '5px';
    hintsContainer.appendChild(pauseHint);
    
    // Add other hints
    const reloadHint = document.createElement('div');
    reloadHint.textContent = 'Press [R] to Reload';
    reloadHint.style.marginBottom = '5px';
    hintsContainer.appendChild(reloadHint);
    
    const weaponHint = document.createElement('div');
    weaponHint.textContent = 'Press [1-5] to Switch Weapons';
    hintsContainer.appendChild(weaponHint);
    
    // Add to game UI
    gameUI.appendChild(hintsContainer);
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
  
  public showInvulnerabilityIndicator(show: boolean): void {
    if (this.invulnerabilityIndicator) {
      this.invulnerabilityIndicator.style.display = show ? 'block' : 'none';
      
      if (show) {
        // Add pulsing animation
        this.invulnerabilityIndicator.style.animation = 'pulse 0.5s infinite alternate';
        
        // Add the keyframes if they don't exist
        if (!document.querySelector('#invulnerability-keyframes')) {
          const style = document.createElement('style');
          style.id = 'invulnerability-keyframes';
          style.textContent = `
            @keyframes pulse {
              from { border-color: rgba(255, 255, 255, 0.3); }
              to { border-color: rgba(255, 255, 255, 0.7); }
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        // Remove animation
        this.invulnerabilityIndicator.style.animation = '';
      }
    }
  }
  
  public showPauseMenu(show: boolean): void {
    if (this.pauseMenu) {
      this.pauseMenu.style.display = show ? 'block' : 'none';
      
      // Also show/hide the overlay
      const overlay = (this.pauseMenu as any).overlay;
      if (overlay) {
        overlay.style.display = show ? 'block' : 'none';
      }
    }
  }
} 
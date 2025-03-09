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
    
    // Create or update UI elements if they don't exist
    this.createOrUpdateUIElements();
    
    // Create invulnerability indicator
    this.createInvulnerabilityIndicator();
    
    // Create pause menu
    this.createPauseMenu();
    
    // Add keyboard shortcut hints
    this.addKeyboardShortcutHints();
  }
  
  private createOrUpdateUIElements(): void {
    const gameUI = document.getElementById('game-ui');
    if (!gameUI) return;
    
    // Create weapon info container if it doesn't exist
    if (!this.weaponName || !this.ammoCounter) {
      // Remove old elements if they exist
      if (this.weaponName) this.weaponName.remove();
      if (this.ammoCounter) this.ammoCounter.remove();
      
      // Create weapon info container
      const weaponInfoContainer = document.createElement('div');
      weaponInfoContainer.className = 'weapon-info';
      weaponInfoContainer.style.position = 'absolute';
      weaponInfoContainer.style.bottom = '20px';
      weaponInfoContainer.style.right = '20px';
      weaponInfoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      weaponInfoContainer.style.padding = '10px 15px';
      weaponInfoContainer.style.borderRadius = '5px';
      weaponInfoContainer.style.color = 'white';
      weaponInfoContainer.style.fontFamily = 'monospace';
      weaponInfoContainer.style.zIndex = '10';
      weaponInfoContainer.style.display = 'flex';
      weaponInfoContainer.style.flexDirection = 'column';
      weaponInfoContainer.style.alignItems = 'flex-end';
      
      // Create weapon name element
      this.weaponName = document.createElement('div');
      this.weaponName.id = 'weapon-name';
      this.weaponName.style.fontSize = '18px';
      this.weaponName.style.fontWeight = 'bold';
      this.weaponName.style.marginBottom = '5px';
      this.weaponName.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
      weaponInfoContainer.appendChild(this.weaponName);
      
      // Create ammo counter element
      this.ammoCounter = document.createElement('div');
      this.ammoCounter.id = 'ammo-counter';
      this.ammoCounter.style.fontSize = '16px';
      this.ammoCounter.style.fontWeight = 'bold';
      weaponInfoContainer.appendChild(this.ammoCounter);
      
      // Add to game UI
      gameUI.appendChild(weaponInfoContainer);
    }
    
    // Create health bar if it doesn't exist
    if (!this.healthBar || !this.healthFill) {
      // Remove old elements if they exist
      if (this.healthBar) this.healthBar.remove();
      
      // Create health bar container
      const healthBarContainer = document.createElement('div');
      healthBarContainer.className = 'health-bar-container';
      healthBarContainer.style.position = 'absolute';
      healthBarContainer.style.top = '20px';
      healthBarContainer.style.left = '20px';
      healthBarContainer.style.zIndex = '10';
      
      // Create health bar
      this.healthBar = document.createElement('div');
      this.healthBar.id = 'health-bar';
      this.healthBar.style.width = '200px';
      this.healthBar.style.height = '20px';
      this.healthBar.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      this.healthBar.style.borderRadius = '5px';
      this.healthBar.style.overflow = 'hidden';
      this.healthBar.style.border = '2px solid rgba(255, 255, 255, 0.3)';
      
      // Create health fill
      this.healthFill = document.createElement('div');
      this.healthFill.className = 'health-fill';
      this.healthFill.style.width = '100%';
      this.healthFill.style.height = '100%';
      this.healthFill.style.backgroundColor = 'var(--health-color, #4CAF50)';
      this.healthFill.style.transition = 'width 0.3s ease, background-color 0.3s ease';
      
      // Add health text
      const healthText = document.createElement('div');
      healthText.className = 'health-text';
      healthText.style.position = 'absolute';
      healthText.style.top = '0';
      healthText.style.left = '0';
      healthText.style.width = '100%';
      healthText.style.height = '100%';
      healthText.style.display = 'flex';
      healthText.style.alignItems = 'center';
      healthText.style.justifyContent = 'center';
      healthText.style.color = 'white';
      healthText.style.fontFamily = 'monospace';
      healthText.style.fontSize = '12px';
      healthText.style.fontWeight = 'bold';
      healthText.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
      healthText.textContent = '100 HP';
      
      // Assemble health bar
      this.healthBar.appendChild(this.healthFill);
      this.healthBar.appendChild(healthText);
      healthBarContainer.appendChild(this.healthBar);
      
      // Add to game UI
      gameUI.appendChild(healthBarContainer);
    }
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
    hintsContainer.style.bottom = '20px';
    hintsContainer.style.left = '50%';
    hintsContainer.style.transform = 'translateX(-50%)';
    hintsContainer.style.display = 'flex';
    hintsContainer.style.gap = '15px';
    hintsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    hintsContainer.style.padding = '8px 15px';
    hintsContainer.style.borderRadius = '5px';
    hintsContainer.style.color = 'rgba(255, 255, 255, 0.9)';
    hintsContainer.style.fontSize = '14px';
    hintsContainer.style.fontFamily = 'monospace';
    hintsContainer.style.zIndex = '10';
    hintsContainer.style.transition = 'opacity 0.5s ease-out';
    
    // Create hint items with better styling
    const createHint = (key: string, action: string) => {
      const hintItem = document.createElement('div');
      hintItem.style.display = 'flex';
      hintItem.style.alignItems = 'center';
      
      const keyElement = document.createElement('span');
      keyElement.textContent = key;
      keyElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      keyElement.style.padding = '3px 6px';
      keyElement.style.borderRadius = '3px';
      keyElement.style.marginRight = '5px';
      keyElement.style.fontWeight = 'bold';
      
      const actionElement = document.createElement('span');
      actionElement.textContent = action;
      
      hintItem.appendChild(keyElement);
      hintItem.appendChild(actionElement);
      
      return hintItem;
    };
    
    // Add hints with better styling
    hintsContainer.appendChild(createHint('R', 'Reload'));
    hintsContainer.appendChild(createHint('P', 'Pause'));
    hintsContainer.appendChild(createHint('1-5', 'Switch Weapons'));
    
    // Add to game UI
    gameUI.appendChild(hintsContainer);
    
    // Store the hints container for later use
    (this as any).hintsContainer = hintsContainer;
    
    // Make the hints fade out after a few seconds
    setTimeout(() => {
      hintsContainer.style.opacity = '0';
      
      // After fade out, set display to none
      setTimeout(() => {
        hintsContainer.style.display = 'none';
      }, 500);
    }, 5000); // Hide after 5 seconds
  }
  
  public updateHealth(health: number): void {
    if (this.healthFill && this.healthBar) {
      // Update health bar width
      const healthPercent = Math.max(0, Math.min(100, health));
      this.healthFill.style.width = `${healthPercent}%`;
      
      // Change color based on health
      if (healthPercent < 25) {
        this.healthFill.style.backgroundColor = 'var(--health-low-color, #f44336)'; // Red
        
        // Add pulsing effect for very low health
        if (healthPercent < 15) {
          this.healthFill.style.animation = 'pulse-health 1s infinite alternate';
          
          // Add the keyframes if they don't exist
          if (!document.querySelector('#health-pulse-keyframes')) {
            const style = document.createElement('style');
            style.id = 'health-pulse-keyframes';
            style.textContent = `
              @keyframes pulse-health {
                from { background-color: #f44336; }
                to { background-color: #ff7043; }
              }
            `;
            document.head.appendChild(style);
          }
        } else {
          this.healthFill.style.animation = '';
        }
      } else if (healthPercent < 50) {
        this.healthFill.style.backgroundColor = 'var(--health-medium-color, #ff9800)'; // Orange
        this.healthFill.style.animation = '';
      } else {
        this.healthFill.style.backgroundColor = 'var(--health-color, #4CAF50)'; // Green
        this.healthFill.style.animation = '';
      }
      
      // Update health text
      const healthText = this.healthBar.querySelector('.health-text');
      if (healthText) {
        healthText.textContent = `${Math.floor(health)} HP`;
      }
    }
  }
  
  public updateAmmo(currentAmmo: number, totalAmmo: number, isReloading: boolean = false, reloadProgress: number = 0): void {
    if (this.ammoCounter) {
      // Show reloading text if the player is reloading
      if (isReloading) {
        // Show reload progress
        const progressPercent = Math.floor(reloadProgress * 100);
        const progressBars = Math.floor(progressPercent / 10); // 0-10 bars
        const progressBar = '█'.repeat(progressBars) + '░'.repeat(10 - progressBars);
        
        this.ammoCounter.innerHTML = `RELOADING ${progressBar} ${progressPercent}%`;
        this.ammoCounter.style.color = 'yellow';
      } else {
        // Change display based on ammo level
        if (currentAmmo === 0 && totalAmmo > 0) {
          // Out of ammo but has reserve ammo - show reload prompt
          this.ammoCounter.innerHTML = '<span style="color: red; font-weight: bold;">PRESS R TO RELOAD</span>';
          this.ammoCounter.style.animation = 'flash 1s infinite';
          
          // Add the keyframes if they don't exist
          this.ensureFlashKeyframesExist();
        } else {
          // Normal ammo display with bullet icons
          const bulletIcon = '•'; // Bullet character
          const emptyIcon = '◦'; // Empty bullet character
          
          // Create visual representation of magazine
          let magazineVisual = '';
          
          // For weapons with large magazines, use a more compact representation
          if (currentAmmo + totalAmmo > 30) {
            // Just show the numbers with a better format
            magazineVisual = `<span style="font-weight: bold;">${currentAmmo}</span> / ${totalAmmo}`;
          } else {
            // For smaller magazines, show bullet icons
            const bulletIcons = bulletIcon.repeat(currentAmmo);
            magazineVisual = `<span style="letter-spacing: 2px;">${bulletIcons}</span> [${currentAmmo}/${totalAmmo}]`;
          }
          
          this.ammoCounter.innerHTML = magazineVisual;
          
          // Change color based on ammo level
          if (currentAmmo === 0) {
            // No ammo
            this.ammoCounter.style.color = 'red';
          } else if (currentAmmo <= 5) {
            // Low ammo
            this.ammoCounter.style.color = 'orange';
            
            // Flash the text for very low ammo
            if (currentAmmo <= 3) {
              this.ammoCounter.style.animation = 'flash 1s infinite';
              this.ensureFlashKeyframesExist();
            } else {
              this.ammoCounter.style.animation = '';
            }
          } else {
            // Normal ammo level
            this.ammoCounter.style.color = 'white';
            this.ammoCounter.style.animation = '';
          }
        }
      }
    }
  }
  
  private ensureFlashKeyframesExist(): void {
    // Add the keyframes if they don't exist
    if (!document.querySelector('#ammo-flash-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ammo-flash-keyframes';
      style.textContent = `
        @keyframes flash {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  public updateWave(wave: number): void {
    if (this.waveCounter) {
      // Add a visual effect for wave change
      this.waveCounter.textContent = `Wave: ${wave}`;
      
      // Add a brief animation to highlight the wave change
      this.waveCounter.style.animation = 'wave-change 1s ease-in-out';
      
      // Remove the animation after it completes
      setTimeout(() => {
        if (this.waveCounter) {
          this.waveCounter.style.animation = '';
        }
      }, 1000);
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
      
      // Show/hide the keyboard hints when paused
      const hintsContainer = (this as any).hintsContainer;
      if (hintsContainer) {
        if (show) {
          // Show hints when paused
          hintsContainer.style.display = 'flex';
          // Use setTimeout to ensure the display change takes effect before changing opacity
          setTimeout(() => {
            hintsContainer.style.opacity = '1';
          }, 10);
        } else {
          // Hide hints when unpaused
          hintsContainer.style.opacity = '0';
          // After fade out, set display to none
          setTimeout(() => {
            hintsContainer.style.display = 'none';
          }, 500);
        }
      }
    }
  }
} 
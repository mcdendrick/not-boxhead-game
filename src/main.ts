import './style.css'
import { Game } from './core/Game'

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Hide the game UI initially
  const gameUI = document.getElementById('game-ui')
  if (gameUI) {
    gameUI.style.display = 'none'
  }
  
  // Show the menu
  const gameMenu = document.getElementById('game-menu')
  if (gameMenu) {
    gameMenu.classList.remove('hidden')
  }
  
  // Hide the loading screen after a short delay
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    // Simulate loading progress
    const progressBar = document.querySelector('.progress-bar-fill') as HTMLElement
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      if (progressBar) {
        progressBar.style.width = `${progress}%`
      }
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          loadingScreen.style.display = 'none'
        }, 500)
      }
    }, 100)
  }
  
  // Initialize the game instance
  const game = new Game()
  
  // Add event listeners for menu buttons
  const startButton = document.getElementById('start-button')
  if (startButton) {
    startButton.addEventListener('click', () => {
      // Hide menu and show game UI
      if (gameMenu) {
        gameMenu.classList.add('hidden')
      }
      if (gameUI) {
        gameUI.style.display = 'block'
      }
      
      // Start the game
      game.start()
    })
  }
  
  const restartButton = document.getElementById('restart-button')
  if (restartButton) {
    restartButton.addEventListener('click', () => {
      // Hide game over screen and show game UI
      const gameOver = document.getElementById('game-over')
      if (gameOver) {
        gameOver.classList.add('hidden')
      }
      if (gameUI) {
        gameUI.style.display = 'block'
      }
      
      // Restart the game
      game.restart()
    })
  }
  
  const menuButton = document.getElementById('menu-button')
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      // Hide game over screen and show menu
      const gameOver = document.getElementById('game-over')
      if (gameOver) {
        gameOver.classList.add('hidden')
      }
      if (gameMenu) {
        gameMenu.classList.remove('hidden')
      }
    })
  }
})

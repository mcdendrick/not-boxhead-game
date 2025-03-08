# Not Boxhead - 3D Zombie Shooter

A 3D first-person shooter inspired by the classic Flash game "Boxhead Zombies", built with Three.js and TypeScript.

## Overview

"Not Boxhead" is a wave-based zombie shooter where players must survive increasingly difficult waves of blocky zombies. The game features:

- First-person perspective with 3D graphics
- Multiple zombie types with different behaviors
- Various weapons with unique characteristics
- Wave-based progression with increasing difficulty
- Score system based on kills

## Technologies Used

- Three.js for 3D rendering
- Cannon.js for physics
- TypeScript for type-safe code
- Howler.js for audio management
- Vite for fast development and building

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/not-boxhead-game.git
cd not-boxhead-game
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Game Controls

- **WASD**: Move
- **Mouse**: Look around
- **Left Click**: Shoot
- **R**: Reload
- **1-5**: Switch weapons
- **Shift**: Sprint
- **Space**: Jump

## Building for Production

To build the game for production:

```
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/core`: Core game systems (Game, Level, InputManager, etc.)
- `src/entities`: Game entities (Player, Enemy types)
- `src/weapons`: Weapon classes
- `src/physics`: Physics-related code
- `src/audio`: Audio management
- `src/ui`: User interface components
- `src/utils`: Utility functions
- `src/assets`: Game assets (models, textures, audio)

## Future Enhancements

- Additional enemy types
- More weapons and power-ups
- Multiple maps/arenas
- Local high score system
- Multiplayer support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the original "Boxhead Zombies" Flash game by Sean Cooper
- Built with Three.js and other open-source libraries 
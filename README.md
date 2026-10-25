# Neon Snake - Modern Arcade Web Game

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Online-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://n0vemberain.github.io/snake-game/)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20with-GitHub%20Pages-181717?style=for-the-badge&logo=github)](https://n0vemberain.github.io/snake-game/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Synthesized-brightgreen?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **Live Web Application URL:**  
> **[https://n0vemberain.github.io/snake-game/](https://n0vemberain.github.io/snake-game/)**  
> *(Click the link above to play directly in your browser on desktop or mobile)*

A feature-rich, high-performance, cyberpunk-themed Snake Game built purely with modern web standards (HTML5, CSS3, and Vanilla JavaScript). Featuring real-time procedural 8-bit sound synthesis via the Web Audio API, a physics-based particle engine, 4 distinct game modes, 5 dynamic retro themes, interactive power-ups, and full mobile touch/gesture support.

---

## Game Modes

1. **Classic Mode:** The timeless retro experience. Navigate the grid, devour apples, and grow your tail without crashing into borders or yourself.
2. **Campaign / Levels:** Progressive challenge mode where each 5 foods eaten advances the level, accelerating snake speed and introducing complex obstacle walls and mazes.
3. **Speed Run:** High-octane race against the clock! Starts with a 60-second timer; every piece of food eaten rewards bonus seconds.
4. **Portals:** Teleportation mechanics! Pairs of spinning neon portals are placed across the arena, allowing the snake to warp across space while preserving directional momentum.

---

## Key Features

### 5 Dynamic Arcade Themes
Switch themes on the fly with real-time CSS variable hot-swapping:
- **Cyber Neon (Default):** Cyan and magenta futuristic cyberpunk palette with glowing neon accents.
- **Synthwave 80s:** Retro sunset gradient, magenta grids, and outrun aesthetics.
- **Retro Gameboy:** Classic monochrome olive-green pixel screen nostalgia.
- **The Matrix:** Green phosphor digital rain and hacker terminal aesthetics.
- **Midnight Dark:** Clean, distraction-free minimalist dark mode with indigo highlights.

### Procedural Web Audio API Synthesizer
- **Zero external audio files:** No `.mp3` or `.wav` dependencies to download.
- Real-time 8-bit sound synthesis using browser `OscillatorNode`, `GainNode`, and ADSR envelope curves.
- Instant, zero-latency feedback for moves, apple bites, golden arpeggio fanfares, laser sweeps, crash explosions, and menu clicks.
- Built-in audio state toggle (Mute/Unmute) with `localStorage` memory.

### Interactive Foods and Power-Ups
- **Regular Apple:** +10 points and +1 body segment.
- **Golden Star:** +50 bonus points; temporary spawn with circular countdown timer ring.
- **Speed Lightning:** 2x movement speed with active on-screen timer bar and bonus score multipliers.
- **Ghost Berry:** Grants ethereal phasing mode for 7 seconds — pass through walls and your own tail harmlessly.
- **Ice Crystal:** Temporarily slows down the snake for precision maneuvers in tight grids.

### Particle Physics and Screen Shake
- **Particle Bursts:** Dynamic sparks, stars, and electrical arcs burst upon consuming different food types.
- **Death Explosion:** Multi-segment fragment explosion upon collision.
- **Tactile Screen Shake:** Decaying camera shake on crashes, level-ups, and special power-ups for authentic arcade impact.
- **Motion Trail:** Subtle neon glow trail following the snake's head during rapid movement.

### Full Mobile and Touch Support
- Fully responsive layout adapting across smartphones, tablets, and desktop displays.
- Dedicated virtual **Touch D-Pad** and action buttons.
- Intuitive **Touch Swipe Gestures** directly on the canvas arena.

### Achievements and Record Tracking
- Persistent **High Score** saved automatically in browser `localStorage`.
- Animated score increments with floating popups.
- 8 unique unlockable achievement badges with toast notification banners:
  - *First Bite:* Eat your very first piece of food.
  - *Centipede:* Grow snake length past 15 segments.
  - *Golden Hunter:* Collect 3 golden stars in one run.
  - *Speed Demon:* Activate a speed boost.
  - *Portal Hopper:* Teleport through portals 5 times.
  - *Ghost Walker:* Phase through an obstacle while in ghost mode.
  - *Centurion:* Reach 100+ points.
  - *Arcade Champion:* Dominate the leaderboard with 500+ points.
- Web Share API and one-click clipboard copy to share records with friends.

---

## Controls Guide

| Action | Keyboard Key | Mobile / Touch Device |
| :--- | :--- | :--- |
| **Move Up** | `W` or `↑` (Arrow Up) | Touch D-Pad Up or Swipe Up |
| **Move Down** | `S` or `↓` (Arrow Down) | Touch D-Pad Down or Swipe Down |
| **Move Left** | `A` or `←` (Arrow Left) | Touch D-Pad Left or Swipe Left |
| **Move Right** | `D` or `→` (Arrow Right) | Touch D-Pad Right or Swipe Right |
| **Pause / Resume** | `SPACE` | On-screen Pause button |
| **Restart Game** | `R` key | On-screen Restart button |
| **Toggle Mute** | `M` key | Header Sound icon button |
| **How to Play** | `?` key | Header Help icon button |
| **Fullscreen** | Click Fullscreen button | Click Fullscreen button |

---

## Project Structure

```text
Snake game/
├── index.html       # Semantic HTML5 layout, HUD, overlays, D-Pad, and accessible modals
├── style.css        # 5 CSS3 arcade themes, CRT scanlines, glassmorphism, responsive styles
├── audio.js         # Procedural 8-bit sound synthesis engine via Web Audio API
├── particles.js     # Physics particle system and decaying screen-shake engine
├── snake.js         # Snake kinematics, buffered direction queues, and FoodManager
├── game.js          # Core game loop, 4 game modes, power-up timers, and input controllers
├── LICENSE          # Open-source MIT License
└── README.md        # Complete game documentation and manual
```

---

## Getting Started

No installations or build steps required. The game runs directly in any modern web browser.

### Option 1: Direct File Launch
Double-click `index.html` from your file explorer to open it directly in your default browser.

### Option 2: Local HTTP Server (Recommended)
Run a local development server from the project directory:

**Using Python:**
```bash
python3 -m http.server 8080
```
Then visit: `http://localhost:8080` in your web browser.

**Using Node.js:**
```bash
npx serve
```

---

## Technology Stack
- **Markup:** HTML5 Canvas, `<dialog>`, semantic tags, and ARIA attributes
- **Styling:** CSS3 Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism backdrop-filters, Keyframe animations
- **Programming Language:** Vanilla ECMAScript (ES6+) Class-based architecture
- **Graphics:** HTML5 2D Canvas with High-DPI (`window.devicePixelRatio`) sharp scaling
- **Sound Synthesis:** Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`)
- **Persistence:** Browser `localStorage` API

---

## License
This project is licensed under the terms of the [MIT License](LICENSE). Free for personal, educational, and commercial use.

/**
 * ============================================================================
 * 🎮 প্রধান গেম অর্কেস্ট্রেটর ও কন্ট্রোলার ইঞ্জিন (Main Game Engine & Controller)
 * ============================================================================
 * এই ফাইলে রয়েছে:
 *   ১. হাই-ডিপিআই (Retina/4K) শার্প ক্যানভাস রেন্ডারিং আর্কিটেকচার
 *   ২. requestAnimationFrame ভিত্তিক ডেল্টা-টাইম একুমুলেটর গেম লুপ
 *   ৩. ৪টি গেম মোড: ক্লাসিক, ক্যাম্পেইন/লেভেলস, স্পিড রান ও পোর্টালস
 *   ৪. লেভেল ডিজাইন ও অবস্ট্যাকল (দেয়াল বাধা) জেনারেটর
 *   ৫. পোর্টাল টেলিপোর্টেশন মেকানিক্স
 *   ৬. পাওয়ার-আপ টাইমার ও স্ক্রিন প্রগ্রেস বার
 *   ৭. লোকালস্টোরেজ ইন্টিগ্রেশন ও রিয়েলটাইম হাইস্কোর ট্র্যাকিং
 *   ৮. অর্জন (Achievements) সিস্টেম ও টোস্ট নোটিফিকেশন
 *   ৯. সম্পূর্ণ কিবোর্ড, সোয়াইপ ও অনস্ক্রিন টাচ কন্ট্রোলার হ্যান্ডলার
 * ============================================================================
 */

class NeonSnakeGame {
  constructor() {
    // ১. DOM এলিমেন্টস রেফারেন্স
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasContainer = document.getElementById('canvas-container');

    // ওভারলেসমূহ
    this.overlayStart = document.getElementById('overlay-start');
    this.overlayPause = document.getElementById('overlay-pause');
    this.overlayGameover = document.getElementById('overlay-gameover');

    // স্কোর ও স্ট্যাটাস ডিসপ্লে
    this.scoreDisplay = document.getElementById('score-display');
    this.scoreIncrement = document.getElementById('score-increment');
    this.highscoreDisplay = document.getElementById('highscore-display');
    this.levelDisplay = document.getElementById('level-display');
    this.foodCountDisplay = document.getElementById('food-count-display');
    this.finalScore = document.getElementById('final-score');
    this.finalLength = document.getElementById('final-length');
    this.finalTime = document.getElementById('final-time');
    this.gameoverReason = document.getElementById('gameover-reason');
    this.newHighscoreBadge = document.getElementById('new-highscore-badge');

    // পাওয়ার-আপ বার
    this.powerupBarContainer = document.getElementById('powerup-bar-container');
    this.powerupTitle = document.getElementById('powerup-title');
    this.powerupIcon = document.getElementById('powerup-icon');
    this.powerupProgressFill = document.getElementById('powerup-progress-fill');

    // বোতামসমূহ
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnResumeGame = document.getElementById('btn-resume-game');
    this.btnRestartPause = document.getElementById('btn-restart-from-pause');
    this.btnRetryGame = document.getElementById('btn-retry-game');
    this.btnShareScore = document.getElementById('btn-share-score');
    this.btnSound = document.getElementById('btn-sound');
    this.themeSelect = document.getElementById('theme-select');
    this.btnHelp = document.getElementById('btn-help');
    this.helpModal = document.getElementById('help-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnModalOk = document.getElementById('btn-modal-ok');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.toggleWalls = document.getElementById('toggle-walls');
    this.toggleParticles = document.getElementById('toggle-particles');

    // ২. গ্রিড কনফিগারেশন
    this.gridWidth = 24;
    this.gridHeight = 24;
    this.cellSize = 25; // ক্যানভাস রিসাইজের সময় পুনঃগণনা করা হয়

    // ৩. গেম এন্টিটি
    this.snake = new Snake(this.gridWidth, this.gridHeight, this.cellSize);
    this.foodManager = new FoodManager(this.gridWidth, this.gridHeight, this.cellSize);

    // ৪. গেম স্টেট
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.highscore = parseInt(localStorage.getItem('neon_snake_highscore') || '0', 10);
    this.foodEaten = 0;
    this.level = 1;
    this.gameStartTime = 0;
    this.gameTimeSeconds = 0;

    // সেটিংস
    this.baseSpeed = 100; // মিলিসেকেন্ড প্রতি মুভ
    this.currentSpeed = 100;
    this.allowWalls = true;
    this.currentMode = 'classic'; // 'classic', 'campaign', 'speedrun', 'portals'

    // বাধার তালিকা (Campaign ও Obstacles মোডের জন্য)
    this.obstacles = [];

    // পোর্টালসমূহ (Portals মোডের জন্য)
    this.portals = [];

    // স্পিড রান মোড টাইমার
    this.speedRunRemainingSeconds = 60;
    this.speedRunTimerId = null;

    // সক্রিয় পাওয়ার-আপ
    this.activePowerup = null;

    // অর্জন ট্র্যাকিং
    this.unlockedAchievements = JSON.parse(localStorage.getItem('neon_snake_achievements') || '[]');
    this.portalTeleports = 0;
    this.goldenEaten = 0;

    // গেম লুপ ভেরিয়েবল
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.animationFrameId = null;

    // থিম রঙ
    this.themeColors = this.getThemeColors();

    // টাচ সোয়াইপ সমর্থন
    this.touchStartX = 0;
    this.touchStartY = 0;

    // প্রাথমিক সেটআপ
    this.init();
  }

  /**
   * গেম সিস্টেম ইনিশিয়ালাইজেশন
   */
  init() {
    this.updateHighscoreUI();
    this.setupCanvasDPI();
    this.bindEvents();
    this.loadSavedTheme();
    this.renderInitialScreen();
  }

  /**
   * হাই-ডিপিআই (Retina/4K) স্ক্রিনের জন্য ক্যানভাস স্কেলিং
   */
  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvasContainer.getBoundingClientRect();
    const size = Math.min(rect.width || 600, 600);

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.cellSize = size / this.gridWidth;
    this.snake.cellSize = this.cellSize;
    this.foodManager.cellSize = this.cellSize;
  }

  /**
   * বর্তমান সক্রিয় CSS থিম থেকে কালার কোড বের করা
   */
  getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
      head: style.getPropertyValue('--snake-head').trim() || '#00f0ff',
      body: style.getPropertyValue('--snake-body').trim() || '#05d5e3',
      tail: style.getPropertyValue('--snake-tail').trim() || '#019aa5',
      primary: style.getPropertyValue('--primary-color').trim() || '#00f0ff',
      secondary: style.getPropertyValue('--secondary-color').trim() || '#ff0077',
      accent: style.getPropertyValue('--accent-color').trim() || '#ffe600',
      canvasBg: style.getPropertyValue('--canvas-bg').trim() || '#090b12'
    };
  }

  /**
   * ইভেন্ট লিসেনার ও বোতাম হ্যান্ডলার যুক্ত করা
   */
  bindEvents() {
    // উইন্ডো রিসাইজ
    window.addEventListener('resize', () => this.setupCanvasDPI());

    // কিবোর্ড ইনপুট হ্যান্ডলার
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // বোতামসমূহ
    this.btnStartGame.addEventListener('click', () => this.startGame());
    this.btnResumeGame.addEventListener('click', () => this.togglePause());
    this.btnRestartPause.addEventListener('click', () => this.startGame());
    this.btnRetryGame.addEventListener('click', () => this.startGame());
    this.btnShareScore.addEventListener('click', () => this.shareScore());

    // সাউন্ড টগল
    this.btnSound.addEventListener('click', () => this.toggleSound());

    // থিম সিলেক্টর
    this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));

    // হেল্প মডাল
    this.btnHelp.addEventListener('click', () => {
      window.arcadeAudio.playClick();
      this.helpModal.showModal();
    });
    this.btnCloseModal.addEventListener('click', () => this.helpModal.close());
    this.btnModalOk.addEventListener('click', () => {
      window.arcadeAudio.playClick();
      this.helpModal.close();
      if (this.state === 'START') this.startGame();
    });

    // ফুলস্ক্রিন বোতাম
    this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // মোড টগল বাটন
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.arcadeAudio.playClick();
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        if (this.state === 'PLAYING') this.startGame();
      });
    });

    // গতি / ডিফিকাল্টি বাটন
    const diffButtons = document.querySelectorAll('.diff-btn');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.arcadeAudio.playClick();
        diffButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.baseSpeed = parseInt(btn.dataset.speed, 10);
        this.currentSpeed = this.baseSpeed;
      });
    });

    // চেকবস সুইচেস
    this.toggleWalls.addEventListener('change', (e) => {
      this.allowWalls = e.target.checked;
    });

    this.toggleParticles.addEventListener('change', (e) => {
      window.particleSystem.setEnabled(e.target.checked);
    });

    // টাচ D-Pad বাটন
    const bindTouch = (id, dx, dy) => {
      const el = document.getElementById(id);
      if (!el) return;
      const trigger = (evt) => {
        evt.preventDefault();
        window.arcadeAudio.init();
        if (this.state === 'PLAYING') {
          if (this.snake.setDirection(dx, dy)) {
            window.arcadeAudio.playMove();
          }
        }
      };
      el.addEventListener('touchstart', trigger, { passive: false });
      el.addEventListener('mousedown', trigger);
    };

    bindTouch('touch-up', 0, -1);
    bindTouch('touch-down', 0, 1);
    bindTouch('touch-left', -1, 0);
    bindTouch('touch-right', 1, 0);

    document.getElementById('touch-pause')?.addEventListener('click', () => this.togglePause());
    document.getElementById('touch-restart')?.addEventListener('click', () => this.startGame());

    // ক্যানভাস টাচ সোয়াইপ সমর্থন
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const minDistance = 25;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minDistance) {
          if (deltaX > 0) this.handleDirectionInput(1, 0);
          else this.handleDirectionInput(-1, 0);
        }
      } else {
        if (Math.abs(deltaY) > minDistance) {
          if (deltaY > 0) this.handleDirectionInput(0, 1);
          else this.handleDirectionInput(0, -1);
        }
      }
    }, { passive: true });
  }

  /**
   * কিবোর্ড প্রেস হ্যান্ডলার
   */
  handleKeyDown(e) {
    // সাউন্ড ইনিশিয়ালাইজেশন
    window.arcadeAudio.init();

    // স্পেস বার: পজ ও রিজ্যুম
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.state === 'PLAYING' || this.state === 'PAUSED') {
        this.togglePause();
      } else if (this.state === 'START' || this.state === 'GAMEOVER') {
        this.startGame();
      }
      return;
    }

    // R কি: রিস্টার্ট
    if (e.key === 'r' || e.key === 'R') {
      this.startGame();
      return;
    }

    // M কি: সাউন্ড মিউট
    if (e.key === 'm' || e.key === 'M') {
      this.toggleSound();
      return;
    }

    // ? কি: সহায়তা ডায়ালগ
    if (e.key === '?' || e.key === '/') {
      this.helpModal.showModal();
      return;
    }

    // সাপের দিক নিয়ন্ত্রণ
    if (this.state === 'PLAYING') {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          this.handleDirectionInput(0, -1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          this.handleDirectionInput(0, 1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          this.handleDirectionInput(-1, 0);
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          this.handleDirectionInput(1, 0);
          break;
      }
    }
  }

  /**
   * দিক পরিবর্তনের ইনপুট প্রসেসিং
   */
  handleDirectionInput(dx, dy) {
    if (this.snake.setDirection(dx, dy)) {
      window.arcadeAudio.playMove();
    }
  }

  /**
   * নতুন খেলা শুরু করা
   */
  startGame() {
    window.arcadeAudio.playClick();

    this.snake.reset();
    this.foodManager.reset();
    window.particleSystem.clear();

    this.score = 0;
    this.foodEaten = 0;
    this.level = 1;
    this.currentSpeed = this.baseSpeed;
    this.gameStartTime = performance.now();
    this.activePowerup = null;
    this.portalTeleports = 0;
    this.goldenEaten = 0;

    this.updateScoreUI();
    this.hidePowerupBar();

    // মোড ভিত্তিক উপাদান তৈরি
    this.setupModeEnvironment();

    // খাদ্য স্পন
    this.foodManager.spawnNormalFood(this.snake, this.obstacles, this.portals);

    // ওভারলে স্ক্রিন বন্ধ করা
    this.overlayStart.classList.add('hidden');
    this.overlayPause.classList.add('hidden');
    this.overlayGameover.classList.add('hidden');

    this.state = 'PLAYING';
    this.lastFrameTime = performance.now();
    this.accumulatedTime = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * নির্বাচিত গেম মোডের পরিবেশ ও অবজেক্ট তৈরি
   */
  setupModeEnvironment() {
    this.obstacles = [];
    this.portals = [];

    if (this.currentMode === 'campaign') {
      this.generateLevelObstacles(this.level);
    } else if (this.currentMode === 'portals') {
      this.generatePortals();
    } else if (this.currentMode === 'speedrun') {
      this.speedRunRemainingSeconds = 60;
      this.levelDisplay.textContent = `TIME: ${this.speedRunRemainingSeconds}s`;
    }
  }

  /**
   * ক্যাম্পেইন মোডের জন্য লেভেল অনুযায়ী দেয়াল তৈরি
   */
  generateLevelObstacles(lvl) {
    this.obstacles = [];
    const midX = Math.floor(this.gridWidth / 2);
    const midY = Math.floor(this.gridHeight / 2);

    if (lvl === 1) {
      // লেভেল ১: ফাঁকা খোলামেলা ফিল্ড
    } else if (lvl === 2) {
      // লেভেল ২: চার কোণায় ৪টি ছোট পিলার
      for (let i = 4; i <= 6; i++) {
        this.obstacles.push({ x: 4, y: i });
        this.obstacles.push({ x: this.gridWidth - 5, y: i });
        this.obstacles.push({ x: 4, y: this.gridHeight - 1 - i });
        this.obstacles.push({ x: this.gridWidth - 5, y: this.gridHeight - 1 - i });
      }
    } else if (lvl === 3) {
      // লেভেল ৩: কেন্দ্রে ক্রস বাধা
      for (let i = midX - 4; i <= midX + 4; i++) {
        if (Math.abs(i - midX) > 1) {
          this.obstacles.push({ x: i, y: midY });
        }
      }
      for (let i = midY - 4; i <= midY + 4; i++) {
        if (Math.abs(i - midY) > 1) {
          this.obstacles.push({ x: midX, y: i });
        }
      }
    } else {
      // লেভেল ৪+: লেবিরিন্থ বক্স
      for (let i = 3; i < this.gridWidth - 3; i += 2) {
        this.obstacles.push({ x: i, y: 5 });
        this.obstacles.push({ x: this.gridWidth - 1 - i, y: this.gridHeight - 6 });
      }
    }
  }

  /**
   * পোর্টাল মোডের জন্য দুইটি ইন্টারকানেক্টেড টেলিপোর্টার তৈরি
   */
  generatePortals() {
    this.portals = [
      {
        in: { x: 3, y: Math.floor(this.gridHeight / 2) },
        out: { x: this.gridWidth - 4, y: Math.floor(this.gridHeight / 2) },
        colorIn: '#9333ea',
        colorOut: '#3b82f6'
      }
    ];
  }

  /**
   * গেম পজ এবং চালু টগল
   */
  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.overlayPause.classList.remove('hidden');
      window.arcadeAudio.playClick();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.overlayPause.classList.add('hidden');
      this.lastFrameTime = performance.now();
      window.arcadeAudio.playClick();
      this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  /**
   * প্রধান গেম লুপ (Fixed time step accumulator)
   */
  gameLoop(currentTime) {
    if (this.state !== 'PLAYING') return;

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.accumulatedTime += deltaTime;

    // বিশেষ পাওয়ার-আপ মেয়াদ ও ফুড ম্যানেজার আপডেট
    this.updatePowerupTimer(currentTime);
    this.foodManager.update();
    window.screenShake.update();
    window.particleSystem.update();

    // স্নেক মুভমেন্ট ফিক্সড স্টেপ লুপ
    while (this.accumulatedTime >= this.currentSpeed) {
      this.tick();
      this.accumulatedTime -= this.currentSpeed;
    }

    // ফ্রেম রেন্ডারিং
    this.render();

    this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

}

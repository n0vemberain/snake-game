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

  /**
   * গেমের প্রতিটি একক মুভমেন্ট টিক (Game Logic Step)
   */
  tick() {
    // সাপ এক ঘর সরানো
    const moveResult = this.snake.move(!this.allowWalls);

    // ১. দেয়াল বা নিজের শরীরে আঘাত লাগলে গেম ওভার
    if (moveResult.hitWall) {
      this.gameOver('দেয়ালের সাথে সজোরে ধাক্কা লেগেছে!');
      return;
    }
    if (moveResult.hitSelf) {
      this.gameOver('সাপ নিজের শরীরে কামড় দিয়েছে!');
      return;
    }

    const head = this.snake.body[0];

    // ২. অবস্ট্যাকল (বাধা) সংঘর্ষ চেক
    if (!this.snake.isGhost) {
      const hitObstacle = this.obstacles.some(obs => obs.x === head.x && obs.y === head.y);
      if (hitObstacle) {
        this.gameOver('শক্ত বাধার সাথে ধাক্কা লেগেছে!');
        return;
      }
    } else {
      // ঘোস্ট মোডে বাধা পার হলে বিশেষ অর্জন
      const passedObstacle = this.obstacles.some(obs => obs.x === head.x && obs.y === head.y);
      if (passedObstacle) {
        this.unlockAchievement('ghost_walker', 'অমর আত্মা: বাধার ভেতর দিয়ে নিরাপদে গমন!');
      }
    }

    // ৩. পোর্টাল টেলিপোর্টেশন চেক
    if (this.currentMode === 'portals') {
      this.portals.forEach(portal => {
        if (head.x === portal.in.x && head.y === portal.in.y) {
          head.x = portal.out.x;
          head.y = portal.out.y;
          window.arcadeAudio.playPortal();
          window.particleSystem.createPortalBurst(portal.out.x * this.cellSize + this.cellSize / 2, portal.out.y * this.cellSize + this.cellSize / 2, portal.colorOut);
          window.screenShake.trigger(6, 200);
          this.portalTeleports++;
          if (this.portalTeleports >= 5) {
            this.unlockAchievement('portal_hopper', 'পোর্টাল মাস্টার: ৫ বার সফল টেলিপোর্ট সম্পন্ন!');
          }
        }
      });
    }

    // ৪. সাধারণ খাবার গ্রহণ চেক
    if (this.foodManager.currentFood && head.x === this.foodManager.currentFood.x && head.y === this.foodManager.currentFood.y) {
      this.handleEatNormalFood();
    }

    // ৫. বিশেষ পাওয়ার-আপ খাবার গ্রহণ চেক
    if (this.foodManager.specialFood && head.x === this.foodManager.specialFood.x && head.y === this.foodManager.specialFood.y) {
      this.handleEatSpecialFood();
    }

    // সাপের চলার পথে মৃদু ট্রেইল কণা তৈরি
    const headPx = head.x * this.cellSize + this.cellSize / 2;
    const headPy = head.y * this.cellSize + this.cellSize / 2;
    window.particleSystem.createTrail(headPx, headPy, this.themeColors.head);
  }

  /**
   * সাধারণ খাদ্য খাওয়ার লজিক
   */
  handleEatNormalFood() {
    const food = this.foodManager.currentFood;
    const px = food.x * this.cellSize + this.cellSize / 2;
    const py = food.y * this.cellSize + this.cellSize / 2;

    this.snake.grow(food.grow);
    this.addScore(food.points);
    this.foodEaten++;

    window.arcadeAudio.playEat();
    window.particleSystem.createFoodBurst(px, py, 'normal');
    window.screenShake.trigger(4, 150);

    // প্রথম অর্জনের চেক
    this.unlockAchievement('first_bite', 'প্রথম পদক্ষেপ: সফলভাবে প্রথম খাবার সংগ্রহ!');

    if (this.snake.body.length >= 15) {
      this.unlockAchievement('centipede', 'সেন্টিপিড: সাপের দৈর্ঘ্য ১৫ অতিক্রম করেছে!');
    }

    // লেভেলস মোডে পরবর্তী লেভেল
    if (this.currentMode === 'campaign' && this.foodEaten % 5 === 0) {
      this.levelUp();
    }

    // মাঝে মাঝে বিশেষ খাবার স্পন (২৫% সম্ভাবনা)
    if (Math.random() < 0.28) {
      this.foodManager.spawnSpecialFood(this.snake, this.obstacles, this.portals);
    }

    // নতুন সাধারণ খাবার তৈরি
    this.foodManager.spawnNormalFood(this.snake, this.obstacles, this.portals);
    this.updateScoreUI();
  }

  /**
   * বিশেষ পাওয়ার খাদ্য খাওয়ার লজিক
   */
  handleEatSpecialFood() {
    const sp = this.foodManager.specialFood;
    const px = sp.x * this.cellSize + this.cellSize / 2;
    const py = sp.y * this.cellSize + this.cellSize / 2;

    this.addScore(sp.points);
    window.particleSystem.createFoodBurst(px, py, sp.type);
    window.screenShake.trigger(8, 250);

    if (sp.type === 'golden') {
      window.arcadeAudio.playGolden();
      this.goldenEaten++;
      if (this.goldenEaten >= 3) {
        this.unlockAchievement('golden_hunter', 'সোনার হরিণ: ৩টি সোনালী আপেল ভক্ষণ সম্পন্ন!');
      }
    } else {
      window.arcadeAudio.playPowerup();
      this.activatePowerup(sp.type, 7000); // ৭ সেকেন্ডের জন্য পাওয়ার
    }

    this.foodManager.specialFood = null;
    this.updateScoreUI();
  }

  /**
   * বিশেষ পাওয়ার-আপ বাফার সক্রিয় করা
   */
  activatePowerup(type, duration) {
    this.activePowerup = {
      type: type,
      startTime: performance.now(),
      duration: duration
    };

    if (type === 'speed') {
      this.snake.isSpeedBoosted = true;
      this.currentSpeed = Math.max(35, this.baseSpeed * 0.55); // ডাবল দ্রুত
      this.showPowerupBar('⚡ স্পিড বুস্ট সক্রিয়!', '⚡');
      this.unlockAchievement('speed_demon', 'গতি দানব: আলোর গতিতে ধাবমান!');
    } else if (type === 'ghost') {
      this.snake.isGhost = true;
      this.showPowerupBar('👻 ঘোস্ট মোড: আপনি আঘাতমুক্ত!', '👻');
    } else if (type === 'slow') {
      this.snake.isSlowed = true;
      this.currentSpeed = this.baseSpeed * 1.5; // ধীর ও সহজ নিয়ন্ত্রণ
      this.showPowerupBar('❄️ আইস ক্রিস্টাল: ধীরগতি সক্রিয়!', '❄️');
    }
  }

  /**
   * পাওয়ার-আপের সময়সীমা পর্যবেক্ষণ ও সমাপ্তি
   */
  updatePowerupTimer(now) {
    if (!this.activePowerup) return;

    const elapsed = now - this.activePowerup.startTime;
    const remaining = 1 - (elapsed / this.activePowerup.duration);

    if (remaining <= 0) {
      // পাওয়ার শেষ
      if (this.activePowerup.type === 'speed') {
        this.snake.isSpeedBoosted = false;
        this.currentSpeed = this.baseSpeed;
      } else if (this.activePowerup.type === 'ghost') {
        this.snake.isGhost = false;
      } else if (this.activePowerup.type === 'slow') {
        this.snake.isSlowed = false;
        this.currentSpeed = this.baseSpeed;
      }

      this.activePowerup = null;
      this.hidePowerupBar();
    } else {
      this.powerupProgressFill.style.width = `${remaining * 100}%`;
    }
  }

  showPowerupBar(title, icon) {
    this.powerupTitle.textContent = title;
    this.powerupIcon.textContent = icon;
    this.powerupBarContainer.classList.remove('hidden');
  }

  hidePowerupBar() {
    this.powerupBarContainer.classList.add('hidden');
  }

  /**
   * স্কোর বৃদ্ধি ও অ্যানিমেশন
   */
  addScore(pts) {
    this.score += pts;
    this.scoreIncrement.textContent = `+${pts}`;
    this.scoreIncrement.classList.remove('animate');
    void this.scoreIncrement.offsetWidth; // রিফ্লো ট্রিগার
    this.scoreIncrement.classList.add('animate');

    if (this.score >= 100) {
      this.unlockAchievement('centurion', 'সেঞ্চুরিয়ন: ১০০ পয়েন্টের গৌরব অর্জন!');
    }
    if (this.score >= 500) {
      this.unlockAchievement('arcade_champion', 'আর্কিড চ্যাম্পিয়ন: ৫০০ পয়েন্টের মহান রেকর্ড!');
    }

    if (this.score > this.highscore) {
      this.highscore = this.score;
      localStorage.setItem('neon_snake_highscore', this.highscore);
    }
  }

  /**
   * ক্যাম্পেইন মোডে পরবর্তী লেভেলে উত্তীর্ণ হওয়া
   */
  levelUp() {
    this.level++;
    this.levelDisplay.textContent = `LVL ${this.level}`;
    window.arcadeAudio.playLevelUp();
    window.screenShake.trigger(10, 400);

    // গতি সামান্য বৃদ্ধি
    this.baseSpeed = Math.max(45, this.baseSpeed - 8);
    this.currentSpeed = this.baseSpeed;

    this.generateLevelObstacles(this.level);
  }

  /**
   * গেম সমাপ্তি (Game Over)
   */
  gameOver(reason) {
    this.state = 'GAMEOVER';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.arcadeAudio.playDie();
    window.screenShake.trigger(16, 500);

    // সাপের কণা বিস্ফোরণ
    window.particleSystem.createDeathBurst(this.snake.body, this.themeColors.head);

    // খেলার সময় হিসাব
    const durationSeconds = Math.floor((performance.now() - this.gameStartTime) / 1000);
    const mins = Math.floor(durationSeconds / 60).toString().padStart(2, '0');
    const secs = (durationSeconds % 60).toString().padStart(2, '0');

    // UI তে বিবরণ প্রদর্শন
    this.finalScore.textContent = this.score;
    this.finalLength.textContent = this.snake.body.length;
    this.finalTime.textContent = `${mins}:${secs}`;
    this.gameoverReason.textContent = reason;

    if (this.score >= this.highscore && this.score > 0) {
      this.newHighscoreBadge.classList.remove('hidden');
    } else {
      this.newHighscoreBadge.classList.add('hidden');
    }

    this.updateHighscoreUI();
    this.overlayGameover.classList.remove('hidden');
  }

  /**
   * ক্যানভাস রেন্ডারিং মেথড
   */
  render() {
    this.ctx.save();

    // স্ক্রিন শেক অফসেট প্রয়োগ
    window.screenShake.apply(this.ctx);

    // ক্যানভাস ব্যাকগ্রাউন্ড পরিষ্কার করা
    this.ctx.fillStyle = this.themeColors.canvasBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // মৃদু ব্যাকগ্রাউন্ড গ্রিড লাইন
    this.drawBackgroundGrid();

    // পোর্টালসমূহ আঁকা
    this.drawPortals();

    // অবস্ট্যাকল (দেয়াল) আঁকা
    this.drawObstacles();

    // খাদ্য আঁকা
    this.foodManager.draw(this.ctx);

    // সাপ আঁকা
    this.snake.draw(this.ctx, this.themeColors);

    // পার্টিকেল আঁকা
    window.particleSystem.draw(this.ctx);

    this.ctx.restore();
  }

  /**
   * ব্যাকগ্রাউন্ড সাবটেল গ্রিড
   */
  drawBackgroundGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.gridHeight * this.cellSize);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.gridWidth * this.cellSize, y * this.cellSize);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * পোর্টালসমূহ রেন্ডার করা
   */
  drawPortals() {
    if (this.currentMode !== 'portals') return;
    this.portals.forEach(portal => {
      this.drawSinglePortal(portal.in.x, portal.in.y, portal.colorIn);
      this.drawSinglePortal(portal.out.x, portal.out.y, portal.colorOut);
    });
  }

  drawSinglePortal(gx, gy, color) {
    const cx = gx * this.cellSize + this.cellSize / 2;
    const cy = gy * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize / 2 - 2;

    this.ctx.save();
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * অবস্ট্যাকল (বাধা দেয়াল) রেন্ডার করা
   */
  drawObstacles() {
    if (this.obstacles.length === 0) return;

    this.ctx.save();
    this.ctx.fillStyle = '#475569';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#64748b';

    this.obstacles.forEach(obs => {
      const px = obs.x * this.cellSize;
      const py = obs.y * this.cellSize;

      this.ctx.fillRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);

      // থ্রিডি বেভেল বর্ডার
      this.ctx.strokeStyle = '#94a3b8';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);
    });

    this.ctx.restore();
  }

  /**
   * প্রাথমিক ক্যানভাস প্রদর্শন (গেম শুরুর আগের স্ট্যাটিক স্ক্রিন)
   */
  renderInitialScreen() {
    this.themeColors = this.getThemeColors();
    this.render();
  }

  /**
   * অর্জন আনলক করা ও টোস্ট দেখানো
   */
  unlockAchievement(id, title) {
    if (this.unlockedAchievements.includes(id)) return;

    this.unlockedAchievements.push(id);
    localStorage.setItem('neon_snake_achievements', JSON.stringify(this.unlockedAchievements));

    const toast = document.getElementById('achievement-toast');
    const desc = document.getElementById('achievement-desc');
    desc.textContent = title;

    toast.classList.remove('hidden');
    window.arcadeAudio.playLevelUp();

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }

  /**
   * স্কোরবোর্ড UI আপডেট
   */
  updateScoreUI() {
    this.scoreDisplay.textContent = this.score;
    this.foodCountDisplay.textContent = `${this.foodEaten} 🍎`;
    this.updateHighscoreUI();
  }

  updateHighscoreUI() {
    this.highscoreDisplay.textContent = this.highscore;
  }

  /**
   * সাউন্ড মিউট/আনমিউট হ্যান্ডলার
   */
  toggleSound() {
    const isMuted = window.arcadeAudio.toggleMute();
    const iconOn = this.btnSound.querySelector('.icon-sound-on');
    const iconOff = this.btnSound.querySelector('.icon-sound-off');

    if (isMuted) {
      iconOn.classList.add('hidden');
      iconOff.classList.remove('hidden');
    } else {
      iconOn.classList.remove('hidden');
      iconOff.classList.add('hidden');
    }
  }

  /**
   * থিম পরিবর্তন
   */
  changeTheme(newTheme) {
    document.body.dataset.theme = newTheme;
    localStorage.setItem('neon_snake_theme', newTheme);
    this.themeColors = this.getThemeColors();
    window.arcadeAudio.playClick();
    this.render();
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('neon_snake_theme');
    if (savedTheme) {
      this.themeSelect.value = savedTheme;
      document.body.dataset.theme = savedTheme;
      this.themeColors = this.getThemeColors();
    }
  }

  /**
   * ফুলস্ক্রিন টগল
   */
  toggleFullscreen() {
    window.arcadeAudio.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  /**
   * স্কোর শেয়ারিং (Web Share API বা ক্লিপবোর্ডে কপি)
   */
  shareScore() {
    const shareText = `🐍 আমি নিয়ন স্নেক গেমে ${this.score} পয়েন্ট স্কোর করেছি! আপনি কি আমার এই রেকর্ড ভাঙতে পারবেন?`;
    if (navigator.share) {
      navigator.share({
        title: 'নিয়ন স্নেক গেম রেকর্ড',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      alert('স্কোর ক্লিপবোর্ডে কপি করা হয়েছে! বন্ধুদের সাথে শেয়ার করুন।');
    }
  }
}

// পৃষ্ঠা লোড সম্পন্ন হলে গেম চালু
window.addEventListener('DOMContentLoaded', () => {
  window.snakeGame = new NeonSnakeGame();
});

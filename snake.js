/**
 * ============================================================================
 * 🐍 স্নেক এন্টিটি, গ্রিড ম্যাথ ও ফুড ম্যানেজার (Snake & Food Engine)
 * ============================================================================
 * এই ফাইলে রয়েছে:
 *   ১. Snake ক্লাস: সাপের গতিবিধি, বাফার্ড ইনপুট, চোখ ও জিভ অ্যানিমেশন,
 *      সেলফ-কলিশন চেক, র‍্যাপ-অ্যারাউন্ড ও ট্রেইল রেন্ডারিং।
 *   ২. FoodManager ক্লাস: বিভিন্ন ধরনের বিশেষ খাদ্য উৎপাদন (সোনালী ফল, স্পিড
 *      থান্ডার, ঘোস্ট বেরি, আইস কিউব) এবং টাইম-আউট অ্যানিমেশন।
 *   ৩. গ্রিড ম্যাট্রিক্স ম্যাপিং এবং নিরাপদ স্থানাঙ্ক নির্ধারণ।
 * ============================================================================
 */

class Snake {
  /**
   * স্নেক কনস্ট্রাক্টর
   * @param {number} gridWidth - গ্রিডের কলাম সংখ্যা
   * @param {number} gridHeight - গ্রিডের সারি সংখ্যা
   * @param {number} cellSize - প্রতিটি ঘরের পিক্সেল আকার
   */
  constructor(gridWidth = 24, gridHeight = 24, cellSize = 25) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = cellSize;

    this.reset();
  }

  /**
   * সাপের প্রাথমিক অবস্থান ও প্যারামিটার রিসেট করা
   */
  reset() {
    const startX = Math.floor(this.gridWidth / 2);
    const startY = Math.floor(this.gridHeight / 2);

    // সাপের খণ্ডসমূহ (শুরুতে ৩ ঘর বিশিষ্ট)
    this.body = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    // প্রাথমিক গতিবেগ (ডানদিকে)
    this.dx = 1;
    this.dy = 0;

    // পরবর্তী ইনপুট বাফার (দ্রুত দুটি কী চাপলে উল্টো ধাক্কা লাগা প্রতিরোধ করতে)
    this.nextDirection = { dx: 1, dy: 0 };
    this.inputQueue = [];

    // বৃদ্ধি বা গ্রোথ বাফার
    this.growthPending = 0;

    // বিশেষ ক্ষমতা ও বাফার স্ট্যাটাস
    this.isGhost = false;       // ঘোস্ট মোড: দেয়াল ও নিজের শরীরে আঘাতমুক্ত
    this.isSpeedBoosted = false;// অতিরিক্ত গতি
    this.isSlowed = false;      // ধীর গতি

    // জিভ অ্যানিমেশন কাউন্টার
    this.tongueCycle = 0;
  }

  /**
   * ইউজারের দিক নির্দেশনা ইনপুট বাফারে যুক্ত করা
   * @param {number} newDx 
   * @param {number} newDy 
   */
  setDirection(newDx, newDy) {
    // আগের পেন্ডিং ডিরেকশন বের করা
    const lastDir = this.inputQueue.length > 0 
      ? this.inputQueue[this.inputQueue.length - 1] 
      : { dx: this.dx, dy: this.dy };

    // বিপরীত দিকে যাওয়া নিষিদ্ধ (যেমন ডানে যাওয়ার সময় সরাসরি বামে যাওয়া যাবে না)
    if (newDx === -lastDir.dx && newDy === -lastDir.dy) {
      return false;
    }

    // একই দিকে বার বার ইনপুট উপেক্ষা করা
    if (newDx === lastDir.dx && newDy === lastDir.dy) {
      return false;
    }

    // বাফারে সর্বোচ্চ ২টি দিক রাখা যাতে লেটেন্সি না হয়
    if (this.inputQueue.length < 2) {
      this.inputQueue.push({ dx: newDx, dy: newDy });
      return true;
    }

    return false;
  }

  /**
   * সাপের প্রতি ফ্রেমের অবস্থান আপডেট
   * @param {boolean} allowWallWrap - দেয়াল ভেদ করে উল্টো দিক থেকে বের হওয়া যাবে কিনা
   * @returns {object} { moved: boolean, hitWall: boolean, hitSelf: boolean, head: object }
   */
  move(allowWallWrap = false) {
    // ইনপুট কিউ থেকে পরবর্তী দিক কার্যকর করা
    if (this.inputQueue.length > 0) {
      const next = this.inputQueue.shift();
      this.dx = next.dx;
      this.dy = next.dy;
    }

    // বর্তমান মাথা
    const head = this.body[0];
    let newHeadX = head.x + this.dx;
    let newHeadY = head.y + this.dy;

    let hitWall = false;

    // দেয়াল সংঘর্ষ অথবা র‍্যাপ-অ্যারাউন্ড হিসাব
    if (allowWallWrap || this.isGhost) {
      if (newHeadX < 0) newHeadX = this.gridWidth - 1;
      else if (newHeadX >= this.gridWidth) newHeadX = 0;

      if (newHeadY < 0) newHeadY = this.gridHeight - 1;
      else if (newHeadY >= this.gridHeight) newHeadY = 0;
    } else {
      if (newHeadX < 0 || newHeadX >= this.gridWidth || newHeadY < 0 || newHeadY >= this.gridHeight) {
        hitWall = true;
      }
    }

    // নতুন মাথা তৈরি
    const newHead = { x: newHeadX, y: newHeadY };

    // নিজের শরীরের সাথে সংঘর্ষ চেক (ঘোস্ট মোড সক্রিয় থাকলে মুক্ত)
    let hitSelf = false;
    if (!this.isGhost) {
      // লেজের শেষ অংশটি যেহেতু সরে যাবে, তাই শেষ খণ্ড বাদ দিয়ে চেক করা যায় যদি গ্রোথ পেন্ডিং না থাকে
      const checkLength = this.growthPending > 0 ? this.body.length : this.body.length - 1;
      for (let i = 0; i < checkLength; i++) {
        if (this.body[i].x === newHead.x && this.body[i].y === newHead.y) {
          hitSelf = true;
          break;
        }
      }
    }

    // যদি দেয়াল বা নিজের গায়ে ধাক্কা লাগে, মাথা না বাড়িয়ে ফল পাঠাও
    if (hitWall || hitSelf) {
      return { moved: false, hitWall, hitSelf, head: newHead };
    }

    // সাপের নতুন মাথা সংযোগ
    this.body.unshift(newHead);

    // যদি খাবার খেয়ে গ্রোথ বাকি থাকে, তবে লেজ কাটা হবে না
    if (this.growthPending > 0) {
      this.growthPending--;
    } else {
      this.body.pop(); // লেজের শেষ খণ্ড অপসারণ
    }

    this.tongueCycle = (this.tongueCycle + 1) % 12;

    return { moved: true, hitWall: false, hitSelf: false, head: newHead };
  }

  /**
   * সাপের বৃদ্ধি ঘটানো
   * @param {number} amount - কত ঘর লম্বা হবে
   */
  grow(amount = 1) {
    this.growthPending += amount;
  }

  /**
   * সাপের কোনো অংশ নির্দিষ্ট পয়েন্টে আছে কিনা যাচাই
   * @param {number} x 
   * @param {number} y 
   * @param {boolean} includeHead 
   */
  occupies(x, y, includeHead = true) {
    const startIndex = includeHead ? 0 : 1;
    for (let i = startIndex; i < this.body.length; i++) {
      if (this.body[i].x === x && this.body[i].y === y) {
        return true;
      }
    }
    return false;
  }

  /**
   * ক্যানভাসে সাপ অঙ্কন করা
   * @param {CanvasRenderingContext2D} ctx 
   * @param {object} colors - থিমের হেড, বডি ও টেল কালার
   */
  draw(ctx, colors = {}) {
    const headColor = colors.head || '#00f0ff';
    const bodyColor = colors.body || '#05d5e3';
    const tailColor = colors.tail || '#019aa5';
    const cellSize = this.cellSize;

    ctx.save();

    // ঘোস্ট মোডে থাকলে সাপ আধা-স্বচ্ছ ও ছায়ারূপ ধারণ করে
    if (this.isGhost) {
      ctx.globalAlpha = 0.55;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#b537f2';
    } else if (this.isSpeedBoosted) {
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#00f0ff';
    } else {
      ctx.shadowBlur = 8;
      ctx.shadowColor = headColor;
    }

    // ১. লেজ থেকে শুরু করে শরীর আঁকা (যাতে মাথা সবার উপরে রেন্ডার হয়)
    const len = this.body.length;
    for (let i = len - 1; i > 0; i--) {
      const seg = this.body[i];
      const px = seg.x * cellSize;
      const py = seg.y * cellSize;

      // মাথা থেকে লেজ পর্যন্ত মসৃণ রঙের ট্রানজিশন (Color interpolate)
      const ratio = i / len;
      ctx.fillStyle = this.interpolateColor(bodyColor, tailColor, ratio);

      // প্রতিটি খণ্ড মসৃণ গোলাকার চারকোনা (Rounded rectangle)
      const padding = 2;
      const radius = 6;
      this.drawRoundedRect(
        ctx, 
        px + padding, 
        py + padding, 
        cellSize - padding * 2, 
        cellSize - padding * 2, 
        radius
      );

      // পিঠের উপর নিয়ন স্ট্রাইপ লাইন
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(px + cellSize / 2 - 1, py + cellSize / 2 - 1, 3, 3);
    }

    // ২. সাপের মাথা অঙ্কন
    const head = this.body[0];
    const hx = head.x * cellSize;
    const hy = head.y * cellSize;

    ctx.fillStyle = headColor;
    this.drawRoundedRect(ctx, hx + 1, hy + 1, cellSize - 2, cellSize - 2, 8);

    // ৩. সাপের চোখ ও জিভ আঁকা (চলনের দিক অনুযায়ী)
    this.drawFace(ctx, hx, hy, cellSize);

    ctx.restore();
  }

  /**
   * সাপের চোখ, চোখের মণি ও স্প্লিট জিভ অঙ্কন
   */
  drawFace(ctx, hx, hy, size) {
    const eyeSize = 3.5;
    const pupilSize = 1.8;
    let eye1X, eye1Y, eye2X, eye2Y;
    let tongueStartX, tongueStartY, tongueEndX, tongueEndY;

    // সাপের গতির দিক অনুযায়ী চোখের অবস্থান
    if (this.dx === 1) { // ডানে
      eye1X = hx + size * 0.7; eye1Y = hy + size * 0.28;
      eye2X = hx + size * 0.7; eye2Y = hy + size * 0.72;
      tongueStartX = hx + size - 1; tongueStartY = hy + size / 2;
      tongueEndX = tongueStartX + 7; tongueEndY = tongueStartY;
    } else if (this.dx === -1) { // বামে
      eye1X = hx + size * 0.3; eye1Y = hy + size * 0.28;
      eye2X = hx + size * 0.3; eye2Y = hy + size * 0.72;
      tongueStartX = hx + 1; tongueStartY = hy + size / 2;
      tongueEndX = tongueStartX - 7; tongueEndY = tongueStartY;
    } else if (this.dy === -1) { // উপরে
      eye1X = hx + size * 0.28; eye1Y = hy + size * 0.3;
      eye2X = hx + size * 0.72; eye2Y = hy + size * 0.3;
      tongueStartX = hx + size / 2; tongueStartY = hy + 1;
      tongueEndX = tongueStartX; tongueEndY = tongueStartY - 7;
    } else { // নিচে
      eye1X = hx + size * 0.28; eye1Y = hy + size * 0.7;
      eye2X = hx + size * 0.72; eye2Y = hy + size * 0.7;
      tongueStartX = hx + size / 2; tongueStartY = hy + size - 1;
      tongueEndX = tongueStartX; tongueEndY = tongueStartY + 7;
    }

    // চোখের সাদা অংশ
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // চোখের কালো মণি
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.arc(eye1X + this.dx * 0.7, eye1Y + this.dy * 0.7, pupilSize, 0, Math.PI * 2);
    ctx.arc(eye2X + this.dx * 0.7, eye2Y + this.dy * 0.7, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    // লাল চেরা জিভ (নির্দিষ্ট সময়ে বের হয় ও ভেতরে যায়)
    if (this.tongueCycle < 5) {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tongueStartX, tongueStartY);
      ctx.lineTo(tongueEndX, tongueEndY);
      // জিভের দুই মাথায় ফোর্ক
      if (this.dx !== 0) {
        ctx.lineTo(tongueEndX + this.dx * 2, tongueEndY - 3);
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX + this.dx * 2, tongueEndY + 3);
      } else {
        ctx.lineTo(tongueEndX - 3, tongueEndY + this.dy * 2);
        ctx.moveTo(tongueEndX, tongueEndY);
        ctx.lineTo(tongueEndX + 3, tongueEndY + this.dy * 2);
      }
      ctx.stroke();
    }
  }

  /**
   * গোলাকার কোণাযুক্ত আয়তক্ষেত্র আঁকার মেথড
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * রঙের ইন্টারপোলেশন সহায়ক ফাংশন
   */
  interpolateColor(color1, color2, factor) {
    return factor > 0.5 ? color2 : color1;
  }
}

/**
 * ============================================================================
 * 🍎 ফুড ম্যানেজার (Food Manager)
 * ============================================================================
 * ক্যানভাসে বিভিন্ন ধরনের খাবারের সৃষ্টি, মেয়াদ ট্র্যাকিং এবং স্পন্দনশীল রেন্ডারিং।
 */
class FoodManager {
  constructor(gridWidth = 24, gridHeight = 24, cellSize = 25) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = cellSize;

    // প্রধান খাদ্য (লাল আপেল)
    this.currentFood = null;

    // বিশেষ বোনাস খাদ্য (সোনালী, স্পিড, ঘোস্ট, ইত্যাদি)
    this.specialFood = null;
    this.specialTimeout = 0;
    this.specialMaxDuration = 10000; // ১০ সেকেন্ড স্থায়ী হবে

    // খাদ্য অ্যানিমেশন পালস কাউন্টার
    this.pulse = 0;
  }

  /**
   * খাদ্যসমূহ রিসেট করা
   */
  reset() {
    this.currentFood = null;
    this.specialFood = null;
    this.specialTimeout = 0;
  }

  /**
   * ফাঁকা ঘরে সাধারণ খাবার তৈরি করা
   * @param {Snake} snake 
   * @param {Array} obstacles - বাধা বা দেয়ালের তালিকা
   * @param {Array} portals - পোর্টালের তালিকা
   */
  spawnNormalFood(snake, obstacles = [], portals = []) {
    const pos = this.findFreeCell(snake, obstacles, portals);
    if (pos) {
      this.currentFood = {
        x: pos.x,
        y: pos.y,
        type: 'normal',
        points: 10,
        grow: 1,
        color: '#ff0055'
      };
    }
  }

  /**
   * মাঝে মাঝে বিশেষ পাওয়ার খাদ্য স্পন করা
   */
  spawnSpecialFood(snake, obstacles = [], portals = []) {
    if (this.specialFood) return; // ইতিমধ্যে একটি সক্রিয় থাকলে অপেক্ষা করো

    const pos = this.findFreeCell(snake, obstacles, portals);
    if (!pos) return;

    // র‍্যান্ডম স্পেশাল টাইপ নির্বাচন
    const roll = Math.random();
    let type = 'golden';
    let color = '#ffd700';
    let points = 50;

    if (roll < 0.4) {
      type = 'golden';  // সোনালী খাবার: ৫০ পয়েন্ট
      color = '#ffd700';
      points = 50;
    } else if (roll < 0.65) {
      type = 'speed';   // স্পিড থান্ডার: গতি বৃদ্ধি ও বোনাস
      color = '#00f0ff';
      points = 25;
    } else if (roll < 0.85) {
      type = 'ghost';   // ঘোস্ট বেরি: দেয়ালে ধাক্কা থেকে মুক্তি
      color = '#b537f2';
      points = 30;
    } else {
      type = 'slow';    // আইস কিউব: সাপ ধীর করে নিয়ন্ত্রণে সুবিধা
      color = '#3b82f6';
      points = 20;
    }

    this.specialFood = {
      x: pos.x,
      y: pos.y,
      type: type,
      color: color,
      points: points,
      spawnTime: performance.now(),
      duration: this.specialMaxDuration
    };
  }

  /**
   * গ্রিডের ফাঁকা ও নিরাপদ সেল খুঁজে বের করা
   */
  findFreeCell(snake, obstacles = [], portals = []) {
    const emptyCells = [];

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        // সাপের গায়ে থাকলে বাদ
        if (snake && snake.occupies(x, y)) continue;

        // সাধারণ খাবারের ওপর থাকলে বাদ
        if (this.currentFood && this.currentFood.x === x && this.currentFood.y === y) continue;

        // স্পেশাল খাবারের ওপর থাকলে বাদ
        if (this.specialFood && this.specialFood.x === x && this.specialFood.y === y) continue;

        // দেয়াল বা বাধার ওপর থাকলে বাদ
        const onObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
        if (onObstacle) continue;

        // পোর্টালের ওপর থাকলে বাদ
        const onPortal = portals.some(p => (p.in.x === x && p.in.y === y) || (p.out.x === x && p.out.y === y));
        if (onPortal) continue;

        emptyCells.push({ x, y });
      }
    }

    if (emptyCells.length === 0) return null;

    // এলোমেলো একটি খালি সেল নির্বাচন
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  /**
   * খাদ্য টাইমার ও অ্যানিমেশন আপডেট করা
   */
  update() {
    this.pulse += 0.08;

    // বিশেষ খাদ্যের সময়সীমা চেক করা
    if (this.specialFood) {
      const elapsed = performance.now() - this.specialFood.spawnTime;
      if (elapsed >= this.specialFood.duration) {
        this.specialFood = null; // সময় শেষ হয়ে যাওয়ায় উধাও
      }
    }
  }

  /**
   * ক্যানভাসে খাবার অঙ্কন করা
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    const cellSize = this.cellSize;

    // ১. সাধারণ আপেল অঙ্কন
    if (this.currentFood) {
      const fx = this.currentFood.x * cellSize + cellSize / 2;
      const fy = this.currentFood.y * cellSize + cellSize / 2;
      const scale = 1 + Math.sin(this.pulse) * 0.08;
      const radius = (cellSize / 2 - 3) * scale;

      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff0055';
      ctx.fillStyle = '#ff0055';

      // আপেল বৃত্ত
      ctx.beginPath();
      ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.fill();

      // আপেলের বোঁটা ও সবুজ পাতা
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(fx + 2, fy - radius + 1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // হাইলাইট গ্লিটার
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(fx - radius * 0.35, fy - radius * 0.35, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ২. বিশেষ বোনাস খাবার অঙ্কন
    if (this.specialFood) {
      const sx = this.specialFood.x * cellSize + cellSize / 2;
      const sy = this.specialFood.y * cellSize + cellSize / 2;
      const elapsed = performance.now() - this.specialFood.spawnTime;
      const remainingProgress = 1 - (elapsed / this.specialFood.duration);

      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = this.specialFood.color;
      ctx.fillStyle = this.specialFood.color;

      // অবশিষ্ট সময়ের রিং কাউন্টডাউন
      ctx.strokeStyle = this.specialFood.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, cellSize / 2 + 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingProgress);
      ctx.stroke();

      // আইকন / আকৃতি রেন্ডারিং
      if (this.specialFood.type === 'golden') {
        this.drawSpecialStar(ctx, sx, sy, 5, cellSize / 2 - 2, cellSize / 4);
      } else if (this.specialFood.type === 'speed') {
        this.drawLightningIcon(ctx, sx, sy);
      } else if (this.specialFood.type === 'ghost') {
        this.drawGhostIcon(ctx, sx, sy);
      } else {
        this.drawIceIcon(ctx, sx, sy);
      }

      ctx.restore();
    }
  }

  /**
   * সোনালী তারা অঙ্কন
   */
  drawSpecialStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * স্পিড লাইটনিং আইকন
   */
  drawLightningIcon(ctx, cx, cy) {
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 8);
    ctx.lineTo(cx - 5, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - 2, cy + 8);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * ঘোস্ট অরা আইকন
   */
  drawGhostIcon(ctx, cx, cy) {
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 6, Math.PI, 0, false);
    ctx.lineTo(cx + 6, cy + 6);
    ctx.lineTo(cx + 2, cy + 3);
    ctx.lineTo(cx - 2, cy + 6);
    ctx.lineTo(cx - 6, cy + 3);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * আইস কিউব আইকন
   */
  drawIceIcon(ctx, cx, cy) {
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, cy - 3, 6, 6);
  }
}

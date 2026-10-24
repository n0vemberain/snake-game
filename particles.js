/**
 * ============================================================================
 * ✨ আর্কেড পার্টিকেল ও স্ক্রিন-শেক ভিজ্যুয়াল ইঞ্জিন (Visual Particle System)
 * ============================================================================
 * এই মডিউলটিতে রয়েছে:
 *   ১. ফিজিক্স-ভিত্তিক পার্টিকেল কাইনেম্যাটিক্স (Velocity, Gravity, Drag, Alpha Decay)
 *   ২. বিভিন্ন খাবারের জন্য বিশেষ কণা এফেক্ট (সাধারণ খাদ্য, সোনালী তারা, স্পিড স্পার্ক)
 *   ৩. সাপ ক্র্যাশ করার পর প্রাণবন্ত ফ্র্যাগমেন্ট এক্সপ্লোশন
 *   ৪. পোর্টাল এন্ট্রি ও এক্সিট অরা এফেক্ট
 *   ৫. স্ক্রিন শেক (Screen Shake) ম্যানেজার যা খেলায় সন্তোষজনক ইম্প্যাক্ট তৈরি করে
 * ============================================================================
 */

class Particle {
  /**
   * একক কণা (Particle) কনস্ট্রাক্টর
   * @param {number} x - সূচনা X স্থানাঙ্ক
   * @param {number} y - সূচনা Y স্থানাঙ্ক
   * @param {string} color - কণার রঙ
   * @param {object} options - কণার গতি, আকার এবং আকৃতি কনফিগ
   */
  constructor(x, y, color, options = {}) {
    this.x = x;
    this.y = y;
    this.color = color;

    // বেগ ও দিক (র‍্যান্ডম স্প্রেড)
    const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
    const speed = options.speed !== undefined ? options.speed : Math.random() * 4 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // আকার ও জীবনকাল
    this.size = options.size !== undefined ? options.size : Math.random() * 4 + 2;
    this.initialSize = this.size;
    this.life = 1.0;
    this.decay = options.decay !== undefined ? options.decay : Math.random() * 0.03 + 0.02;

    // ঘর্ষণ ও টান (Drag factor)
    this.drag = options.drag !== undefined ? options.drag : 0.94;
    this.gravity = options.gravity !== undefined ? options.gravity : 0.05;

    // আকৃতি: 'circle', 'square', 'star', 'spark'
    this.shape = options.shape || 'circle';
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
  }

  /**
   * কণার অবস্থান ও জীবনকাল আপডেট করা
   * @returns {boolean} কণাটি জীবিত আছে কিনা
   */
  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.rotation += this.rotSpeed;
    this.life -= this.decay;
    this.size = Math.max(0, this.initialSize * this.life);

    return this.life > 0 && this.size > 0.2;
  }

  /**
   * ক্যানভাসে কণা অঙ্কন করা
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.shape === 'square') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else if (this.shape === 'star') {
      this.drawStar(ctx, 0, 0, 5, this.size * 1.5, this.size * 0.6);
    } else if (this.shape === 'spark') {
      ctx.fillRect(-this.size, -this.size / 3, this.size * 2, this.size / 1.5);
    } else {
      // ডিফল্ট বৃত্তাকার কণা
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * তারা (Star) আকৃতির কণা আঁকার সহায়ক ফাংশন
   */
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
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
}

/**
 * সমগ্র কণা ব্যবস্থাপনা সিস্টেম (Particle Engine)
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.enabled = true;
  }

  /**
   * কণা ইফেক্ট সক্রিয় বা নিষ্ক্রিয় করা
   * @param {boolean} val 
   */
  setEnabled(val) {
    this.enabled = val;
    if (!val) {
      this.particles = [];
    }
  }

  /**
   * খাবার খাওয়ার সময় স্প্ল্যাশ কণা তৈরি করা
   * @param {number} x - গ্রিড পিক্সেল কেন্দ্র X
   * @param {number} y - গ্রিড পিক্সেল কেন্দ্র Y
   * @param {string} foodType - সাধারণ, সোনালী, স্পিড বা ঘোস্ট
   */
  createFoodBurst(x, y, foodType = 'normal') {
    if (!this.enabled) return;

    let color = '#ff0055';
    let count = 16;
    let shape = 'circle';

    if (foodType === 'golden') {
      color = '#ffd700';
      count = 24;
      shape = 'star';
    } else if (foodType === 'speed') {
      color = '#00f0ff';
      count = 20;
      shape = 'spark';
    } else if (foodType === 'ghost') {
      color = '#b537f2';
      count = 18;
      shape = 'circle';
    } else if (foodType === 'slow') {
      color = '#3b82f6';
      count = 16;
      shape = 'square';
    }

    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color, {
        shape: shape,
        speed: Math.random() * 5 + 1.5,
        decay: Math.random() * 0.03 + 0.025,
        size: Math.random() * 4 + 2
      }));
    }
  }

  /**
   * সাপের মৃত্যুর সময়ে বৃহৎ বিস্ফোরণ ইফেক্ট
   * @param {Array} segments - সাপের দেহের প্রতিটি খণ্ডের স্থানাঙ্ক
   * @param {string} headColor - থিমের সাপের গায়ের রঙ
   */
  createDeathBurst(segments, headColor = '#00f0ff') {
    if (!this.enabled) return;

    // সাপের প্রতি ৩য় খণ্ড থেকে কণার বিস্ফোরণ ঘটানো
    segments.forEach((seg, idx) => {
      if (idx % 2 === 0) {
        const count = idx === 0 ? 30 : 10;
        const color = idx === 0 ? '#ff0055' : headColor;

        for (let i = 0; i < count; i++) {
          this.particles.push(new Particle(seg.x, seg.y, color, {
            shape: Math.random() > 0.5 ? 'square' : 'circle',
            speed: Math.random() * 7 + 2,
            decay: Math.random() * 0.02 + 0.015,
            size: Math.random() * 5 + 2.5,
            gravity: 0.15
          }));
        }
      }
    });
  }

  /**
   * পোর্টাল টেলিপোর্টেশন রিং কণা
   * @param {number} x 
   * @param {number} y 
   * @param {string} portalColor 
   */
  createPortalBurst(x, y, portalColor = '#9333ea') {
    if (!this.enabled) return;

    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push(new Particle(x, y, portalColor, {
        angle: angle,
        speed: Math.random() * 2 + 2,
        decay: 0.04,
        size: 3,
        shape: 'spark'
      }));
    }
  }

  /**
   * সাপের চলার পথে ছোট ট্রেইল কণা
   */
  createTrail(x, y, color) {
    if (!this.enabled) return;
    if (Math.random() > 0.4) return; // অতিরিক্ত কণা জমার প্রতিরোধ

    this.particles.push(new Particle(x, y, color, {
      speed: Math.random() * 0.8,
      decay: 0.06,
      size: Math.random() * 2.5 + 1,
      gravity: 0
    }));
  }

  /**
   * সকল কণা আপডেট ও নিষ্ক্রিয়গুলো ফিল্টার করা
   */
  update() {
    if (!this.enabled) return;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const alive = this.particles[i].update();
      if (!alive) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * ক্যানভাসে সকল কণা রেন্ডার করা
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (!this.enabled || this.particles.length === 0) return;
    this.particles.forEach(p => p.draw(ctx));
  }

  /**
   * সকল কণা মুছে ফেলা
   */
  clear() {
    this.particles = [];
  }
}

/**
 * ============================================================================
 * 💥 স্ক্রিন শেক ম্যানেজার (Screen Shake System)
 * ============================================================================
 * গেমের সংঘর্ষ বা অর্জনের সময় ক্যানভাসকে মৃদু কাঁপিয়ে আর্কেড ফিল এনে দেয়।
 */
class ScreenShakeManager {
  constructor() {
    this.duration = 0;
    this.intensity = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * ঝাঁকুনি শুরু করা
   * @param {number} intensity - ঝাঁকুনির তীব্রতা (পিক্সেল)
   * @param {number} duration - ঝাঁকুনির সময়কাল (মিলিসেকেন্ড)
   */
  trigger(intensity = 8, duration = 300) {
    this.intensity = intensity;
    this.duration = duration;
    this.startTime = performance.now();
  }

  /**
   * প্রতি ফ্রেমে ঝাঁকুনি গণনা করা
   */
  update() {
    if (this.duration <= 0) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    const elapsed = performance.now() - this.startTime;
    if (elapsed >= this.duration) {
      this.duration = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    // সময়ের সাথে তীব্রতা ধীরে ধীরে কমানো (Smooth ease out)
    const progress = 1 - (elapsed / this.duration);
    const currentIntensity = this.intensity * progress;

    this.offsetX = (Math.random() * 2 - 1) * currentIntensity;
    this.offsetY = (Math.random() * 2 - 1) * currentIntensity;
  }

  /**
   * ক্যানভাস রেন্ডারিং কনটেক্সটে অফসেট প্রয়োগ করা
   * @param {CanvasRenderingContext2D} ctx 
   */
  apply(ctx) {
    if (this.offsetX !== 0 || this.offsetY !== 0) {
      ctx.translate(this.offsetX, this.offsetY);
    }
  }
}

// গ্লোবাল ইনস্ট্যান্স প্রস্তুত
window.particleSystem = new ParticleSystem();
window.screenShake = new ScreenShakeManager();

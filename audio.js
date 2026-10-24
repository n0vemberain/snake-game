/**
 * ============================================================================
 * 🔊 আর্কেড সাউন্ড সিন্থেসাইজার ইঞ্জিন (Web Audio API Sound Engine)
 * ============================================================================
 * কোনো প্রকার এক্সটার্নাল অডিও ফাইল (.mp3 বা .wav) ছাড়াই ব্রাউজারের নিজস্ব
 * Web Audio API ব্যবহার করে রিয়েল-টাইম ৮-বিট রেট্রো আর্কেড সাউন্ড তৈরি করা হয়েছে।
 * 
 * সুবিধা:
 *   ১. কোনো নেটওয়ার্ক লেটেন্সি নেই (জিরো মিলি-সেকেন্ড লোডিং)।
 *   ২. ব্রাউজারের ক্যাশ বা মিসিং ফাইলের সমস্যা থাকে না।
 *   ৩. সাউন্ড সম্পূর্ণ কাস্টমাইজযোগ্য (ফ্রিকোয়েন্সি, ওয়েভফর্ম, ফিল্টার ইত্যাদি)।
 *   ৪. মেমোরি খরচ অত্যন্ত কম।
 * ============================================================================
 */

class ArcadeAudioEngine {
  constructor() {
    // অডিও কনটেক্সট ইনিশিয়ালাইজেশন (ব্রাউজার ভেন্ডর প্রিফিক্স সহ)
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = null;
    this.AudioCtxClass = AudioCtx;

    // সাউন্ড মিউট অবস্থা (localStorage থেকে পুনরুদ্ধার)
    const savedMute = localStorage.getItem('neon_snake_muted');
    this.isMuted = savedMute === 'true';

    // মাস্টার গেইন নোড (ভলিউম নিয়ন্ত্রণের জন্য)
    this.masterGain = null;

    // ব্রাউজারের অটো-প্লে নীতি অনুযায়ী প্রথম ইউজার ইন্টারঅ্যাকশনে এক্টিভ হবে
    this.isInitialized = false;
  }

  /**
   * অডিও কনটেক্সট সক্রিয় করা (প্রথম ক্লিক বা কি-প্রেসে কল হবে)
   */
  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      this.ctx = new this.AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API সমর্থিত নয় বা ব্লক করা হয়েছে:', e);
    }
  }

  /**
   * সাউন্ড মিউট অথবা আনমিউট টগল করা
   * @returns {boolean} বর্তমান মিউট অবস্থা
   */
  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    localStorage.setItem('neon_snake_muted', this.isMuted);

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.25;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
    }

    return this.isMuted;
  }

  /**
   * সাপ সরার মৃদু ব্লিপ সাউন্ড (Direction change / move tick)
   */
  playMove() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * সাধারণ খাবার (লাল আপেল) খাওয়ার সাউন্ড
   */
  playEat() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // উজ্জ্বল দুই-টোন আরোহণ (8-bit arcade bounce)
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(540, now + 0.06);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * বিশেষ সোনালী আপেল খাওয়ার চিম ও হারমোনিক সাউন্ড
   */
  playGolden() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 আরপেজিও
    notes.forEach((freq, index) => {
      const startTime = this.ctx.currentTime + index * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  /**
   * পাওয়ার-আপ বাফার সংগ্রহ সাউন্ড (লেজার সুইপ)
   */
  playPowerup() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * পোর্টাল টেলিপোর্টেশনের সাউন্ড ইফেক্ট (Frequency modulation)
   */
  playPortal() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * সংঘর্ষ ও গেম ওভার সাউন্ড (হোয়াইট নয়েজ ও পিচ ডাউন ক্র্যাশ)
   */
  playDie() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;

    // ১. ডাউন পিচ অসসিলেটর
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);

    // ২. এক্সপ্লোশন নয়েজ বাফার
    try {
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.linearRampToValueAtTime(100, now + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.35);
    } catch (e) {
      // নয়েজ ক্রিয়েশনে কোনো সমস্যা হলে ফলব্যাক
    }
  }

  /**
   * নতুন লেভেল বা অর্জনের জন্য ফ্যানফেয়ার সাউন্ড
   */
  playLevelUp() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const chord = [440, 554.37, 659.25, 880]; // A মেজর কর্ড
    chord.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  /**
   * বোতাম ক্লিকে ট্রিপল টিক সাউন্ড
   */
  playClick() {
    if (this.isMuted || !this.ctx) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

// গ্লোবাল অডিও ইঞ্জিন ইনস্ট্যান্স তৈরি
window.arcadeAudio = new ArcadeAudioEngine();

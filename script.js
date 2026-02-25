// Sound Manager Class - Updated with your downloaded sounds
class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.backgroundMusic = null;
        this.isMusicPlaying = false;
        
        // Initialize all sounds
        this.initSounds();
    }
    
    initSounds() {
        // Load all your downloaded sounds
        const soundFiles = {
            shoot: 'assets/sounds/shoot.mp3',
            hit: 'assets/sounds/hit.mp3',
            miss: 'assets/sounds/miss.mp3',
            gameStart: 'assets/sounds/game start.mp3',
            gameOver: 'assets/sounds/game over.mp3',
            win: 'assets/sounds/win.mp3',
            background: 'assets/sounds/background game sound.mp3'
        };
        
        // Load each sound file
        for (let [key, path] of Object.entries(soundFiles)) {
            try {
                const audio = new Audio(path);
                audio.volume = key === 'background' ? 0.3 : 0.5; // Background music thoda slow
                
                // Error handling agar file nahi mili
                audio.onerror = () => {
                    console.warn(`Could not load sound: ${path}`);
                    // Fallback to generated sound
                    this.sounds[key] = this.generateFallbackSound(key);
                };
                
                audio.oncanplaythrough = () => {
                    console.log(`Loaded sound: ${key}`);
                };
                
                // Preload
                audio.load();
                this.sounds[key] = audio;
                
            } catch (e) {
                console.error(`Error loading sound ${key}:`, e);
                this.sounds[key] = this.generateFallbackSound(key);
            }
        }
        
        // Setup background music separately
        this.setupBackgroundMusic();
    }
    
    setupBackgroundMusic() {
        this.backgroundMusic = this.sounds.background;
        if (this.backgroundMusic) {
            this.backgroundMusic.loop = true; // Background music loop karo
            this.backgroundMusic.volume = 0.3;
        }
    }
    
    // Fallback agar sound file load na ho
    generateFallbackSound(type) {
        return {
            play: () => {
                if (this.muted) return;
                console.log(`Playing fallback sound: ${type}`);
                // Simple beep using Web Audio API
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    
                    let freq = 440;
                    if (type === 'shoot') freq = 800;
                    else if (type === 'hit') freq = 600;
                    else if (type === 'miss') freq = 200;
                    
                    oscillator.frequency.value = freq;
                    gainNode.gain.value = 0.1;
                    
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.1);
                } catch (e) {}
            }
        };
    }
    
    play(type) {
        if (this.muted) return;
        
        const sound = this.sounds[type];
        if (sound && sound instanceof HTMLAudioElement) {
            try {
                // Reset sound to beginning
                sound.currentTime = 0;
                
                // Play with promise handling
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log(`Playback failed for ${type}:`, error);
                        // User interaction ke liye wait karna padega
                    });
                }
            } catch (e) {
                console.log(`Error playing ${type}:`, e);
            }
        } else if (sound && sound.play) {
            // Fallback sound
            sound.play();
        }
        
        // Visual feedback
        this.showSoundWave();
    }
    
    startBackgroundMusic() {
        if (this.muted || !this.backgroundMusic || this.isMusicPlaying) return;
        
        try {
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.3;
            
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isMusicPlaying = true;
                        console.log('Background music started');
                    })
                    .catch(error => {
                        console.log('Background music play failed:', error);
                        // Chrome policy - user interaction ke baad hi play hoga
                    });
            }
        } catch (e) {
            console.log('Error starting background music:', e);
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.isMusicPlaying = false;
        }
    }
    
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.isMusicPlaying = false;
        }
    }
    
    resumeBackgroundMusic() {
        if (!this.muted && this.backgroundMusic && !this.isMusicPlaying) {
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => this.isMusicPlaying = true)
                    .catch(() => {});
            }
        }
    }
    
    showSoundWave() {
        const wave = document.querySelector('.sound-wave');
        if (wave) {
            wave.classList.add('active');
            setTimeout(() => wave.classList.remove('active'), 300);
        }
    }
    
    toggle() {
        this.muted = !this.muted;
        
        if (this.muted) {
            // Mute kiya toh background music bhi band karo
            this.pauseBackgroundMusic();
        } else {
            // Unmute kiya toh background music resume karo
            this.resumeBackgroundMusic();
        }
        
        // Update UI
        const toggle = document.getElementById('soundToggle');
        const soundButton = document.getElementById('soundButton');
        
        if (toggle) {
            toggle.textContent = this.muted ? '🔇' : '🔊';
            toggle.classList.toggle('muted', this.muted);
        }
        
        if (soundButton) {
            soundButton.textContent = this.muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
        }
        
        return this.muted;
    }
    
    setVolume(type, value) {
        const sound = this.sounds[type];
        if (sound && sound instanceof HTMLAudioElement) {
            sound.volume = Math.max(0, Math.min(1, value));
        }
    }
}

// Target Class (same as before)
class Target {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.points = 10;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
    
    update(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.speedX *= -1;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.speedY *= -1;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.points, this.x, this.y);
    }
    
    isHit(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}

// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize Sound Manager with your downloaded sounds
        this.sound = new SoundManager();
        
        // Game state
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.wave = 1;
        this.gameActive = true;
        
        // Targets
        this.targets = [];
        this.maxMisses = 5;
        
        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;
        
        // User interaction ke liye flag
        this.userInteracted = false;
        
        this.createSoundWaveElement();
        this.spawnWave();
        this.setupListeners();
        this.gameLoop();
    }
    
    createSoundWaveElement() {
        if (!document.querySelector('.sound-wave')) {
            const wave = document.createElement('div');
            wave.className = 'sound-wave';
            wave.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
            document.querySelector('.game-wrapper').appendChild(wave);
        }
    }
    
    spawnWave() {
        this.targets = [];
        const count = 10;
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random() * (this.canvas.width - 60) + 30;
                y = Math.random() * (this.canvas.height - 60) + 30;
            } while (this.isOverlapping(x, y));
            
            this.targets.push(new Target(x, y));
        }
        
        this.updateTargetsLeft();
        this.showNotification(`WAVE ${this.wave} - ${count} TARGETS!`);
        
        // Play game start sound for first wave
        if (this.wave === 1) {
            setTimeout(() => {
                this.sound.play('gameStart');
                // Background music start karne ki koshish
                this.sound.startBackgroundMusic();
            }, 100);
        } else {
            this.sound.play('win');
        }
    }
    
    isOverlapping(x, y) {
        for (let target of this.targets) {
            const dx = x - target.x;
            const dy = y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 50) return true;
        }
        return false;
    }
    
    setupListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameActive) return;
            
            // Pehle click par background music start karo
            if (!this.userInteracted) {
                this.userInteracted = true;
                this.sound.startBackgroundMusic();
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            this.shoot(clickX, clickY);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                this.toggleSound();
            }
        });
    }
    
    shoot(x, y) {
        let hitTarget = false;
        
        // Play shoot sound
        this.sound.play('shoot');
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            if (this.targets[i].isHit(x, y)) {
                this.score += this.targets[i].points;
                this.hits++;
                hitTarget = true;
                
                // Play hit sound
                this.sound.play('hit');
                
                this.targets.splice(i, 1);
                this.showNotification(`+${this.targets[i]?.points || 10} POINTS!`);
                this.createHitEffect(x, y);
                
                break;
            }
        }
        
        if (!hitTarget) {
            this.misses++;
            
            // Play miss sound
            this.sound.play('miss');
            
            this.showNotification('MISS!', '#ff5555');
            this.createMissEffect(x, y);
            
            if (this.misses >= this.maxMisses) {
                this.gameOver();
            }
        }
        
        if (this.targets.length === 0 && this.gameActive) {
            this.wave++;
            this.sound.play('win'); // Wave complete sound
            this.spawnWave();
        }
        
        this.updateUI();
    }
    
    createHitEffect(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = '#4afcff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    createMissEffect(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = '#ff5555';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y - 15);
        this.ctx.lineTo(x + 15, y + 15);
        this.ctx.moveTo(x + 15, y - 15);
        this.ctx.lineTo(x - 15, y + 15);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    gameOver() {
        this.gameActive = false;
        
        // Play game over sound
        this.sound.play('gameOver');
        this.sound.pauseBackgroundMusic();
        
        const accuracy = this.hits + this.misses > 0 
            ? Math.round((this.hits / (this.hits + this.misses)) * 100) 
            : 0;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHits').textContent = this.hits;
        document.getElementById('finalMisses').textContent = this.misses;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        
        document.getElementById('gameOverlay').classList.add('active');
    }
    
    newGame() {
        this.score = 0;
        this.hits = 0;
        this.misses = 0;
        this.wave = 1;
        this.gameActive = true;
        
        this.spawnWave();
        this.updateUI();
        
        document.getElementById('gameOverlay').classList.remove('active');
        
        // Restart background music
        this.sound.stopBackgroundMusic();
        setTimeout(() => {
            this.sound.startBackgroundMusic();
        }, 500);
    }
    
    toggleSound() {
        this.sound.toggle();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('hits').textContent = this.hits;
        document.getElementById('misses').textContent = this.misses;
        this.updateTargetsLeft();
    }
    
    updateTargetsLeft() {
        document.getElementById('targetsLeft').textContent = '🎯'.repeat(this.targets.length);
    }
    
    showNotification(text, color = '#4afcff') {
        const notif = document.getElementById('notification');
        notif.textContent = text;
        notif.style.background = color;
        notif.classList.add('active');
        setTimeout(() => notif.classList.remove('active'), 1000);
    }
    
    update() {
        if (!this.gameActive) return;
        this.targets.forEach(target => target.update(this.canvas));
    }
    
    draw() {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#1a2639';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#2a3a4a33';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(this.canvas.width, i);
            ctx.stroke();
        }
        
        this.targets.forEach(target => target.draw(ctx));
        
        // Draw crosshair
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.mouseX, this.mouseY, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.mouseX - 25, this.mouseY);
        ctx.lineTo(this.mouseX - 10, this.mouseY);
        ctx.moveTo(this.mouseX + 10, this.mouseY);
        ctx.lineTo(this.mouseX + 25, this.mouseY);
        ctx.moveTo(this.mouseX, this.mouseY - 25);
        ctx.lineTo(this.mouseX, this.mouseY - 10);
        ctx.moveTo(this.mouseX, this.mouseY + 10);
        ctx.lineTo(this.mouseX, this.mouseY + 25);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff33';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`WAVE ${this.wave}`, this.canvas.width - 30, 70);
        
        if (this.sound.muted) {
            ctx.fillStyle = '#ff555533';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🔇 MUTED', 10, this.canvas.height - 20);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
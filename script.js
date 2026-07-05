// --- STATE ---
    const state = {
      stations: [],
      filtered: [],
      currentIndex: -1,
      isPlaying: false,
      isScanning: false,
      volume: 0.7,
      volumeBoost: localStorage.getItem('volumeBoost') === 'true',
      muted: false,
      tab: 'india',
      genre: 'all',
      apiLimit: parseInt(localStorage.getItem('apiLimit')) || 40,
      beatMode: false,
      djMode: false,
      hdMode: false,
      genres: {
        india: [
          { id: 'all', label: '🌐 All' },
          { id: 'hindi', label: 'Hindi' },
          { id: 'bhakti', label: '🕉️Bhakti' },
          { id: 'news', label: 'News' },
          { id: 'bangla', label: 'Bangla' },
          { id: 'music', label: 'Music' },
          { id: 'bollywood', label: 'Bollywood' },
          { id: 'remix', label: 'Remix-DJ' },
          { id: 'classic', label: 'Classic' },
          { id: 'dance', label: 'Dance' },
          { id: 'pop', label: 'Pop' }
        ],
        world: [
          { id: 'all', label: '🌐 All' },
          { id: 'news', label: 'News' },
          { id: 'music', label: 'Music' },
          { id: 'dance', label: 'Dance' },
          { id: 'remix', label: 'Remix' },
          { id: 'dj', label: 'DJ' },
          { id: 'classic', label: 'Classic' },
          { id: 'pop', label: 'Pop' },
          { id: 'retro', label: 'Retro' },
          { id: 'gold', label: 'Gold' },
          { id: 'jazz', label: 'Jazz' },
          { id: 'talk show', label: 'Talk Show' },
          { id: 'us news', label: 'US News' },
          { id: 'bbc news', label: 'BBC News' }
        ]
      },
      savedStations: JSON.parse(localStorage.getItem('savedStations') || '[]'),
      fx: JSON.parse(localStorage.getItem('radioFx') || '{"bass":0,"treble":0,"stereo":0,"dj":false,"beat":false}'),
      theme: localStorage.getItem('radioTheme') || 'digital'
    };

    // --- AUDIO ENGINE ---
    const audio = document.getElementById('audio-player');
    let audioCtx, source, gainNode, bassFilter, trebleFilter, stereoPanner, analyser, compressor, splitter, merger, delayL, delayR;
    let audioInitialized = false;

    const led = document.getElementById('signal-led');
    const npHeader = document.querySelector('.np-header');

    const updateLED = (status) => {
      led.classList.remove('red', 'green');
      npHeader.classList.remove('playing', 'stopped');

      if (status === 'playing') {
        led.classList.add('green');
        npHeader.classList.add('playing');
      } else {
        led.classList.add('red');
        npHeader.classList.add('stopped');
      }
    };

    audio.addEventListener('playing', () => updateLED('playing'));
    audio.addEventListener('pause', () => updateLED('stopped'));
    audio.addEventListener('waiting', () => updateLED('stopped'));
    audio.addEventListener('error', () => updateLED('stopped'));
    audio.addEventListener('emptied', () => updateLED('stopped'));
    audio.addEventListener('stalled', () => updateLED('stopped'));

    function initAudio() {
      if (audioInitialized) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      source = audioCtx.createMediaElementSource(audio);
      gainNode = audioCtx.createGain();
      bassFilter = audioCtx.createBiquadFilter();
      trebleFilter = audioCtx.createBiquadFilter();
      stereoPanner = audioCtx.createStereoPanner();
      compressor = audioCtx.createDynamicsCompressor();

      splitter = audioCtx.createChannelSplitter(2);
      merger = audioCtx.createChannelMerger(2);
      delayL = audioCtx.createDelay();
      delayR = audioCtx.createDelay();

      analyser = audioCtx.createAnalyser();

      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 150;
      bassFilter.gain.value = state.fx.bass;

      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 3000;
      trebleFilter.gain.value = state.fx.treble;

      stereoPanner.pan.value = state.fx.stereo;
      analyser.fftSize = 256;

      // Routing
      source.connect(bassFilter);
      bassFilter.connect(trebleFilter);
      trebleFilter.connect(compressor);

      compressor.connect(splitter);

      splitter.connect(delayL, 0);
      delayL.connect(merger, 0, 0);

      splitter.connect(delayR, 1);
      delayR.connect(merger, 0, 1);

      merger.connect(stereoPanner);
      stereoPanner.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      gainNode.gain.value = (state.muted ? 0 : state.volume) * (state.volumeBoost ? 2.0 : 1.0);
      applyFX();
      audioInitialized = true;
    }

    function applyFX() {
      if (!audioCtx) return;

      let finalBass = state.fx.bass;
      let finalTreble = state.fx.treble;
      let finalStereo = state.fx.stereo;

      if (state.hdMode) {
        finalBass += 4;
        finalTreble += 5;

        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        delayL.delayTime.value = 0;
        delayR.delayTime.value = 0.015; // 15ms Haas effect
      } else {
        compressor.threshold.value = 0;
        compressor.knee.value = 40;
        compressor.ratio.value = 1;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        delayL.delayTime.value = 0;
        delayR.delayTime.value = 0;
      }

      if (state.djMode) {
        finalBass += 6;
        finalTreble -= 3;
        finalStereo = 0.3;
      }

      if (state.beatMode) {
        finalBass += 8; // Heavy beat boost
      }

      bassFilter.gain.value = finalBass;
      trebleFilter.gain.value = finalTreble;
      stereoPanner.pan.value = finalStereo;
    }

    // Replaces applyDJMode

    // --- VISUALIZER ---
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- DANCE LIGHTS ---
    const danceContainer = document.getElementById('dance-container');
    const numDanceLights = 15;
    const danceLights = [];

    function initDanceLights() {
      danceContainer.innerHTML = '';
      for (let i = 0; i < numDanceLights; i++) {
        const light = document.createElement('div');
        light.className = 'dance-light';
        danceContainer.appendChild(light);
        danceLights.push(light);
      }
    }
    initDanceLights();

    function updateDanceLights(dataArray) {
      // Map themes to specific colors
      const hueBase = (state.theme === 'digital-red' ? 0 :
        (state.theme === 'digital-blue' ? 200 :
          (state.theme === 'antygravity' ? 280 : 120)));

      danceLights.forEach((light, i) => {
        // Map each light to a segment of the frequency data for individual "dancing"
        const segmentSize = Math.floor(dataArray.length / numDanceLights);
        const startIdx = i * segmentSize;
        let segmentSum = 0;
        for (let j = 0; j < segmentSize; j++) {
          segmentSum += dataArray[startIdx + j];
        }
        const intensity = segmentSum / segmentSize / 255;

        if (intensity > 0.1) {
          const glow = intensity * 25;
          const brightness = 40 + (intensity * 60);
          const hue = (hueBase + (i * 5)) % 360;

          light.style.background = `hsl(${hue}, 100%, ${brightness}%)`;
          light.style.boxShadow = `0 0 ${glow}px ${glow / 3}px hsl(${hue}, 100%, 50%)`;
          light.style.transform = `scale(${1 + intensity * 0.5})`;
          light.style.opacity = '1';
        } else {
          light.style.background = `rgba(50, 50, 50, 0.3)`;
          light.style.boxShadow = 'none';
          light.style.transform = `scale(1)`;
          light.style.opacity = '0.6';
        }
      });
    }
    let vuNeedleCurrent = 0, vuNeedleL = 0, vuNeedleR = 0;

    function drawVisualizer() {
      if (!analyser) return requestAnimationFrame(drawVisualizer);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Update dance lights
      updateDanceLights(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.theme === 'digital') {
        const numBands = 32;
        const gap = 2;
        const barWidth = (canvas.width / numBands) - gap;
        const blockHeight = 4;
        const totalBlocks = Math.floor(canvas.height / (blockHeight + gap));

        if (!window.digitalPeaks || window.digitalPeaks.length !== numBands) {
          window.digitalPeaks = new Array(numBands).fill(0);
        }

        // Vibrant distinct colors for columns
        const colColors = [
          '#ff3300', '#00ff33', '#00aaff', '#ff00ff', '#ffaa00', 
          '#7700ff', '#00ffcc', '#ff3333', '#99ff00', '#ff00aa', '#ffff00', '#0066ff'
        ];

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const step = Math.floor(bufferLength / numBands);
        
        for (let i = 0; i < numBands; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
             sum += dataArray[i * step + j];
          }
          const val = (sum / step) / 255;
          const numActiveBlocks = Math.min(totalBlocks, Math.floor(totalBlocks * val * 1.5));
          
          if (numActiveBlocks >= window.digitalPeaks[i]) {
            window.digitalPeaks[i] = numActiveBlocks;
          } else {
            window.digitalPeaks[i] = Math.max(0, window.digitalPeaks[i] - 0.25);
          }

          const x = (gap / 2) + i * (barWidth + gap);
          const colColor = colColors[i % colColors.length];

          // Draw background (unlit) blocks
          ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
          for (let j = 0; j < totalBlocks; j++) {
            const y = canvas.height - (j * (blockHeight + gap)) - blockHeight;
            ctx.fillRect(x, y, barWidth, blockHeight);
          }

          // Draw active blocks
          ctx.fillStyle = colColor;
          ctx.shadowBlur = 4;
          ctx.shadowColor = colColor;
          for (let j = 0; j < numActiveBlocks; j++) {
            const y = canvas.height - (j * (blockHeight + gap)) - blockHeight;
            ctx.fillRect(x, y, barWidth, blockHeight);
          }
          
          // Draw peak block
          const peakBlock = Math.min(totalBlocks - 1, Math.floor(window.digitalPeaks[i]));
          if (peakBlock >= 0) {
            ctx.fillStyle = colColor;
            const peakY = canvas.height - (peakBlock * (blockHeight + gap)) - blockHeight;
            ctx.fillRect(x, peakY, barWidth, blockHeight);
          }
          ctx.shadowBlur = 0;
        }
      } else if (state.theme === 'digital-blue') {
        let sumL = 0, sumR = 0;
        for (let i = 0; i < bufferLength; i++) {
          if (i % 2 === 0) sumL += dataArray[i]; 
          else sumR += dataArray[i];
        }
        let volL = Math.min(1, (sumL / (bufferLength / 2)) / 255 * 1.8);
        let volR = Math.min(1, (sumR / (bufferLength / 2)) / 255 * 1.8);

        const barHeight = canvas.height * 0.25;
        const gap = canvas.height * 0.15;
        const startY_L = canvas.height / 2 - barHeight - (gap / 2);
        const startY_R = canvas.height / 2 + (gap / 2);
        
        ctx.fillStyle = 'rgba(0, 221, 255, 0.05)';
        ctx.fillRect(20, startY_L, canvas.width - 20, barHeight);
        ctx.fillRect(20, startY_R, canvas.width - 20, barHeight);
        
        const gradient = ctx.createLinearGradient(20, 0, canvas.width, 0);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.7, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(20, startY_L, (canvas.width - 20) * volL, barHeight);
        ctx.fillRect(20, startY_R, (canvas.width - 20) * volR, barHeight);

        ctx.fillStyle = '#041702';
        for (let x = 20; x < canvas.width; x += 12) {
          ctx.fillRect(x, startY_L, 2, barHeight);
          ctx.fillRect(x, startY_R, 2, barHeight);
        }
        
        ctx.fillStyle = '#00ddff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('L', 2, startY_L + barHeight - 4);
        ctx.fillText('R', 2, startY_R + barHeight - 4);
      } else if (state.theme === 'antygravity') {
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        let vol = (sum / bufferLength) / 255;
        vol = Math.min(1, vol * 2.2);
        vuNeedleCurrent += (vol - vuNeedleCurrent) * 0.2; 

        const cx = canvas.width / 2;
        const cy = canvas.height * 1.1; // Pivot slightly below bottom
        const radius = canvas.height * 0.95;

        // Face Background (Gradient)
        const gradFace = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.5);
        gradFace.addColorStop(0, '#ffffcc'); // Yellowish warm glow
        gradFace.addColorStop(1, '#e5e5e5'); // Cream edges
        ctx.fillStyle = gradFace;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const startAngle = Math.PI * 1.15;
        const endAngle = Math.PI * 1.85;
        const range = endAngle - startAngle;
        
        // 10 segments
        const zeroIndex = 7;
        const totalSegments = 10;
        const zeroAngle = startAngle + (zeroIndex / totalSegments) * range;

        const innerArcRadius = radius * 0.8;

        // Draw Thick Inner Arc
        ctx.beginPath();
        ctx.arc(cx, cy, innerArcRadius, startAngle, zeroAngle);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#111';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, innerArcRadius, zeroAngle, endAngle);
        ctx.lineWidth = 8; // Red band is quite thick
        ctx.strokeStyle = '#d31515';
        ctx.stroke();

        // Draw Thin Outer Arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#111';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const outerLabels = ['20', '10', '7', '5', '3', '2', '1', '0', '1', '2', '3'];

        for (let i = 0; i <= totalSegments; i++) {
          const angle = startAngle + (i / totalSegments) * range;
          const isRed = i > zeroIndex;
          
          // Tick line
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
          ctx.lineTo(cx + Math.cos(angle) * (innerArcRadius - (isRed ? 2 : 6)), cy + Math.sin(angle) * (innerArcRadius - (isRed ? 2 : 6)));
          ctx.lineWidth = isRed ? 2.5 : 2;
          ctx.strokeStyle = isRed ? '#d31515' : '#111';
          ctx.stroke();

          // Outer Label (Rotated)
          ctx.save();
          ctx.translate(cx + Math.cos(angle) * (radius + 15), cy + Math.sin(angle) * (radius + 15));
          ctx.rotate(angle + Math.PI/2);
          ctx.fillStyle = isRed ? '#d31515' : '#111';
          ctx.font = 'bold ' + Math.max(12, radius * 0.12) + 'px sans-serif';
          ctx.fillText(outerLabels[i], 0, 0);
          ctx.restore();
        }

        // Minor ticks
        for (let i = 0; i < totalSegments * 2; i++) {
          if (i % 2 === 0) continue; // Skip major ticks
          const angle = startAngle + (i / (totalSegments * 2)) * range;
          const isRed = (i / 2) > zeroIndex;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
          ctx.lineTo(cx + Math.cos(angle) * (innerArcRadius + (radius - innerArcRadius) * 0.4), cy + Math.sin(angle) * (innerArcRadius + (radius - innerArcRadius) * 0.4));
          ctx.lineWidth = 1;
          ctx.strokeStyle = isRed ? '#d31515' : '#111';
          ctx.stroke();
        }

        // Add inner labels (20, 40, 60, 80, 100%)
        ctx.fillStyle = '#444';
        ctx.font = 'normal ' + Math.max(9, radius * 0.08) + 'px sans-serif';
        const innerLabels = ['20', '40', '60', '80', '100%'];
        for (let i = 0; i < innerLabels.length; i++) {
           const pct = (i + 1) / (innerLabels.length + 0.5); // Space evenly before zero
           const angle = startAngle + pct * (zeroAngle - startAngle);
           ctx.save();
           ctx.translate(cx + Math.cos(angle) * (innerArcRadius - 15), cy + Math.sin(angle) * (innerArcRadius - 15));
           ctx.rotate(angle + Math.PI/2);
           ctx.fillText(innerLabels[i], 0, 0);
           ctx.restore();
        }
        
        // Plus sign at the end
        ctx.save();
        ctx.translate(cx + Math.cos(endAngle + 0.12) * innerArcRadius, cy + Math.sin(endAngle + 0.12) * innerArcRadius);
        ctx.rotate(endAngle + 0.12 + Math.PI/2);
        ctx.fillStyle = '#d31515';
        ctx.font = 'bold ' + Math.max(16, radius * 0.16) + 'px sans-serif';
        ctx.fillText('+', 0, 0);
        ctx.restore();

        // Needle
        const currentAngle = vuNeedleCurrent * range;
        const needleAngle = startAngle + currentAngle;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy); 
        ctx.lineTo(cx + Math.cos(needleAngle) * (radius * 1.26), cy + Math.sin(needleAngle) * (radius * 1.26));
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#111';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Needle Pivot (Large black dome)
        const pivotRadius = radius * 0.28;
        const pivotGrad = ctx.createRadialGradient(cx, cy - pivotRadius*0.1, pivotRadius*0.1, cx, cy, pivotRadius);
        pivotGrad.addColorStop(0, '#333');
        pivotGrad.addColorStop(0.5, '#111');
        pivotGrad.addColorStop(1, '#000');
        
        ctx.beginPath();
        ctx.arc(cx, cy, pivotRadius, 0, Math.PI * 2);
        ctx.fillStyle = pivotGrad;
        ctx.fill();
        
        // Concentric texture rings
        ctx.beginPath();
        ctx.arc(cx, cy, pivotRadius * 0.6, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#222';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx, cy, pivotRadius * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Vintage Dual Analog VU Meters (Left / Right)
        let sumL = 0, sumR = 0;
        for (let i = 0; i < bufferLength; i++) {
          if (i % 2 === 0) sumL += dataArray[i]; 
          else sumR += dataArray[i];
        }
        let volL = Math.min(1, ((sumL / (bufferLength / 2)) / 255) * 2.2);
        let volR = Math.min(1, ((sumR / (bufferLength / 2)) / 255) * 2.2);
        
        vuNeedleL += (volL - vuNeedleL) * 0.15;
        vuNeedleR += (volR - vuNeedleR) * 0.15;

        // Warm vintage backlight
        ctx.fillStyle = '#fdf6e3'; // Warm cream color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw 2 meters
        const meterWidth = canvas.width / 2;
        const cy = canvas.height * 0.9;
        const radius = Math.min(meterWidth * 0.45, canvas.height * 0.8);
        const startAngle = Math.PI * 1.15;
        const endAngle = Math.PI * 1.85;
        const range = endAngle - startAngle;

        const drawMeter = (offsetX, needleVal, label) => {
          const cx = offsetX + meterWidth / 2;
          
          // Outer bezel/shadow for each meter
          ctx.beginPath();
          ctx.rect(offsetX + 5, 5, meterWidth - 10, canvas.height - 10);
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#d3c6b2'; // Vintage trim
          ctx.stroke();
          
          // Meter Arc (black)
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle, endAngle);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#222';
          ctx.stroke();
          
          // Red Zone Arc
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle + range * 0.75, endAngle);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#d32f2f';
          ctx.stroke();

          // Ticks
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (let i = 0; i <= 20; i++) {
            const angle = startAngle + (i / 20) * range;
            const isRed = (i / 20) > 0.75;
            const isMajor = i % 5 === 0;
            const tickLen = isMajor ? radius * 0.12 : radius * 0.06;
            
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.lineTo(cx + Math.cos(angle) * (radius - tickLen), cy + Math.sin(angle) * (radius - tickLen));
            ctx.lineWidth = isMajor ? 1.5 : 1;
            ctx.strokeStyle = isRed ? '#d32f2f' : '#222';
            ctx.stroke();

            // Text for major ticks
            if (isMajor && i % 10 === 0) {
               const val = i === 0 ? '-20' : (i === 10 ? '-10' : (i === 20 ? '+3' : ''));
               ctx.fillStyle = isRed ? '#d32f2f' : '#222';
               ctx.font = 'bold ' + Math.max(9, radius * 0.12) + 'px sans-serif';
               ctx.fillText(val, cx + Math.cos(angle) * (radius - tickLen - 12), cy + Math.sin(angle) * (radius - tickLen - 12));
            }
          }

          // Label
          ctx.fillStyle = '#555';
          ctx.font = 'bold ' + Math.max(10, radius * 0.15) + 'px serif';
          ctx.fillText('VU', cx, cy - radius * 0.45);
          ctx.font = 'normal ' + Math.max(8, radius * 0.1) + 'px sans-serif';
          ctx.fillText(label, cx, cy - radius * 0.28);

          // Needle
          const needleAngle = startAngle + (needleVal * range);
          ctx.beginPath();
          ctx.moveTo(cx, cy); 
          ctx.lineTo(cx + Math.cos(needleAngle) * (radius * 0.95), cy + Math.sin(needleAngle) * (radius * 0.95));
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#111';
          ctx.shadowBlur = 3;
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Pivot Dome
          ctx.beginPath();
          ctx.arc(cx, cy, radius * 0.08, 0, Math.PI * 2);
          ctx.fillStyle = '#111';
          ctx.fill();
        };

        drawMeter(0, vuNeedleL, 'LEFT');
        drawMeter(meterWidth, vuNeedleR, 'RIGHT');
      }
      requestAnimationFrame(drawVisualizer);
    }
    drawVisualizer();

    // --- API & DATA ---
    const API = 'https://de1.api.radio-browser.info/json/stations/search';
    const fetchStations = async (type, genre) => {
      const params = { limit: state.apiLimit, order: 'clickcount', reverse: 'true' };

      if (genre === 'us news') {
        params.tag = 'news';
        params.countrycode = 'US';
      } else if (genre === 'bbc news') {
        params.tag = 'news';
        params.countrycode = 'GB';
      } else if (genre !== 'all') {
        params.tag = genre;
      }

      if (type === 'india') params.countrycode = 'IN';
      else if (type === 'world') {
        // Search globally if no specific country set by genre
        if (!params.countrycode) {
          // Optional: filter for some diverse world regions if desired
          // params.countrycode = ['US', 'GB', 'DE', 'JP', 'BR'][Math.floor(Math.random() * 5)];
        }
      }
      else if (type === 'local') {
        if (!navigator.geolocation) return [];
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              fetch(`${API}?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&radius=100&limit=${state.apiLimit}&order=clickcount`)
                .then(r => r.json()).then(resolve).catch(() => resolve([]));
            },
            () => resolve([])
          );
        });
      }
      return fetch(`${API}?${new URLSearchParams(params)}`).then(r => r.json()).catch(() => []);
    };

    // --- UI RENDERING ---
    const renderStations = () => {
      const list = document.getElementById('station-list');
      if (state.filtered.length === 0) {
        list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">No stations found. Try scanning or changing genre.</p>';
        return;
      }
      list.innerHTML = state.filtered.map((s, i) => `
        <div class="station-card ${i === state.currentIndex ? 'playing' : ''}" data-index="${i}">
          <div class="station-logo" style="position: relative;">
            ${(s.country || s.countrycode) ? `<div style="position: absolute; top: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.55rem; text-align: center; padding: 2px 0; z-index: 2; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.country || s.countrycode}</div>` : ''}
            ${(s.favicon && s.favicon !== 'null')
          ? `<img src="${s.favicon}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><i style="display:none;">📻</i>`
          : '<i>📻</i>'}
          </div>
          <div class="station-info">
            <h3>${s.name}</h3>
            <p>${s.countrycode || 'World'} • ${s.tags || 'General'}</p>
          </div>
        </div>
      `).join('');
      document.querySelectorAll('.station-card').forEach(card => {
        card.onclick = () => playIndex(parseInt(card.dataset.index));
      });
    };

    const playIndex = async (idx, isFromScan = false) => {
      if (!isFromScan && state.isScanning) stopScan();
      if (idx < 0 || idx >= state.filtered.length) return;
      initAudio();
      state.currentIndex = idx;
      const station = state.filtered[idx];
      audio.src = station.url_resolved || station.url;
      audio.play().then(() => {
        state.isPlaying = true;
        updateUI();
        autoSave(station);
      }).catch(e => {
        document.getElementById('status-msg').textContent = '⚠️ Stream failed or blocked by browser security';
        console.error(e);
      });
    };

    const autoSave = (station) => {
      const exists = state.savedStations.find(s => s.stationuuid === station.stationuuid);
      if (!exists) {
        state.savedStations.push(station);
        localStorage.setItem('savedStations', JSON.stringify(state.savedStations));
        document.getElementById('status-msg').textContent = `✅ Auto-saved "${station.name}"`;
      }
    };

    // --- STATION TICKER ---
    let tickerInterval = null;
    let tickerPhase = 'prev'; // 'prev' | 'next'

    function getTickerStationName(phase) {
      const total = state.filtered.length;
      if (total === 0) return '—';
      const idx = state.currentIndex;
      if (phase === 'prev') {
        const pi = idx > 0 ? idx - 1 : total - 1;
        return state.filtered[pi]?.name || '—';
      } else {
        const ni = idx < total - 1 ? idx + 1 : 0;
        return state.filtered[ni]?.name || '—';
      }
    }

    function setTickerContent(phase) {
      const badge = document.getElementById('ticker-badge');
      const label = document.getElementById('ticker-label');
      const name = getTickerStationName(phase);
      badge.className = `ticker-badge ${phase}`;
      badge.textContent = phase === 'prev' ? '⏮ PREV' : '⏭ NEXT';
      label.className = `prev-color fade-in`;
      if (phase === 'next') label.className = 'next-color fade-in';
      label.textContent = name;
    }

    function tickerCycle() {
      const label = document.getElementById('ticker-label');
      // Fade out
      label.classList.remove('fade-in');
      label.classList.add('fade-out');
      setTimeout(() => {
        tickerPhase = tickerPhase === 'prev' ? 'next' : 'prev';
        setTickerContent(tickerPhase);
        label.classList.remove('fade-out');
        label.classList.add('fade-in');
      }, 420);
    }

    function startTicker() {
      if (tickerInterval) return; // already running
      tickerPhase = 'prev';
      setTickerContent('prev');
      document.getElementById('station-ticker').classList.add('visible');
      tickerInterval = setInterval(tickerCycle, 5000); // Run more slowly
    }

    function stopTicker() {
      if (tickerInterval) { clearInterval(tickerInterval); tickerInterval = null; }
      document.getElementById('station-ticker').classList.remove('visible');
    }

    const updateUI = () => {
      const playBtn = document.getElementById('play-btn');
      playBtn.textContent = state.isPlaying ? '⏸' : '▶';
      playBtn.classList.remove('state-play', 'state-pause');
      playBtn.classList.add(state.isPlaying ? 'state-pause' : 'state-play');

      const station = state.filtered[state.currentIndex] || {};
      const titleEl = document.getElementById('np-title');
      const text = station.name || 'No Station Selected';
      let infoStr = '';
      if (station.name) {
        let parts = [];
        if (station.tags) {
          const mainTag = station.tags.split(',')[0].trim();
          if (mainTag) parts.push(mainTag);
        }
        if (station.bitrate && station.bitrate > 0) {
          parts.push(`${station.bitrate} kbps`);
        }
        if (station.countrycode || station.country) {
          parts.push(station.countrycode || station.country);
        }
        if (parts.length > 0) {
          infoStr = ` <span style="font-size: 0.8em; opacity: 0.7; font-weight: normal;">(${parts.join(' • ')})</span>`;
        }
      }
      titleEl.innerHTML = `<span>${text}${infoStr}</span>`;
      titleEl.classList.remove('marquee-active');
      requestAnimationFrame(() => {
        const span = titleEl.querySelector('span');
        if (span && span.scrollWidth > titleEl.clientWidth) {
          titleEl.classList.add('marquee-active');
        }
      });

      const logoImg = document.getElementById('np-logo');
      const logoFallback = document.getElementById('np-logo-fallback');
      if (station.favicon && station.favicon !== 'null') {
        logoImg.src = station.favicon;
        logoImg.style.display = 'block';
        logoFallback.style.display = 'none';
      } else {
        logoImg.style.display = 'none';
        logoFallback.style.display = 'block';
      }

      const npCountry = document.getElementById('np-country');
      if (npCountry) {
        const cName = station.country || station.countrycode;
        if (cName) {
          npCountry.textContent = cName;
          npCountry.style.display = 'block';
        } else {
          npCountry.style.display = 'none';
        }
      }

      const progressWrap = document.getElementById('progress-wrap');
      if (station.isLocal) {
        progressWrap.style.display = 'flex';
      } else {
        progressWrap.style.display = 'none';
      }

      // Update ticker when a station changes (re-seed with fresh prev/next names)
      if (state.isPlaying && state.currentIndex >= 0) {
        if (tickerInterval) {
          // Already running — reset phase so names refresh immediately
          clearInterval(tickerInterval);
          tickerInterval = null;
          tickerPhase = 'prev';
          setTickerContent('prev');
          tickerInterval = setInterval(tickerCycle, 5000); // Run more slowly
        } else {
          startTicker();
        }
      } else {
        stopTicker();
      }

      renderStations();
    };

    // --- EVENT LISTENERS ---

    const syncActiveUI = () => {
      // Sync Tabs
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === state.tab);
      });
      document.querySelectorAll('.min-tab-btn').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === state.tab);
      });
      // Sync Minimized Tab Radio Buttons
      document.querySelectorAll('.min-tab-radio').forEach(r => {
        r.checked = (r.dataset.tab === state.tab);
      });

      // Sync Genres
      document.querySelectorAll('.chip, .min-genre-btn').forEach(c => {
        c.classList.toggle('active', c.dataset.genre === state.genre);
      });

      // Sync Audio Mode Button
      const modeBtn = document.getElementById('audio-mode-btn');
      if (modeBtn) {
        if (state.hdMode) {
          modeBtn.textContent = '🎧 HD Stereo';
          modeBtn.style.borderColor = '#ff00ff';
          modeBtn.style.color = '#ff00ff';
        } else if (state.beatMode) {
          modeBtn.textContent = '🥁 Beat Boost';
          modeBtn.style.borderColor = '#ff9900';
          modeBtn.style.color = '#00e5ff';
        } else if (state.djMode) {
          modeBtn.textContent = '🎛️ DJ Mode';
          modeBtn.style.borderColor = '#00e5ff';
          modeBtn.style.color = '#00e5ff';
        } else {
          modeBtn.textContent = '🎚️ Normal';
          modeBtn.style.borderColor = '#888';
          modeBtn.style.color = '#888';
        }
      }

      // Toggle local tab class on body
      document.body.classList.toggle('tab-local', state.tab === 'local');

      // Ensure genres match current tab
      renderGenres();
    };

    document.querySelectorAll('.tab').forEach(tab => {
      tab.onclick = async () => {
        state.tab = tab.dataset.tab;
        state.genre = 'all'; // Reset genre on tab change
        syncActiveUI();
        document.getElementById('status-msg').textContent = '🔄 Loading stations...';
        state.stations = await fetchStations(state.tab, state.genre);
        state.filtered = state.stations;
        renderStations();
        document.getElementById('status-msg').textContent = 'Loaded';
      };
    });

    const renderGenres = () => {
      const bar = document.getElementById('genre-bar');
      const minBar = document.getElementById('genre-row-min');
      const list = state.genres[state.tab] || state.genres['india'];

      const html = list.map(g => `
        <button class="chip ${g.id === state.genre ? 'active' : ''}" data-genre="${g.id}">${g.label}</button>
      `).join('');

      const minHtml = list.map(g => `
        <button class="min-genre-btn chip ${g.id === state.genre ? 'active' : ''}" data-genre="${g.id}">${g.label.replace(/🌐\s?/, '')}</button>
      `).join('');

      bar.innerHTML = html;
      minBar.innerHTML = minHtml;

      // Re-attach listeners
      bar.querySelectorAll('.chip').forEach(btn => {
        btn.onclick = () => selectGenre(btn.dataset.genre);
      });
      minBar.querySelectorAll('.min-genre-btn').forEach(btn => {
        btn.onclick = () => selectGenre(btn.dataset.genre);
      });
    };

    const selectGenre = async (genre) => {
      state.genre = genre;
      syncActiveUI();
      renderGenres(); // update active state visually

      if (state.tab === 'local_device') return; // Don't fetch genres for local device files

      document.getElementById('status-msg').textContent = `🔄 Loading ${state.genre} stations...`;
      state.stations = await fetchStations(state.tab, state.genre);
      state.filtered = state.stations;
      renderStations();
      document.getElementById('status-msg').textContent = 'Loaded';
    };

    renderGenres();

    // --- LOCAL DEVICE HANDLING ---
    const localDeviceBtn = document.getElementById('local-device-btn');
    const localDeviceInput = document.getElementById('local-device-input');

    if (localDeviceBtn && localDeviceInput) {
      localDeviceBtn.onclick = () => localDeviceInput.click();
      localDeviceInput.onchange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          handleLocalFiles(files);
        }
      };
    }

    function handleLocalFiles(files) {
      state.tab = 'local_device';
      state.genre = 'all';

      const newStations = files.map((file, idx) => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
        favicon: '', // No icon for local files
        stationuuid: 'local-' + Date.now() + '-' + idx,
        tags: 'Local Audio',
        isLocal: true
      }));

      state.stations = newStations;
      state.filtered = newStations;

      syncActiveUI();
      renderStations();
      document.getElementById('status-msg').textContent = `Loaded ${files.length} local files`;

      if (newStations.length > 0) {
        playIndex(0);
      }
    }

    document.getElementById('play-btn').onclick = () => {
      if (state.isScanning) stopScan();
      initAudio();
      if (audio.paused && state.currentIndex >= 0) {
        audio.play();
        state.isPlaying = true;
      } else if (!audio.paused) {
        audio.pause();
        state.isPlaying = false;
      } else if (state.currentIndex === -1 && state.filtered.length > 0) {
        playIndex(0);
      }
      updateUI();
    };

    document.getElementById('prev-btn').onclick = () => {
      if (state.currentIndex > 0) playIndex(state.currentIndex - 1);
      else if (state.filtered.length > 0) playIndex(state.filtered.length - 1);
    };

    document.getElementById('next-btn').onclick = () => {
      if (state.currentIndex < state.filtered.length - 1) playIndex(state.currentIndex + 1);
      else if (state.filtered.length > 0) playIndex(0);
    };

    document.getElementById('api-limit').addEventListener('change', (e) => {
      state.apiLimit = parseInt(e.target.value) || 40;
      localStorage.setItem('apiLimit', state.apiLimit);
      document.getElementById('status-msg').textContent = '🔄 Loading stations...';
      fetchStations(state.tab, state.genre, state.apiLimit).then(data => {
        state.stations = data;
        state.filtered = data;
        renderStations();
        document.getElementById('status-msg').textContent = 'Loaded';
      });
    });

    const boostCheck = document.getElementById('boost-check');
    boostCheck.checked = state.volumeBoost;
    boostCheck.onchange = (e) => {
      state.volumeBoost = e.target.checked;
      if (gainNode) gainNode.gain.value = (state.muted ? 0 : state.volume) * (state.volumeBoost ? 2.0 : 1.0);
      localStorage.setItem('volumeBoost', state.volumeBoost);
    };

    document.getElementById('vol-slider').oninput = (e) => {
      state.volume = parseFloat(e.target.value);
      if (gainNode) gainNode.gain.value = (state.muted ? 0 : state.volume) * (state.volumeBoost ? 2.0 : 1.0);
      localStorage.setItem('radioVol', state.volume);
    };

    const progressSlider = document.getElementById('progress-slider');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    let isSeeking = false;

    function formatTime(seconds) {
      if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    audio.addEventListener('timeupdate', () => {
      if (!isSeeking && audio.duration) {
        progressSlider.value = (audio.currentTime / audio.duration) * 100;
        timeCurrent.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    progressSlider.addEventListener('input', (e) => {
      isSeeking = true;
      if (audio.duration) {
        timeCurrent.textContent = formatTime((e.target.value / 100) * audio.duration);
      }
    });

    progressSlider.addEventListener('change', (e) => {
      if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
      }
      isSeeking = false;
    });

    document.getElementById('mute-btn').onclick = () => {
      state.muted = !state.muted;
      if (gainNode) gainNode.gain.value = (state.muted ? 0 : state.volume) * (state.volumeBoost ? 2.0 : 1.0);
      document.getElementById('mute-btn').textContent = state.muted ? '🔇' : '🔊';
    };

    // --- REGION TOGGLE BUTTON ---
    const regionToggleBtn = document.getElementById('region-toggle-btn');
    regionToggleBtn.onclick = async () => {
      if (state.tab === 'india') {
        state.tab = 'world';
        regionToggleBtn.textContent = '🌍 World';
        regionToggleBtn.style.borderColor = '#00e5ff';
        regionToggleBtn.style.color = '#00e5ff';
      } else {
        state.tab = 'india';
        regionToggleBtn.textContent = '🇮🇳 Indian FM';
        regionToggleBtn.style.borderColor = 'var(--accent)';
        regionToggleBtn.style.color = '#00e5ff';
      }
      state.genre = 'all';
      syncActiveUI();
      document.getElementById('status-msg').textContent = '🔄 Loading stations...';
      state.stations = await fetchStations(state.tab, state.genre);
      state.filtered = state.stations;
      renderStations();
      document.getElementById('status-msg').textContent = 'Loaded';
    };

    // FX Listeners (Synced)
    ['bass', 'treble', 'stereo'].forEach(fx => {
      const mainInput = document.getElementById(`fx-${fx}`);
      const minInput = document.getElementById(`fx-${fx}-min`);

      const updateValue = (val) => {
        state.fx[fx] = parseFloat(val);
        if (mainInput) mainInput.value = val;
        if (minInput) minInput.value = val;
        applyFX();
        localStorage.setItem('radioFx', JSON.stringify(state.fx));
      };

      if (mainInput) mainInput.oninput = (e) => updateValue(e.target.value);
      if (minInput) minInput.oninput = (e) => updateValue(e.target.value);
    });

    // --- AUDIO MODE CYCLE BUTTON ---
    const audioModeBtn = document.getElementById('audio-mode-btn');
    const modes = [
      { label: '🎚️ Normal', beat: false, dj: false, hd: false, color: '#d9f505' },
      { label: '🎧 HD Stereo', beat: false, dj: false, hd: true, color: '#ff00ff' },
      { label: '🥁 Beat Boost', beat: true, dj: false, hd: false, color: '#4ae004' },
      { label: '🎛️ DJ Mode', beat: false, dj: true, hd: false, color: '#00e5ff' }
    ];
    let currentMode = 0;

    function applyAudioMode(idx) {
      currentMode = idx;
      const m = modes[idx];
      state.beatMode = m.beat;
      state.djMode = m.dj;
      state.hdMode = m.hd;
      state.fx.beat = m.beat;
      state.fx.dj = m.dj;
      state.fx.hd = m.hd;
      audioModeBtn.textContent = m.label;
      audioModeBtn.style.borderColor = m.color;
      audioModeBtn.style.color = m.color;
      applyFX();
      localStorage.setItem('radioFx', JSON.stringify(state.fx));
    }

    if (audioModeBtn) {
      // Restore saved mode
      if (state.fx.hd) currentMode = 1;
      else if (state.fx.beat) currentMode = 2;
      else if (state.fx.dj) currentMode = 3;
      applyAudioMode(currentMode);

      audioModeBtn.onclick = () => applyAudioMode((currentMode + 1) % modes.length);
    }


    // --- THEME & MINIMIZE ENGINE ---
    const themesList = ['digital', 'digital-blue', 'antygravity'];
    const themeIcons = { 'digital': '📟', 'digital-blue': '📟', 'antygravity': '🛸' };
    const themeCycleBtn = document.getElementById('theme-cycle-btn');

    function applyTheme(theme) {
      if (!themesList.includes(theme)) theme = 'digital';
      document.body.classList.remove('theme-digital', 'theme-digital-blue', 'theme-antygravity');

      if (theme.startsWith('digital') || theme === 'antygravity') {
        document.body.classList.add('theme-digital');
      }
      document.body.classList.add(`theme-${theme}`);
      state.theme = theme;
      if (themeCycleBtn) {
        themeCycleBtn.innerText = themeIcons[theme] || '📟';
      }
      localStorage.setItem('radioTheme', theme);
    }

    if (themeCycleBtn) {
      themeCycleBtn.onclick = () => {
        const currentIndex = themesList.indexOf(state.theme);
        const nextTheme = themesList[(currentIndex + 1) % themesList.length];
        applyTheme(nextTheme);
      };
    }



    // Toggle station list visibility
    const sectionTitleBtn = document.querySelector('.section-title');
    sectionTitleBtn.onclick = () => {
      const isHidden = document.getElementById('station-list').classList.toggle('hide-names');
      sectionTitleBtn.textContent = isHidden ? 'Show List' : 'Hide List';
    };

    applyTheme(state.theme);
    updateLED('stopped');
    updateUI();

    // Restore settings
    const savedVol = localStorage.getItem('radioVol');
    if (savedVol) {
      state.volume = parseFloat(savedVol);
      document.getElementById('vol-slider').value = state.volume;
    }
    if (state.fx.dj || state.fx.beat || state.fx.hd) {
      state.djMode = state.fx.dj;
      state.beatMode = state.fx.beat;
      state.hdMode = state.fx.hd;
      syncActiveUI();
      // Sync initial slider values
      ['bass', 'treble', 'stereo'].forEach(fx => {
        const val = state.fx[fx];
        const mainInput = document.getElementById(`fx-${fx}`);
        const minInput = document.getElementById(`fx-${fx}-min`);
        if (mainInput) mainInput.value = val;
        if (minInput) minInput.value = val;
      });
    }


    // Drag to scroll functionality for genre rows
    function makeScrollable(ele) {
      if (!ele) return;
      let isDown = false;
      let startX;
      let scrollLeft;

      ele.addEventListener('mousedown', (e) => {
        isDown = true;
        ele.style.cursor = 'grabbing';
        startX = e.pageX - ele.offsetLeft;
        scrollLeft = ele.scrollLeft;
      });
      ele.addEventListener('mouseleave', () => {
        isDown = false;
        ele.style.cursor = 'grab';
      });
      ele.addEventListener('mouseup', () => {
        isDown = false;
        ele.style.cursor = 'grab';
      });
      ele.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - ele.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        ele.scrollLeft = scrollLeft - walk;
      });
    }

    makeScrollable(document.getElementById('genre-row-min'));
    makeScrollable(document.getElementById('genre-bar'));

    // Init with default tab (Indian FM)
    document.getElementById('status-msg').textContent = '🔄 Loading Indian FM...';
    fetchStations('india', 'all').then(data => {
      state.stations = data;
      state.filtered = data;
      renderStations();
      document.getElementById('status-msg').textContent = 'Loaded';
    });
    // --- SCAN FEATURE ---
    let scanTimer = null;
    let scanTimeout = null;

    function stopScan() {
      state.isScanning = false;
      const scanBtn = document.getElementById('scan-btn');
      if (scanBtn) {
        scanBtn.textContent = 'SCAN';
        scanBtn.style.background = 'var(--accent)';
      }
      clearTimeout(scanTimer);
      clearTimeout(scanTimeout);
    }

    document.getElementById('scan-btn').onclick = () => {
      if (state.isScanning) {
        stopScan();
      } else {
        if (state.filtered.length === 0) return;
        state.isScanning = true;
        document.getElementById('scan-btn').textContent = 'STOP';
        document.getElementById('scan-btn').style.background = 'var(--danger)';
        
        let startIdx = state.currentIndex >= 0 ? state.currentIndex : 0;
        playScanIndex(startIdx);
      }
    };

    function playScanIndex(idx) {
      if (!state.isScanning) return;
      clearTimeout(scanTimer);
      clearTimeout(scanTimeout);
      
      if (idx >= state.filtered.length) {
        stopScan(); // Done scanning
        return;
      }
      
      playIndex(idx, true); // true = isFromScan
      
      // Wait 4 seconds to see if it starts playing. If not, skip to next.
      scanTimeout = setTimeout(() => {
        if (!state.isPlaying || audio.paused || audio.readyState === 0) {
          playScanIndex(idx + 1);
        }
      }, 4000);
      
      // Allow playing for 10 seconds total, then move to next
      scanTimer = setTimeout(() => {
        playScanIndex(idx + 1);
      }, 10000);
    }
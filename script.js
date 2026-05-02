// --- STATE ---
    const state = {
      stations: [],
      filtered: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 0.7,
      muted: false,
      tab: 'india',
      genre: 'all',
      djMode: false,
      savedStations: JSON.parse(localStorage.getItem('savedStations') || '[]'),
      fx: JSON.parse(localStorage.getItem('radioFx') || '{"bass":0,"treble":0,"stereo":0,"dj":false}'),
      theme: localStorage.getItem('radioTheme') || 'default'
    };

    // --- AUDIO ENGINE ---
    const audio = document.getElementById('audio-player');
    let audioCtx, source, gainNode, bassFilter, trebleFilter, stereoPanner, analyser;
    let audioInitialized = false;

    const led = document.getElementById('signal-led');
    const updateLED = (status) => {
      led.classList.remove('red', 'green');
      if (status === 'playing') led.classList.add('green');
      else led.classList.add('red');
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
      analyser = audioCtx.createAnalyser();

      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 150;
      bassFilter.gain.value = state.fx.bass;

      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 3000;
      trebleFilter.gain.value = state.fx.treble;

      stereoPanner.pan.value = state.fx.stereo;
      analyser.fftSize = 256;

      source.connect(bassFilter);
      bassFilter.connect(trebleFilter);
      trebleFilter.connect(stereoPanner);
      stereoPanner.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      gainNode.gain.value = state.muted ? 0 : state.volume;
      applyDJMode();
      audioInitialized = true;
    }

    function applyDJMode() {
      if (!audioCtx) return;
      if (state.djMode) {
        bassFilter.gain.value = 6;
        trebleFilter.gain.value = -3;
        stereoPanner.pan.value = 0.3;
      } else {
        bassFilter.gain.value = state.fx.bass;
        trebleFilter.gain.value = state.fx.treble;
        stereoPanner.pan.value = state.fx.stereo;
      }
    }

    // --- VISUALIZER ---
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = 60;
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
      const hueBase = (state.theme === 'neon') ? 320 : (state.theme === 'dark' ? 240 : 210);

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
          light.style.boxShadow = `0 0 ${glow}px ${glow/3}px hsl(${hue}, 100%, 50%)`;
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

    function drawVisualizer() {
      if (!analyser) return requestAnimationFrame(drawVisualizer);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Update dance lights
      updateDanceLights(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      let totalIntensity = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        totalIntensity += dataArray[i];
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      // Update Mini Loudspeakers "Jump"
      if (totalIntensity > 0) {
        const avgIntensity = (totalIntensity / bufferLength) / 255;
        const scale = 1 + (avgIntensity * 0.3); // Jump effect
        document.querySelectorAll('.speaker-cone-mini').forEach(cone => {
          cone.style.transform = `scale(${scale})`;
        });
      } else {
        document.querySelectorAll('.speaker-cone-mini').forEach(cone => {
          cone.style.transform = `scale(1)`;
        });
      }

      requestAnimationFrame(drawVisualizer);
    }
    drawVisualizer();

    // --- API & DATA ---
    const API = 'https://de1.api.radio-browser.info/json/stations/search';
    const fetchStations = async (type, genre) => {
      const params = { limit: 40, order: 'clickcount', reverse: 'true' };
      if (genre !== 'all') params.tag = genre;
      if (type === 'india') params.countrycode = 'IN';
      else if (type === 'world') params.countrycode = ['US', 'GB', 'DE', 'JP', 'BR'][Math.floor(Math.random() * 5)];
      else if (type === 'local') {
        if (!navigator.geolocation) return [];
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              fetch(`${API}?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&radius=100&limit=30&order=clickcount`)
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
          <div class="station-logo">
            ${s.favicon
          ? `<img src="${s.favicon}" onerror="this.parentElement.innerHTML='<i>📻</i>'">`
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

    const playIndex = async (idx) => {
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

    const updateUI = () => {
      document.getElementById('play-btn').textContent = state.isPlaying ? '⏸' : '▶';
      const station = state.filtered[state.currentIndex] || {};
      document.getElementById('np-title').textContent = station.name || 'No Station Selected';
      document.getElementById('np-meta').textContent = station.tags || 'Select a station to play';

      // Update Digital Display
      if (state.currentIndex >= 0) {
        // Create a pseudo-frequency if none exists
        const freq = station.freq || (90 + (state.currentIndex % 20) + (state.currentIndex % 10) / 10).toFixed(1);
        document.getElementById('digi-freq').textContent = freq;
        document.getElementById('digi-meta').textContent = station.name.substring(0, 15).toUpperCase();
      } else {
        document.getElementById('digi-freq').textContent = '--.-';
        document.getElementById('digi-meta').textContent = 'OFF AIR';
      }
      renderStations();
    };

    // --- EVENT LISTENERS ---
    document.getElementById('scan-btn').onclick = async () => {
      document.getElementById('status-msg').textContent = '📡 Scanning local FM...';
      state.stations = await fetchStations('local', 'all');
      state.filtered = state.stations;
      renderStations();
      document.getElementById('status-msg').textContent = `✅ Found ${state.stations.length} local stations`;
    };

    document.querySelectorAll('.tab').forEach(tab => {
      tab.onclick = async () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.tab = tab.dataset.tab;
        document.getElementById('status-msg').textContent = '🔄 Loading stations...';
        state.stations = await fetchStations(state.tab, state.genre);
        state.filtered = state.stations;
        renderStations();
        document.getElementById('status-msg').textContent = 'Loaded';
      };
    });

    document.querySelectorAll('.chip').forEach(chip => {
      chip.onclick = async () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.genre = chip.dataset.genre;
        document.getElementById('status-msg').textContent = `🔄 Loading ${state.genre} stations...`;
        state.stations = await fetchStations(state.tab, state.genre);
        state.filtered = state.stations;
        renderStations();
        document.getElementById('status-msg').textContent = 'Loaded';
      };
    });

    document.getElementById('play-btn').onclick = () => {
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

    document.getElementById('vol-slider').oninput = (e) => {
      state.volume = parseFloat(e.target.value);
      if (gainNode) gainNode.gain.value = state.muted ? 0 : state.volume;
      localStorage.setItem('radioVol', state.volume);
    };

    document.getElementById('mute-btn').onclick = () => {
      state.muted = !state.muted;
      if (gainNode) gainNode.gain.value = state.muted ? 0 : state.volume;
      document.getElementById('mute-btn').textContent = state.muted ? '🔇' : '🔊';
    };

    // FX Listeners
    ['bass', 'treble'].forEach(fx => {
      document.getElementById(`fx-${fx}`).oninput = (e) => {
        state.fx[fx] = parseFloat(e.target.value);
        if (bassFilter && fx === 'bass') bassFilter.gain.value = state.fx.bass;
        if (trebleFilter && fx === 'treble') trebleFilter.gain.value = state.fx.treble;
        if (!state.djMode) applyDJMode();
        localStorage.setItem('radioFx', JSON.stringify(state.fx));
      };
    });

    document.getElementById('fx-stereo').oninput = (e) => {
      state.fx.stereo = parseFloat(e.target.value);
      if (stereoPanner) stereoPanner.pan.value = state.fx.stereo;
      if (!state.djMode) applyDJMode();
      localStorage.setItem('radioFx', JSON.stringify(state.fx));
    };

    document.getElementById('fx-dj').onclick = () => {
      state.djMode = !state.djMode;
      state.fx.dj = state.djMode;
      const btn = document.getElementById('fx-dj');
      const stateSpan = document.getElementById('dj-state');
      stateSpan.textContent = state.djMode ? 'ON' : 'OFF';
      if (state.djMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      applyDJMode();
      localStorage.setItem('radioFx', JSON.stringify(state.fx));
    };


    // --- THEME & MINIMIZE ENGINE ---
    function applyTheme(theme) {
      if (theme === 'light') theme = 'default';
      document.body.classList.remove('theme-neon', 'theme-dark');
      if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
      }
      state.theme = theme;
      const radio = document.getElementById(`t-${theme}`);
      if (radio) radio.checked = true;
      localStorage.setItem('radioTheme', theme);
    }

    document.querySelectorAll('input[name="theme"]').forEach(r => {
      r.onchange = (e) => applyTheme(e.target.value);
    });

    const minBtn = document.getElementById('minimize-btn');
    const maxBtn = document.getElementById('maximize-btn');

    minBtn.onclick = () => document.body.classList.add('minimized');
    maxBtn.onclick = () => document.body.classList.remove('minimized');

    applyTheme(state.theme);

    // Restore settings
    const savedVol = localStorage.getItem('radioVol');
    if (savedVol) {
      state.volume = parseFloat(savedVol);
      document.getElementById('vol-slider').value = state.volume;
    }
    if (state.fx.dj) {
      state.djMode = true;
      document.getElementById('dj-state').textContent = 'ON';
      document.getElementById('fx-dj').classList.add('active');
      document.getElementById('fx-bass').value = state.fx.bass;
      document.getElementById('fx-treble').value = state.fx.treble;
      document.getElementById('fx-stereo').value = state.fx.stereo;
    }


    // Init with default tab (Indian FM)
    document.getElementById('status-msg').textContent = '🔄 Loading Indian FM...';
    fetchStations('india', 'all').then(data => {
      state.stations = data;
      state.filtered = data;
      renderStations();
      document.getElementById('status-msg').textContent = 'Loaded';
    });
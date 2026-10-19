(() => {
  const experience = document.querySelector('#experience');
  const scene = document.querySelector('#scene');
  const enterButton = document.querySelector('#enter-button');
  const pauseButton = document.querySelector('#pause-button');
  const motionButton = document.querySelector('#motion-button');
  const motionButtonLabel = document.querySelector('#motion-button-label');
  const pausedScreen = document.querySelector('#paused-screen');
  const introScreen = document.querySelector('#intro-screen');
  const motionToggle = document.querySelector('#motion-toggle');
  const motionNote = document.querySelector('#motion-note');
  const storyProgress = document.querySelector('#story-progress strong');
  const progressDots = [...document.querySelectorAll('#progress-dots span')];
  const caption = document.querySelector('#story-caption');
  const captionKicker = document.querySelector('#caption-kicker');
  const captionText = document.querySelector('#caption-text');
  const hintCard = document.querySelector('#hint-card');
  const hintText = document.querySelector('#hint-text');
  const bottomNote = document.querySelector('#bottom-note');
  const liveStatus = document.querySelector('#live-status');
  const hotspots = [...document.querySelectorAll('.hotspot')];
  const defaultHotspotLabels = hotspots.map((hotspot) => hotspot.getAttribute('aria-label'));
  const wordmark = document.querySelector('.wordmark');
  const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stories = {
    lantern: {
      title: 'The Lantern Keeper',
      cues: [
        [0, 'The old lantern gives a sleepy blink.'],
        [2200, 'A string of tiny lights gathers along the rails.'],
        [5000, 'One last window winks from the tunnel.']
      ],
      notes: [[0, 660], [2400, 880], [5100, 523]]
    },
    ticket: {
      title: 'A Ticket for the Moon',
      cues: [
        [0, 'A forgotten ticket stirs in the booth.'],
        [2200, 'Its little holes turn into a trail of stars.'],
        [5000, 'It lands, stamped: one way home.']
      ],
      notes: [[0, 587], [2400, 740], [5100, 494]]
    },
    bell: {
      title: 'The Cave Answers',
      cues: [
        [0, 'The platform bell rings into the dark.'],
        [2200, 'A silver echo winds through the tunnel.'],
        [5000, 'The cave sends back a friendly wave.']
      ],
      notes: [[0, 698], [2400, 880], [5100, 659]]
    }
  };
  const hints = [
    [26000, 'The tunnel is not the only thing in this cave with a light to give.'],
    [61000, 'The station’s most forgotten traveler may have left a paper trail.'],
    [108000, 'A little ring could wake something hiding in the cave’s echo.']
  ];
  let started = false;
  let paused = false;
  let reducedMotion = reducedMotionPreference.matches;
  let audioContext = null;
  let audioReady = false;
  let masterGain = null;
  let storyId = null;
  let storyElapsed = 0;
  let storyCueIndex = 0;
  let sceneElapsed = 0;
  let hintIndex = 0;
  let currentHint = '';
  let lastFrame = 0;
  let animationFrame = 0;
  const foundStories = new Set();

  motionToggle.checked = reducedMotion;
  applyMotionPreference();

  function applyMotionPreference() {
    experience.classList.toggle('reduced-motion', reducedMotion);
    motionNote.textContent = reducedMotion ? 'Motion is minimized' : 'Gentle movement is on';
    motionButton.setAttribute('aria-pressed', String(reducedMotion));
    motionButton.setAttribute('aria-label', reducedMotion ? 'Turn off reduced motion' : 'Turn on reduced motion');
    motionButtonLabel.textContent = reducedMotion ? 'Reduced' : 'Motion';
  }

  function updateHotspots() {
    const unavailable = !started || paused || storyId !== null;
    for (const hotspot of hotspots) hotspot.disabled = unavailable;
  }

  function setStatus(message) {
    liveStatus.textContent = message;
  }

  function updateProgress() {
    storyProgress.textContent = `${foundStories.size} / 3`;
    hotspots.forEach((hotspot, index) => {
      const found = foundStories.has(hotspot.dataset.story);
      progressDots[index].classList.toggle('found', found);
      hotspot.setAttribute('aria-label', found
        ? `${stories[hotspot.dataset.story].title} — discovered; activate to replay`
        : defaultHotspotLabels[index]);
    });
    if (foundStories.size === 3) bottomNote.textContent = 'All three stories found — ride again whenever you like';
  }

  function createAudio() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      setStatus('Audio is not available in this browser. The stories will still play visually.');
      return false;
    }

    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.42;
    masterGain.connect(audioContext.destination);

    const droneGain = audioContext.createGain();
    droneGain.gain.value = 0.022;
    droneGain.connect(masterGain);
    [55, 82.41].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const voiceGain = audioContext.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      voiceGain.gain.value = index === 0 ? 0.7 : 0.3;
      oscillator.connect(voiceGain);
      voiceGain.connect(droneGain);
      oscillator.start();
    });

    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * 0.22;
    const noise = audioContext.createBufferSource();
    const lowPass = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 240;
    noiseGain.gain.value = 0.16;
    noise.connect(lowPass);
    lowPass.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();

    audioReady = true;
    return true;
  }

  function playTone(frequency, duration = 0.48) {
    if (!audioReady || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, frequency * 0.72), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(masterGain || audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  async function enterScene() {
    if (started) return;
    started = true;
    sceneElapsed = 0;
    experience.classList.add('started');
    introScreen.classList.add('dismissed');
    pauseButton.disabled = false;
    motionButton.disabled = false;
    updateHotspots();
    setStatus('Welcome to Platform Zero. Explore the lantern, ticket booth, and bell.');
    try {
      if (createAudio()) {
        await audioContext.resume();
      }
    } catch (error) {
      console.error('Unable to initialize or start ambient audio:', error);
      audioReady = false;
      if (audioContext && audioContext.state !== 'closed') await audioContext.close();
      audioContext = null;
      setStatus('Audio could not start. The stories will still play visually.');
    }
    lastFrame = performance.now();
    animationFrame = requestAnimationFrame(tick);
  }

  async function togglePause() {
    if (!started) return;
    paused = !paused;
    experience.classList.toggle('paused', paused);
    pausedScreen.hidden = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.querySelector('.pause-label').textContent = paused ? 'Resume' : 'Pause';
    pauseButton.querySelector('.pause-icon').textContent = paused ? '▶' : 'Ⅱ';
    updateHotspots();
    setStatus(paused ? 'Station paused. Motion, sound, and story time are on hold.' : 'Station resumed.');

    const context = audioContext;
    if (context) {
      try {
        await (paused ? context.suspend() : context.resume());
      } catch (error) {
        if (audioContext !== context) return;
        console.error('Unable to update audio playback state:', error);
        audioReady = false;
        if (masterGain && context.state === 'running') masterGain.gain.setTargetAtTime(0, context.currentTime, 0.03);
        setStatus('Audio could not change state and has been muted. Visual playback continues.');
      }
    }
    lastFrame = performance.now();
  }

  function resetScene() {
    started = false;
    paused = false;
    storyId = null;
    storyElapsed = 0;
    storyCueIndex = 0;
    sceneElapsed = 0;
    hintIndex = 0;
    currentHint = '';
    foundStories.clear();

    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => console.error('Unable to close audio context:', error));
    }
    audioContext = null;
    masterGain = null;
    audioReady = false;

    experience.classList.remove('started', 'paused');
    scene.classList.remove('story-running', 'story-lantern', 'story-ticket', 'story-bell', 'stage-1', 'stage-2', 'stage-3');
    introScreen.classList.remove('dismissed');
    pausedScreen.hidden = true;
    caption.hidden = true;
    captionKicker.textContent = '';
    captionText.textContent = '';
    hintCard.hidden = true;
    hintText.textContent = '';
    pauseButton.disabled = true;
    pauseButton.setAttribute('aria-pressed', 'false');
    pauseButton.querySelector('.pause-label').textContent = 'Pause';
    pauseButton.querySelector('.pause-icon').textContent = 'Ⅱ';
    motionButton.disabled = true;
    bottomNote.textContent = 'Tap the little lights to uncover a story';
    updateProgress();
    updateHotspots();
    setStatus('Station reset. Enter the station when you are ready.');
  }

  function startStory(id) {
    if (paused || storyId !== null || !stories[id]) return;
    storyId = id;
    storyElapsed = 0;
    storyCueIndex = 0;
    scene.classList.add('story-running', `story-${id}`, 'stage-1');
    caption.hidden = false;
    hintCard.hidden = true;
    captionKicker.textContent = `A PLATFORM STORY · ${stories[id].title}`;
    captionText.textContent = stories[id].cues[0][1];
    bottomNote.textContent = 'Listen close — the cave is telling a story';
    playTone(stories[id].notes[0][1], 0.65);
    setStatus(`${stories[id].title} begins. Other scene objects are unavailable until it ends.`);
    updateHotspots();
  }

  function finishStory() {
    const completedStory = storyId;
    if (!completedStory) return;
    foundStories.add(completedStory);
    updateProgress();
    scene.classList.remove('story-running', `story-${completedStory}`, 'stage-1', 'stage-2', 'stage-3');
    storyId = null;
    storyElapsed = 0;
    storyCueIndex = 0;
    caption.hidden = true;
    bottomNote.textContent = foundStories.size === 3
      ? 'All three stories found — ride again whenever you like'
      : 'The station settles. Keep exploring when you are ready.';
    setStatus(`${stories[completedStory].title} complete. ${foundStories.size} of 3 stories found.`);
    updateHotspots();
    showDueHint();
  }

  function updateStory(delta) {
    if (!storyId) return;
    storyElapsed += delta;
    const story = stories[storyId];
    const nextCueIndex = story.cues.findIndex((cue, index) => index > storyCueIndex && storyElapsed >= cue[0]);
    if (nextCueIndex !== -1) {
      storyCueIndex = nextCueIndex;
      captionText.textContent = story.cues[storyCueIndex][1];
      scene.classList.remove('stage-1', 'stage-2');
      scene.classList.add(storyCueIndex === 2 ? 'stage-3' : 'stage-2');
      playTone(story.notes[storyCueIndex][1]);
    }
    if (storyElapsed >= 7500) finishStory();
  }

  function showDueHint() {
    const previousHintIndex = hintIndex;
    while (hintIndex < hints.length && sceneElapsed >= hints[hintIndex][0]) {
      currentHint = hints[hintIndex][1];
      hintIndex += 1;
    }
    if (storyId || !currentHint) return;
    hintText.textContent = currentHint;
    hintCard.hidden = false;
    if (hintIndex !== previousHintIndex) setStatus(`A new clue: ${currentHint}`);
  }

  function tick(now) {
    if (!started) return;
    const delta = Math.max(now - lastFrame, 0);
    lastFrame = now;
    if (!paused) {
      sceneElapsed += delta;
      if (storyId) updateStory(delta);
      else showDueHint();
    }
    animationFrame = requestAnimationFrame(tick);
  }

  enterButton.addEventListener('click', enterScene);
  wordmark.addEventListener('click', (event) => {
    event.preventDefault();
    resetScene();
  });
  pauseButton.addEventListener('click', togglePause);
  motionButton.addEventListener('click', () => {
    reducedMotion = !reducedMotion;
    motionToggle.checked = reducedMotion;
    applyMotionPreference();
    setStatus(reducedMotion ? 'Reduced motion enabled.' : 'Gentle motion enabled.');
  });
  motionToggle.addEventListener('change', () => {
    reducedMotion = motionToggle.checked;
    applyMotionPreference();
    setStatus(reducedMotion ? 'Reduced motion enabled.' : 'Gentle motion enabled.');
  });
  hotspots.forEach((hotspot) => {
    hotspot.addEventListener('click', () => startStory(hotspot.dataset.story));
  });
  reducedMotionPreference.addEventListener?.('change', (event) => {
    if (!started) {
      reducedMotion = event.matches;
      motionToggle.checked = reducedMotion;
      applyMotionPreference();
    }
  });

  window.addEventListener('pagehide', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => console.error('Unable to close audio context:', error));
    }
  });
})();

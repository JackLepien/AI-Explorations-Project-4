(() => {
  const experience = document.querySelector('#experience');
  const scene = document.querySelector('#scene');
  const enterButton = document.querySelector('#enter-button');
  const wordmark = document.querySelector('.wordmark');
  const pauseButton = document.querySelector('#pause-button');
  const motionButton = document.querySelector('#motion-button');
  const motionButtonLabel = document.querySelector('#motion-button-label');
  const pausedScreen = document.querySelector('#paused-screen');
  const introScreen = document.querySelector('#intro-screen');
  const motionToggle = document.querySelector('#motion-toggle');
  const motionNote = document.querySelector('#motion-note');
  const storyProgress = document.querySelector('#story-progress');
  const progressDots = [...document.querySelectorAll('#progress-dots span')];
  const storyCard = document.querySelector('#story-card');
  const storyKicker = document.querySelector('#story-kicker');
  const storyLine = document.querySelector('#story-line');
  const stepTrack = document.querySelector('#step-track');
  const hintCard = document.querySelector('#hint-card');
  const hintText = document.querySelector('#hint-text');
  const bottomNote = document.querySelector('#bottom-note');
  const liveStatus = document.querySelector('#live-status');
  const targets = [...document.querySelectorAll('.target')];
  const ghostToken = document.querySelector('#ghost-token');
  const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stories = {
    lantern: {
      title: 'The Midnight Conductor',
      steps: 2,
      opening: 'A quiet glow flickers inside the engine. Perhaps the train is waiting for someone.',
      progressLines: [
        'The headlamp wakes. A little ghost drifts closer through the steam.',
        'The conductor takes the controls. The pumpkin train rolls into its midnight story.'
      ],
      targets: ['lamp', 'cab']
    },
    ghosts: {
      title: 'Passengers of the Mist',
      steps: 2,
      opening: 'A sleepy passenger floats beside the train, dreaming in turquoise.',
      progressLines: [
        'The ghost stirs awake. A carriage window glows with a warm welcome.',
        'The passenger slips aboard. Friendly faces shimmer through every carriage window.'
      ],
      targets: ['hold-ghost', 'passenger-window']
    },
    pumpkins: {
      title: 'The Pumpkin Parade',
      steps: 3,
      opening: 'Three little pumpkins are keeping time along the railway.',
      progressLines: [
        'The trackside pumpkin winks. A second light answers from the engine.',
        'The engine grins. One last pumpkin is waiting down the line.',
        'All three lights shine together. The train leads a tiny parade through the cave.'
      ],
      targets: ['pumpkin-one', 'pumpkin-two', 'pumpkin-three']
    }
  };
  const hints = [
    [26000, 'Somewhere beneath the steam, a little engine light is still on duty.'],
    [61000, 'A turquoise traveler may be waiting for the right carriage window.'],
    [108000, 'The orange lights along the railway seem to keep a pattern.']
  ];

  let started = false;
  let paused = false;
  let reducedMotion = reducedMotionPreference.matches;
  let audioContext = null;
  let audioReady = false;
  let masterGain = null;
  let currentStory = null;
  let stepIndex = 0;
  let ending = false;
  let endingElapsed = 0;
  let sceneElapsed = 0;
  let hintIndex = 0;
  let currentHint = '';
  let holdActive = false;
  let holdElapsed = 0;
  let holdInterrupted = false;
  let dragState = null;
  let ghostSelected = false;
  let lastFrame = 0;
  let animationFrame = 0;
  const foundStories = new Set();

  motionToggle.checked = reducedMotion;
  applyMotionPreference();
  updateTargets();
  updateProgress();

  function applyMotionPreference() {
    experience.classList.toggle('reduced-motion', reducedMotion);
    motionNote.textContent = reducedMotion ? 'Motion is minimized' : 'Gentle movement is on';
    motionButton.setAttribute('aria-pressed', String(reducedMotion));
    motionButton.setAttribute('aria-label', reducedMotion ? 'Turn off reduced motion' : 'Turn on reduced motion');
    motionButtonLabel.textContent = reducedMotion ? 'Reduced' : 'Motion';
  }

  function setStatus(message) {
    liveStatus.textContent = message;
  }

  function updateProgress() {
    storyProgress.textContent = `${foundStories.size} / 3`;
    progressDots.forEach((dot, index) => dot.classList.toggle('found', index < foundStories.size));
  }

  function updateTargets() {
    const unavailable = !started || paused || ending;
    const activeTargets = currentStory ? stories[currentStory].targets : [];

    for (const target of targets) {
      const id = target.dataset.target;
      const isPumpkin = id.startsWith('pumpkin-');
      const visible = id === 'lamp' || id === 'hold-ghost' || isPumpkin
        || (currentStory === 'lantern' && id === 'cab' && stepIndex === 1)
        || (currentStory === 'ghosts' && id === 'passenger-window' && stepIndex === 1);
      target.hidden = !visible;
      const completedTrigger = (id === 'lamp' && currentStory === 'lantern')
        || (id === 'hold-ghost' && currentStory === 'ghosts' && stepIndex >= 1);
      target.disabled = unavailable || completedTrigger || (currentStory !== null && !activeTargets.includes(id));
      target.classList.toggle('is-next', !unavailable && (
        (currentStory === 'lantern' && stepIndex === 1 && id === 'cab')
        || (currentStory === 'ghosts' && stepIndex === 1 && id === 'passenger-window')
        || (currentStory === 'pumpkins' && id === stories.pumpkins.targets[stepIndex])
        || (currentStory === null && id === 'lamp')
      ));
      if (isPumpkin) target.classList.toggle('complete', currentStory === 'pumpkins' && stories.pumpkins.targets.indexOf(id) < stepIndex);
    }

    const canDragGhost = currentStory === 'lantern' && stepIndex === 1 && !ending && !paused;
    ghostToken.hidden = !canDragGhost;
    ghostToken.disabled = !canDragGhost;
    ghostToken.classList.toggle('selected', ghostSelected);
  }

  function createAudio() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      setStatus('Audio is unavailable in this browser. The stories will still play visually.');
      return false;
    }

    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.34;
    masterGain.connect(audioContext.destination);

    const droneGain = audioContext.createGain();
    droneGain.gain.value = 0.018;
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
    for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * 0.2;
    const noise = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    noiseGain.gain.value = 0.08;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    audioReady = true;
    return true;
  }

  function playTone(frequency, duration = 0.42) {
    if (!audioReady || !audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(120, frequency * 0.75), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.035);
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
    updateTargets();
    setStatus('Welcome aboard. Tap the headlamp, wake a ghost, or follow the pumpkins.');

    try {
      if (createAudio()) await audioContext.resume();
    } catch (error) {
      console.error('Unable to initialize or start ambient audio:', error);
      audioReady = false;
      if (audioContext && audioContext.state !== 'closed') await audioContext.close();
      audioContext = null;
      masterGain = null;
      setStatus('Audio could not start. The stories will still play visually.');
    }
    if (!started) return;
    lastFrame = performance.now();
    animationFrame = requestAnimationFrame(tick);
  }

  async function togglePause() {
    if (!started) return;
    paused = !paused;
    holdActive = false;
    if (paused && holdElapsed > 0) holdInterrupted = true;
    experience.classList.toggle('paused', paused);
    pausedScreen.hidden = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.querySelector('.pause-label').textContent = paused ? 'Resume' : 'Pause';
    pauseButton.querySelector('.pause-icon').textContent = paused ? '▶' : 'Ⅱ';
    updateTargets();
    setStatus(paused ? 'Station paused. Story progress and clue time are on hold.' : 'Station resumed.');

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
    currentStory = null;
    stepIndex = 0;
    ending = false;
    endingElapsed = 0;
    sceneElapsed = 0;
    hintIndex = 0;
    currentHint = '';
    holdActive = false;
    holdElapsed = 0;
    holdInterrupted = false;
    dragState = null;
    ghostSelected = false;
    foundStories.clear();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => console.error('Unable to close audio context:', error));
    }
    audioContext = null;
    masterGain = null;
    audioReady = false;

    experience.classList.remove('started', 'paused', 'story-lantern', 'story-ghosts', 'story-pumpkins');
    introScreen.classList.remove('dismissed');
    pausedScreen.hidden = true;
    storyCard.hidden = true;
    hintCard.hidden = true;
    storyLine.textContent = '';
    stepTrack.replaceChildren();
    hintText.textContent = '';
    ghostToken.style.left = '';
    ghostToken.style.top = '';
    ghostToken.classList.remove('dragging', 'selected');
    pauseButton.disabled = true;
    pauseButton.setAttribute('aria-pressed', 'false');
    pauseButton.querySelector('.pause-label').textContent = 'Pause';
    pauseButton.querySelector('.pause-icon').textContent = 'Ⅱ';
    motionButton.disabled = true;
    bottomNote.textContent = 'Tap, hold, and drag to wake the train’s stories.';
    updateProgress();
    updateTargets();
    setStatus('Station reset. Enter the station when you are ready.');
  }

  function beginStory(id) {
    if (!started || paused || currentStory || !stories[id]) return;
    currentStory = id;
    stepIndex = 0;
    ending = false;
    endingElapsed = 0;
    ghostSelected = false;
    experience.classList.add(`story-${id}`);
    storyCard.hidden = false;
    hintCard.hidden = true;
    storyKicker.textContent = `A LITTLE MYSTERY · ${stories[id].title}`;
    storyLine.textContent = stories[id].opening;
    stepTrack.replaceChildren(...Array.from({ length: stories[id].steps }, () => {
      const marker = document.createElement('span');
      return marker;
    }));
    bottomNote.textContent = getNextInstruction(id, 0);
    setStatus(`${stories[id].title} begins. ${getNextInstruction(id, 0)}`);
    updateTargets();
  }

  function getNextInstruction(id, index) {
    const instructions = {
      lantern: ['Tap the headlamp, then find the drifting ghost.', 'Drag the ghost to the cab, or select the ghost and tap the cab.'],
      ghosts: ['Press and hold the turquoise ghost for a moment.', 'Tap the glowing passenger window.'],
      pumpkins: ['Tap the pumpkin by the lower-left track.', 'Tap the pumpkin on the engine.', 'Tap the pumpkin on the right side of the track.']
    };
    return instructions[id][Math.min(index, instructions[id].length - 1)];
  }

  function advanceStory() {
    if (!currentStory || ending) return;
    const story = stories[currentStory];
    stepIndex += 1;
    const line = story.progressLines[stepIndex - 1];
    storyLine.textContent = line;
    stepTrack.querySelectorAll('span').forEach((marker, index) => marker.classList.toggle('complete', index < stepIndex));
    playTone([660, 784, 988][Math.min(stepIndex - 1, 2)]);

    if (stepIndex >= story.steps) {
      ending = true;
      endingElapsed = 0;
      foundStories.add(currentStory);
      updateProgress();
      storyLine.textContent = line;
      bottomNote.textContent = 'The train’s story settles into the mist.';
      setStatus(`${story.title} complete. ${foundStories.size} of 3 stories found.`);
    } else {
      bottomNote.textContent = getNextInstruction(currentStory, stepIndex);
      setStatus(`${story.title}: ${getNextInstruction(currentStory, stepIndex)}`);
    }
    updateTargets();
  }

  function finishStory() {
    experience.classList.remove(`story-${currentStory}`);
    currentStory = null;
    stepIndex = 0;
    ending = false;
    endingElapsed = 0;
    holdElapsed = 0;
    ghostSelected = false;
    storyCard.hidden = true;
    bottomNote.textContent = 'The train is ready for another little mystery.';
    updateTargets();
    showDueHint();
  }

  function beginHold() {
    if (!started || paused || ending) return;
    if (!currentStory) beginStory('ghosts');
    if (currentStory !== 'ghosts' || stepIndex !== 0) return;
    holdActive = true;
    if (!holdInterrupted) holdElapsed = 0;
    holdInterrupted = false;
    bottomNote.textContent = 'Keep holding for a little longer…';
    setStatus('The ghost is stirring. Keep holding.');
    playTone(523, 0.25);
  }

  function endHold() {
    if (!holdActive) return;
    holdActive = false;
    if (holdElapsed < 850) {
      holdElapsed = 0;
      holdInterrupted = false;
      bottomNote.textContent = 'Almost. Hold the ghost a little longer.';
      setStatus('The ghost is still sleepy. Try holding a little longer.');
    }
  }

  function showDueHint() {
    if (currentStory) return;
    while (hintIndex < hints.length && sceneElapsed >= hints[hintIndex][0]) {
      currentHint = hints[hintIndex][1];
      hintIndex += 1;
    }
    if (!currentHint) return;
    hintText.textContent = currentHint;
    hintCard.hidden = false;
  }

  function handleTarget(target) {
    if (paused || !started || ending) return;
    const id = target.dataset.target;

    if (id === 'lamp') {
      if (!currentStory) {
        beginStory('lantern');
        advanceStory();
      }
      return;
    }

    if (id === 'hold-ghost') {
      if (currentStory === 'ghosts' && stepIndex >= 1) {
        setStatus('The ghost has found its carriage. Tap the glowing window.');
      }
      return;
    }

    if (id === 'cab') {
      if (currentStory === 'lantern' && stepIndex === 1 && ghostSelected) {
        advanceStory();
      } else if (currentStory === 'lantern' && stepIndex === 1) {
        setStatus('Select the ghost, then tap the cab, or drag the ghost there.');
      }
      return;
    }

    if (id === 'passenger-window') {
      if (currentStory === 'ghosts' && stepIndex === 1) advanceStory();
      return;
    }

    if (id.startsWith('pumpkin-')) {
      const expected = stories.pumpkins.targets[stepIndex];
      if (!currentStory) {
        if (id !== stories.pumpkins.targets[0]) {
          setStatus('One pumpkin gives a faint wink near the lower-left track.');
          playTone(392, 0.25);
          return;
        }
        beginStory('pumpkins');
      }
      if (currentStory !== 'pumpkins') return;
      if (id === expected) advanceStory();
      else {
        setStatus('That pumpkin is waiting its turn. Follow the little numbered lights.');
        playTone(330, 0.2);
      }
    }
  }

  function startDrag(event) {
    if (currentStory !== 'lantern' || stepIndex !== 1 || paused || ending) return;
    event.preventDefault();
    dragState = { pointerId: event.pointerId };
    ghostSelected = true;
    ghostToken.classList.add('dragging');
    ghostToken.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const bounds = scene.getBoundingClientRect();
    const tokenBounds = ghostToken.getBoundingClientRect();
    const x = event.clientX - bounds.left - tokenBounds.width / 2;
    const y = event.clientY - bounds.top - tokenBounds.height / 2;
    ghostToken.style.left = `${x}px`;
    ghostToken.style.top = `${y}px`;
  }

  function endDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const cab = document.querySelector('[data-target="cab"]');
    const bounds = cab.getBoundingClientRect();
    const droppedInCab = event.clientX >= bounds.left - 14 && event.clientX <= bounds.right + 14
      && event.clientY >= bounds.top - 14 && event.clientY <= bounds.bottom + 14;
    dragState = null;
    ghostToken.classList.remove('dragging');
    if (droppedInCab) {
      advanceStory();
      ghostToken.hidden = true;
      ghostToken.style.left = '';
      ghostToken.style.top = '';
    } else {
      ghostSelected = false;
      ghostToken.style.left = '';
      ghostToken.style.top = '';
      setStatus('The ghost floats back. Try dropping it on the cab window.');
      updateTargets();
    }
  }

  function tick(now) {
    if (!started) return;
    const delta = Math.max(now - lastFrame, 0);
    lastFrame = now;
    if (!paused) {
      sceneElapsed += delta;
      if (holdActive) {
        holdElapsed += delta;
        if (holdElapsed >= 850) {
          holdActive = false;
          holdInterrupted = false;
          advanceStory();
        }
      }
      if (ending) {
        endingElapsed += delta;
        if (endingElapsed >= 2700) finishStory();
      } else if (!currentStory) {
        showDueHint();
      }
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
  targets.forEach((target) => {
    target.addEventListener('click', () => handleTarget(target));
  });

  const holdTarget = document.querySelector('[data-target="hold-ghost"]');
  holdTarget.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    holdTarget.setPointerCapture(event.pointerId);
    beginHold();
  });
  holdTarget.addEventListener('pointerup', endHold);
  holdTarget.addEventListener('pointercancel', endHold);
  holdTarget.addEventListener('keydown', (event) => {
    if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
      event.preventDefault();
      beginHold();
    }
  });
  holdTarget.addEventListener('keyup', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') endHold();
  });
  holdTarget.addEventListener('click', (event) => {
    if (event.detail === 0 && currentStory !== 'ghosts') beginStory('ghosts');
  });

  ghostToken.addEventListener('pointerdown', startDrag);
  ghostToken.addEventListener('pointermove', moveDrag);
  ghostToken.addEventListener('pointerup', endDrag);
  ghostToken.addEventListener('pointercancel', endDrag);
  ghostToken.addEventListener('click', (event) => {
    if (event.detail !== 0 || currentStory !== 'lantern') return;
    ghostSelected = !ghostSelected;
    setStatus(ghostSelected ? 'Ghost selected. Tap the cab window.' : 'Ghost unselected.');
    updateTargets();
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

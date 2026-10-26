(() => {
  const experience = document.querySelector('#experience');
  const scene = document.querySelector('#scene');
  const enterButton = document.querySelector('#enter-button');
  const wordmark = document.querySelector('.wordmark');
  const pauseButton = document.querySelector('#pause-button');
  const pausedScreen = document.querySelector('#paused-screen');
  const introScreen = document.querySelector('#intro-screen');
  const progressIcons = document.querySelector('#progress-icons');
  const progressIconMarks = [...progressIcons.querySelectorAll('span')];
  const storyCard = document.querySelector('#story-card');
  const storyKicker = document.querySelector('#story-kicker');
  const storyLine = document.querySelector('#story-line');
  const stepTrack = document.querySelector('#step-track');
  const liveStatus = document.querySelector('#live-status');
  const targetsLayer = document.querySelector('.targets');
  const IDLE_GLOW_RAMP_MS = 12000; // time idle before the glows reach full strength
  const SIGNAL_MS = 600; // how long a reject/wink reaction stays on a target
  const targets = [...document.querySelectorAll('.target')];
  const ghostToken = document.querySelector('#ghost-token');
  const traceLayer = document.querySelector('#trace-layer');
  const traceTrail = document.querySelector('#trace-trail');
  const traceWisp = document.querySelector('#trace-wisp');
  const ghostLead = document.querySelector('[data-target="ghost-lead"]');
  const passengerWindow = document.querySelector('[data-target="passenger-window"]');
  const TRACE_GOAL_RADIUS = 40; // px from the window's centre that counts as arriving
  const TRACE_HALFWAY = 0.5; // share of the way to the window that completes the first step
  const TRACE_KEY_STEP = 28; // px the ghost moves per arrow-key press
  const TRACE_FADE_MS = 650;
  const FOG_CLEAR_PX = 240; // px of rubbing across a fog bank that clears it
  const FOG_REACH_PX = 90; // rubbing only counts this close to the bank's centre
  const FOG_MAX_STEP_PX = 30; // caps how much one pointer event can clear
  const FOG_KEY_STEP = 0.34; // share cleared by one Enter or Space press (three presses clear a bank)
  const batLayer = document.querySelector('#bat-layer');
  const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stories = {
    lantern: {
      title: 'The Midnight Conductor',
      steps: 2,
      opening: 'The engine has sat dark since the last midnight run. A conductor is missing.',
      progressLines: [
        'The headlamp wakes and lights the mist. Something is drifting toward the train.',
        'A ghost takes the controls with a tip of an invisible cap. The Midnight Line rolls again.'
      ],
      targets: ['lamp', 'cab']
    },
    ghosts: {
      title: 'Passengers of the Mist',
      steps: 2,
      opening: 'A lonely ghost trails behind the train, with no ticket and nowhere to sit.',
      progressLines: [
        'The ghost slips along the steam, following the way you point.',
        'A carriage window glows for it. All aboard, and the empty seats fill with friends.'
      ],
      targets: ['ghost-lead', 'passenger-window']
    },
    bats: {
      title: 'Roosting in the Mist',
      steps: 3,
      opening: 'Something is stirring in the fog along the cave ledges.',
      progressLines: [
        'Two glowing eyes blink awake in the mist. A bat shakes off its sleep.',
        'A second roost is cleared. Wings rustle all through the cave.',
        'The whole colony takes flight and escorts the train down the line.'
      ],
      targets: ['fog-one', 'fog-two', 'fog-three']
    }
  };

  let started = false;
  let paused = false;
  let audioContext = null;
  let audioReady = false;
  let masterGain = null;
  let currentStory = null;
  let stepIndex = 0;
  let ending = false;
  let endingElapsed = 0;
  let idleElapsed = 0; // unpaused time with no story playing; drives the circle glow
  let trace = null; // the stroke in progress in the ghost story, or null
  let traceFadeTimer = 0;
  let fogProgress = {}; // fog bank id -> 0 (untouched) to 1 (cleared)
  const clearedFog = new Set();
  let scrub = null; // the rub in progress on a fog bank, or null
  let lastScrubDistance = 0; // how far the most recent rub travelled; tells a tap from a rub
  let dragState = null;
  let ghostSelected = false;
  let lastFrame = 0;
  let animationFrame = 0;
  const foundStories = new Set();

  applyMotionPreference();
  updateTargets();
  updateProgress();

  // Motion follows the device's reduced-motion setting; there is no in-app toggle.
  function applyMotionPreference() {
    experience.classList.toggle('reduced-motion', reducedMotionPreference.matches);
  }

  function setStatus(message) {
    liveStatus.textContent = message;
  }

  function updateProgress() {
    progressIcons.setAttribute('aria-label', `${foundStories.size} of 3 stories found`);
    progressIconMarks.forEach((icon, index) => icon.classList.toggle('found', index < foundStories.size));
  }

  // Brief visible reaction on a target: 'reject' (dims and shakes), 'wink' (flares) or 'smudge' (fog parts).
  const signalTimers = new WeakMap();
  function signal(element, kind) {
    clearTimeout(signalTimers.get(element));
    element.classList.remove('reject', 'wink', 'smudge');
    void element.offsetWidth; // restart the CSS animation if the same reaction repeats
    element.classList.add(kind);
    signalTimers.set(element, setTimeout(() => element.classList.remove(kind), SIGNAL_MS));
  }

  // The interaction glows slowly brighten while the player is idle, as a wordless hint.
  function resetIdleGlow() {
    idleElapsed = 0;
    targetsLayer.style.setProperty('--hint', '0');
  }

  function updateIdleGlow(delta) {
    idleElapsed += delta;
    const level = Math.min(idleElapsed / IDLE_GLOW_RAMP_MS, 1);
    targetsLayer.style.setProperty('--hint', level.toFixed(3));
  }

  function updateTargets() {
    const unavailable = !started || paused || ending;
    const activeTargets = currentStory ? stories[currentStory].targets : [];

    for (const target of targets) {
      const id = target.dataset.target;
      const isFog = id.startsWith('fog-');
      const visible = id === 'lamp' || id === 'ghost-lead' || (isFog && !clearedFog.has(id))
        || (currentStory === 'lantern' && id === 'cab' && stepIndex === 1)
        || (currentStory === 'ghosts' && id === 'passenger-window');
      target.hidden = !visible;
      const completedTrigger = id === 'lamp' && currentStory === 'lantern';
      target.disabled = unavailable || completedTrigger || (currentStory !== null && !activeTargets.includes(id));
      // the window breathes faster once the ghost is halfway there
      target.classList.toggle('is-next', !unavailable && (
        (currentStory === 'lantern' && stepIndex === 1 && id === 'cab')
        || (currentStory === 'ghosts' && stepIndex === 1 && id === 'passenger-window')
      ));
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
    resetIdleGlow();
    experience.classList.add('started');
    introScreen.classList.add('dismissed');
    pauseButton.disabled = false;
    updateTargets();
    setStatus('Welcome aboard. Tap the headlamp, lead the ghost along the steam, or rub away the fog.');

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
    if (paused) { endTrace(); scrub = null; } // a stroke in progress is let go; progress already earned stays
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
    resetIdleGlow();
    endTrace();
    clearTraceVisuals();
    scrub = null;
    resetFog();
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

    experience.classList.remove('started', 'paused', 'story-lantern', 'story-ghosts', 'story-bats');
    introScreen.classList.remove('dismissed');
    pausedScreen.hidden = true;
    storyCard.hidden = true;
    storyLine.textContent = '';
    stepTrack.replaceChildren();
    ghostToken.style.left = '';
    ghostToken.style.top = '';
    ghostToken.classList.remove('dragging', 'selected');
    pauseButton.disabled = true;
    pauseButton.setAttribute('aria-pressed', 'false');
    pauseButton.querySelector('.pause-label').textContent = 'Pause';
    pauseButton.querySelector('.pause-icon').textContent = 'Ⅱ';
    updateProgress();
    updateTargets();
    setStatus('Station reset. Enter the station when you are ready.');
  }

  function beginStory(id) {
    if (!started || paused || currentStory || !stories[id]) return;
    currentStory = id;
    resetIdleGlow();
    stepIndex = 0;
    ending = false;
    endingElapsed = 0;
    ghostSelected = false;
    experience.classList.add(`story-${id}`);
    storyCard.hidden = false;
    storyKicker.textContent = `A LITTLE MYSTERY · ${stories[id].title}`;
    storyLine.textContent = stories[id].opening;
    stepTrack.replaceChildren(...Array.from({ length: stories[id].steps }, () => {
      const marker = document.createElement('span');
      return marker;
    }));
    setStatus(`${stories[id].title} begins. ${getNextInstruction(id, 0)}`);
    updateTargets();
  }

  function getNextInstruction(id, index) {
    const instructions = {
      lantern: ['Tap the headlamp, then find the drifting ghost.', 'Drag the ghost to the cab, or select the ghost and tap the cab.'],
      ghosts: ['Press the turquoise ghost and drag toward the glowing carriage window, or focus it and steer with the arrow keys.', 'Keep guiding the ghost to the glowing window.'],
      bats: ['Rub your finger across a drifting fog bank until it clears, or focus one and press Enter.', 'Another fog bank is hiding a bat. Rub it away.', 'One last fog bank is still hiding a bat. Rub it away.']
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
      if (currentStory === 'bats') sendBatsAroundTrain();
      setStatus(`${story.title} complete. ${foundStories.size} of 3 stories found.`);
    } else {
      setStatus(`${story.title}: ${getNextInstruction(currentStory, stepIndex)}`);
    }
    updateTargets();
  }

  function finishStory() {
    resetIdleGlow();
    experience.classList.remove(`story-${currentStory}`);
    currentStory = null;
    stepIndex = 0;
    ending = false;
    endingElapsed = 0;
    ghostSelected = false;
    storyCard.hidden = true;
    clearTraceVisuals();
    resetFog();
    updateTargets();
  }

  // Position of an element's centre in scene pixels, the space the trace is drawn in.
  function centerOf(element) {
    const sceneBounds = scene.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    return { x: box.left + box.width / 2 - sceneBounds.left, y: box.top + box.height / 2 - sceneBounds.top };
  }

  // Ghost story: the player leads the ghost from its start to the carriage window with a finger
  // (or arrow keys). Progress is how much of the start-to-window distance the stroke has covered.
  function beginTrace(viaKeyboard) {
    if (!started || paused || ending || trace) return;
    if (!currentStory) beginStory('ghosts');
    if (currentStory !== 'ghosts') return;
    clearTimeout(traceFadeTimer);
    clearTraceVisuals();
    const origin = centerOf(ghostLead);
    const goal = centerOf(passengerWindow);
    trace = { origin, goal, point: origin, points: [origin], best: 0, viaKeyboard, length: Math.hypot(goal.x - origin.x, goal.y - origin.y) };
    traceWisp.hidden = false;
    traceWisp.style.left = `${origin.x}px`;
    traceWisp.style.top = `${origin.y}px`;
    playTone(523, 0.25);
  }

  function moveTrace(x, y) {
    if (!trace) return;
    trace.point = { x, y };
    const last = trace.points[trace.points.length - 1];
    if (Math.hypot(x - last.x, y - last.y) >= 4) trace.points.push(trace.point);
    const distance = Math.hypot(trace.goal.x - x, trace.goal.y - y);
    trace.best = Math.max(trace.best, Math.min(Math.max(1 - distance / trace.length, 0), 1));
    experience.style.setProperty('--trace', trace.best.toFixed(2));
    traceTrail.setAttribute('points', trace.points.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' '));
    traceWisp.style.left = `${x}px`;
    traceWisp.style.top = `${y}px`;

    if (stepIndex === 0 && trace.best >= TRACE_HALFWAY) advanceStory();
    if (stepIndex === 1 && distance <= TRACE_GOAL_RADIUS) {
      advanceStory(); // the story is now ending, which lets go of the stroke
      endTrace();
    }
  }

  // Let go of the stroke. The trail fades; brightness resets unless the story was completed.
  function endTrace() {
    if (!trace) return;
    trace = null;
    traceWisp.hidden = true;
    traceLayer.classList.add('fading');
    if (!ending) experience.style.setProperty('--trace', '0');
    traceFadeTimer = setTimeout(clearTraceVisuals, TRACE_FADE_MS);
  }

  // Player lifted their finger or left the ghost: an unfinished stroke gets a visible refusal.
  function liftTrace() {
    if (!trace) return;
    endTrace();
    if (!ending) {
      signal(ghostLead, 'reject');
      setStatus('The ghost drifts back. Try leading it farther along the steam.');
    }
  }

  function clearTraceVisuals() {
    if (trace) return; // a new stroke is already under way
    traceTrail.setAttribute('points', '');
    traceLayer.classList.remove('fading');
    if (!ending) experience.style.setProperty('--trace', '0');
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

    if (id === 'ghost-lead') return; // handled by the pointer and key listeners below

    if (id === 'cab') {
      if (currentStory === 'lantern' && stepIndex === 1 && ghostSelected) {
        advanceStory();
      } else if (currentStory === 'lantern' && stepIndex === 1) {
        signal(target, 'reject');
        setStatus('Select the ghost, then tap the cab, or drag the ghost there.');
      }
      return;
    }

    // fog banks are handled by the rub and key listeners below
  }

  // Bat story: rubbing a fog bank thins it until it clears and releases a bat.
  function beginScrub(event, target) {
    if (!started || paused || ending) return;
    if (!currentStory) beginStory('bats');
    if (currentStory !== 'bats') return;
    target.setPointerCapture(event.pointerId);
    scrub = { target, pointerId: event.pointerId, x: event.clientX, y: event.clientY, total: 0, sinceTone: 0 };
    lastScrubDistance = 0;
  }

  function moveScrub(event) {
    if (!scrub || scrub.pointerId !== event.pointerId) return;
    const box = scrub.target.getBoundingClientRect();
    const near = Math.hypot(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2)) <= FOG_REACH_PX;
    const step = Math.min(Math.hypot(event.clientX - scrub.x, event.clientY - scrub.y), FOG_MAX_STEP_PX);
    scrub.x = event.clientX;
    scrub.y = event.clientY;
    if (!near) return;
    scrub.total += step;
    scrub.sinceTone += step;
    lastScrubDistance = scrub.total;
    const target = scrub.target;
    if (scrub.sinceTone >= 70) {
      scrub.sinceTone = 0;
      playTone(200 + 260 * (fogProgress[target.dataset.target] || 0), 0.14); // a soft rustle that rises as it clears
    }
    setFog(target, (fogProgress[target.dataset.target] || 0) + step / FOG_CLEAR_PX);
  }

  function endScrub() {
    if (!scrub) return;
    scrub = null;
  }

  function setFog(target, value) {
    const id = target.dataset.target;
    fogProgress[id] = Math.min(value, 1);
    target.style.setProperty('--fog', (1 - fogProgress[id]).toFixed(2));
    if (fogProgress[id] >= 1 && !clearedFog.has(id)) clearFog(target);
  }

  function clearFog(target) {
    const spot = centerOf(target); // measure before the cleared bank is hidden
    clearedFog.add(target.dataset.target);
    scrub = null;
    spawnBat(spot, clearedFog.size);
    advanceStory();
  }

  // A bat copied from the cave art rises from the cleared bank and hovers there.
  function spawnBat(spot, number) {
    const bat = document.createElement('div');
    bat.className = `bat bat-${(number - 1) % 3 + 1}`;
    bat.style.left = `${spot.x}px`;
    bat.style.top = `${spot.y}px`;
    bat.style.setProperty('--r', `${[130, 95, 160][(number - 1) % 3]}px`);
    bat.style.setProperty('--phase', `${[0, 0.57, 1.13][(number - 1) % 3]}s`);
    const wing = document.createElement('span');
    wing.className = 'bat-wing';
    bat.append(wing);
    batLayer.append(bat);
  }

  // Finale: every released bat sweeps to the train and circles it.
  function sendBatsAroundTrain() {
    batLayer.querySelectorAll('.bat').forEach((bat) => {
      bat.style.left = '50%';
      bat.style.top = '46%';
      bat.classList.add('circling');
    });
  }

  // Fog drifts back and the bats leave, so the story can be played again.
  function resetFog() {
    fogProgress = {};
    clearedFog.clear();
    batLayer.replaceChildren();
    targets.filter((target) => target.dataset.target.startsWith('fog-')).forEach((target) => {
      target.style.removeProperty('--fog');
      target.classList.add('returning');
      setTimeout(() => target.classList.remove('returning'), 1400);
    });
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
      signal(cab, 'reject');
      setStatus('The ghost floats back. Try dropping it on the cab window.');
      updateTargets();
    }
  }

  function tick(now) {
    if (!started) return;
    const delta = Math.max(now - lastFrame, 0);
    lastFrame = now;
    if (!paused) {
      if (ending) {
        endingElapsed += delta;
        if (endingElapsed >= 2700) finishStory();
      } else if (!currentStory) {
        updateIdleGlow(delta);
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
  targets.forEach((target) => {
    target.addEventListener('click', () => handleTarget(target));
  });

  // Ghost story input: drag from the ghost, or focus it and steer with the arrow keys.
  const ARROW_STEPS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  ghostLead.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    ghostLead.setPointerCapture(event.pointerId);
    beginTrace(false);
    if (trace) trace.pointerId = event.pointerId;
  });
  ghostLead.addEventListener('pointermove', (event) => {
    if (!trace || trace.pointerId !== event.pointerId) return;
    const bounds = scene.getBoundingClientRect();
    moveTrace(event.clientX - bounds.left, event.clientY - bounds.top);
  });
  ghostLead.addEventListener('pointerup', (event) => {
    if (trace && trace.pointerId === event.pointerId) liftTrace();
  });
  ghostLead.addEventListener('pointercancel', (event) => {
    if (trace && trace.pointerId === event.pointerId) liftTrace();
  });
  ghostLead.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (trace && trace.viaKeyboard) liftTrace();
      return;
    }
    const step = ARROW_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    if (!trace) beginTrace(true);
    if (!trace || !trace.viaKeyboard) return;
    moveTrace(trace.point.x + step[0] * TRACE_KEY_STEP, trace.point.y + step[1] * TRACE_KEY_STEP);
  });
  ghostLead.addEventListener('blur', () => {
    if (trace && trace.viaKeyboard) liftTrace();
  });
  ghostLead.addEventListener('click', (event) => {
    if (event.detail === 0 && currentStory !== 'ghosts') beginStory('ghosts'); // Enter or Space on the ghost
  });

  // Bat story input: rub across a fog bank, or focus it and press Enter or Space.
  targets.filter((target) => target.dataset.target.startsWith('fog-')).forEach((bank) => {
    bank.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      beginScrub(event, bank);
    });
    bank.addEventListener('pointermove', moveScrub);
    bank.addEventListener('pointerup', endScrub);
    bank.addEventListener('pointercancel', endScrub);
    bank.addEventListener('click', (event) => {
      if (!started || paused || ending) return;
      if (event.detail === 0) { // keyboard: each press clears a share of the bank
        if (!currentStory) beginStory('bats');
        if (currentStory !== 'bats') return;
        playTone(260 + 200 * (fogProgress[bank.dataset.target] || 0), 0.16);
        setFog(bank, (fogProgress[bank.dataset.target] || 0) + FOG_KEY_STEP);
      } else if (lastScrubDistance < 24) { // a tap with no rubbing: the fog only stirs
        signal(bank, 'smudge');
        setStatus('The fog stirs but stays put. Try rubbing across it.');
      }
    });
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

  reducedMotionPreference.addEventListener?.('change', applyMotionPreference);

  window.addEventListener('pagehide', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch((error) => console.error('Unable to close audio context:', error));
    }
  });
})();

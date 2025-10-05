/**
 * AgriSpace Quest - Three.js Game
 * 3D educational game about satellite agriculture
 */

// Game State
const gameState = {
    scene: null,
    camera: null,
    renderer: null,
    orbs: [],
    questions: [],
    filteredQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    selectedDifficulty: 'all',
    isPlaying: false,
    stars: null,
    raycaster: null,
    mouse: null
};

// Initialize Game
async function init() {
    console.log('🚀 Initializing AgriSpace Quest...');
    
    try {
        // Show loading screen
        showScreen('loading');
        updateLoadingText('Loading questions...');
        
        // Load questions
        await loadQuestions();
        console.log('✓ Questions loaded');
        
        updateLoadingText('Setting up 3D environment...');
        
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js not loaded! Check internet connection.');
        }
        
        // Setup Three.js
        setupThreeJS();
        console.log('✓ Three.js setup complete');
        
        // Setup event listeners
        setupEventListeners();
        console.log('✓ Event listeners ready');
        
        // Start animation loop
        animate();
        console.log('✓ Animation started');
        
        updateLoadingText('Ready to launch!');
        
        // Show welcome screen
        setTimeout(() => {
            console.log('✅ Game initialized! Showing welcome screen...');
            showScreen('welcome');
        }, 800);
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        updateLoadingText('Error: ' + error.message + ' - Please refresh the page');
    }
}

// Update loading text
function updateLoadingText(text) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// Load Questions
async function loadQuestions() {
    // Try both paths (for root and game/ folder)
    const paths = [
        'game/assets/agricultural_questions.json',  // From root
        'assets/agricultural_questions.json'        // From game folder
    ];
    
    for (const path of paths) {
        try {
            console.log(`Fetching questions from ${path}...`);
            const response = await fetch(path);
            
            if (response.ok) {
                gameState.questions = await response.json();
                console.log(`✓ Loaded ${gameState.questions.length} questions from ${path}`);
                
                if (gameState.questions.length > 0) {
                    return; // Success!
                }
            }
        } catch (error) {
            console.log(`  Failed to load from ${path}: ${error.message}`);
        }
    }
    
    // If we get here, use fallback
    console.warn('⚠️ Could not load questions file from any path');
    console.log('Using fallback questions instead...');
    gameState.questions = getFallbackQuestions();
    console.log(`✓ Loaded ${gameState.questions.length} fallback questions`);
}

// Fallback questions
function getFallbackQuestions() {
    return [
        {
            question: "What does NDVI stand for in satellite imagery?",
            options: [
                "A) Normalized Difference Vegetation Index",
                "B) Natural Data Vegetation Indicator",
                "C) New Digital Video Input",
                "D) Nutrient Density Value Index"
            ],
            correct: "A",
            explanation: "NDVI (Normalized Difference Vegetation Index) measures plant health by comparing red and near-infrared light reflection. Healthy plants reflect more near-infrared light!",
            difficulty: "easy",
            category: "Remote Sensing Basics"
        },
        {
            question: "Why do farmers use satellite data to monitor their crops?",
            options: [
                "A) To take pretty pictures of their farms",
                "B) To detect crop health problems early before they spread",
                "C) To count individual plants one by one",
                "D) To predict tomorrow's weather"
            ],
            correct: "B",
            explanation: "Satellite data helps farmers spot problems like disease, drought stress, or nutrient deficiencies before they're visible to the naked eye. This early detection allows quick action to save crops!",
            difficulty: "easy",
            category: "Agriculture Applications"
        },
        {
            question: "What does 'temporal granularity' mean for satellite data?",
            options: [
                "A) How clear and detailed the image is",
                "B) How often the satellite takes pictures of the same location",
                "C) The physical size of the satellite in orbit",
                "D) The color palette used in the images"
            ],
            correct: "B",
            explanation: "Temporal granularity describes how frequently a satellite collects data - daily, weekly, monthly, or yearly. Frequent observations help track crop changes over time!",
            difficulty: "medium",
            category: "Remote Sensing Basics"
        },
        {
            question: "Which NASA satellite mission provides soil moisture data?",
            options: [
                "A) Hubble Space Telescope",
                "B) SMAP (Soil Moisture Active Passive)",
                "C) International Space Station",
                "D) Mars Curiosity Rover"
            ],
            correct: "B",
            explanation: "SMAP is specifically designed to measure how much water is in the top layer of soil across the globe. This helps farmers decide when to water their crops!",
            difficulty: "medium",
            category: "Soil Science"
        },
        {
            question: "What is the main advantage of satellite monitoring over ground surveys?",
            options: [
                "A) Satellites are cheaper to build",
                "B) Satellites can cover huge areas quickly and repeatedly",
                "C) Satellite data is always 100% accurate",
                "D) Satellites can see underground"
            ],
            correct: "B",
            explanation: "Satellites can observe thousands of square kilometers in minutes - something that would take months to survey on foot. Plus, they repeatedly image the same areas to show changes over time!",
            difficulty: "easy",
            category: "Remote Sensing Benefits"
        },
        {
            question: "How can infrared satellite imagery help detect crop stress?",
            options: [
                "A) Stressed plants appear darker in infrared",
                "B) Healthy plants reflect more infrared light than stressed plants",
                "C) Infrared detects the water content which is lower in stressed plants",
                "D) Both B and C are correct"
            ],
            correct: "D",
            explanation: "Healthy plants reflect lots of near-infrared light and contain more water. Stressed plants do both less effectively, making them easy to spot in satellite images!",
            difficulty: "hard",
            category: "Crop Health Monitoring"
        }
    ];
}

// Setup Three.js Scene
function setupThreeJS() {
    const canvas = document.getElementById('game-canvas');
    
    // Scene
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x000510);
    gameState.scene.fog = new THREE.FogExp2(0x000510, 0.0003);
    
    // Camera
    gameState.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    gameState.camera.position.z = 50;
    
    // Renderer
    gameState.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Raycaster for mouse picking
    gameState.raycaster = new THREE.Raycaster();
    gameState.mouse = new THREE.Vector2();
    
    // Create starfield
    createStarfield();
    
    // Create floating Earth satellite
    createEarth();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    gameState.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    gameState.scene.add(pointLight);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Create Starfield
function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });
    
    gameState.stars = new THREE.Points(geometry, material);
    gameState.scene.add(gameState.stars);
}

// Create Earth
function createEarth() {
    const geometry = new THREE.SphereGeometry(8, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x2194ce,
        emissive: 0x112244,
        shininess: 25
    });
    
    const earth = new THREE.Mesh(geometry, material);
    earth.position.set(-30, 0, -50);
    gameState.scene.add(earth);
    
    // Store reference for animation
    gameState.earth = earth;
    
    // Add Earth glow
    const glowGeometry = new THREE.SphereGeometry(8.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4CAF50,
        transparent: true,
        opacity: 0.2
    });
    const earthGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    earth.add(earthGlow);
}

// Create Question Orbs
function createQuestionOrbs() {
    // Clear existing orbs
    gameState.orbs.forEach(orb => gameState.scene.remove(orb));
    gameState.orbs = [];
    
    // Create orbs for questions
    const orbCount = Math.min(gameState.filteredQuestions.length, 100);
    
    for (let i = 0; i < orbCount; i++) {
        const orb = createOrb(i);
        gameState.orbs.push(orb);
        gameState.scene.add(orb);
    }
}

// Create Single Orb
function createOrb(index) {
    // Create orb geometry
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    
    // Orb color based on difficulty
    const question = gameState.filteredQuestions[index];
    let color;
    switch (question.difficulty) {
        case 'easy': color = 0x4CAF50; break;
        case 'medium': color = 0xFFC107; break;
        case 'hard': color = 0xF44336; break;
        default: color = 0x8BC34A;
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    
    const orb = new THREE.Mesh(geometry, material);
    
    // Position orbs in a grid around the player
    const gridSize = Math.ceil(Math.sqrt(orbCount));
    const spacing = 20;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    orb.position.x = (col - gridSize / 2) * spacing;
    orb.position.y = (row - gridSize / 2) * spacing;
    orb.position.z = -100 - (Math.random() * 200);
    
    // Store question index
    orb.userData = { questionIndex: index, answered: false };
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    orb.add(glow);
    
    return orb;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState.isPlaying) {
        // Rotate stars slowly
        if (gameState.stars) {
            gameState.stars.rotation.y += 0.0002;
        }
        
        // Rotate Earth
        if (gameState.earth) {
            gameState.earth.rotation.y += 0.001;
        }
        
        // Animate orbs
        gameState.orbs.forEach((orb, index) => {
            if (!orb.userData.answered) {
                // Floating animation
                orb.position.y += Math.sin(Date.now() * 0.001 + index) * 0.02;
                orb.rotation.y += 0.01;
                
                // Pulsing glow
                if (orb.children[0]) {
                    const scale = 1 + Math.sin(Date.now() * 0.002 + index) * 0.1;
                    orb.children[0].scale.set(scale, scale, scale);
                }
            }
        });
        
        // Gentle camera sway
        gameState.camera.position.x += Math.sin(Date.now() * 0.0003) * 0.01;
        gameState.camera.position.y += Math.cos(Date.now() * 0.0005) * 0.01;
    }
    
    gameState.renderer.render(gameState.scene, gameState.camera);
}

// Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Difficulty selection
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    console.log(`Found ${difficultyBtns.length} difficulty buttons`);
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Difficulty selected:', btn.dataset.difficulty);
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.selectedDifficulty = btn.dataset.difficulty;
        });
    });
    
    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        console.log('Start button found, attaching listener');
        startBtn.addEventListener('click', (e) => {
            console.log('🚀 Start button clicked!');
            startGame();
        });
    } else {
        console.error('❌ Start button not found!');
    }
    
    // Continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', closeQuestionModal);
    }
    
    // Play again
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            showScreen('welcome');
        });
    }
    
    // Canvas click for orb selection
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.addEventListener('click', onCanvasClick, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
    }
    
    console.log('✓ Event listeners setup complete');
}

// Start Game
function startGame() {
    // Filter questions by difficulty
    if (gameState.selectedDifficulty === 'all') {
        gameState.filteredQuestions = [...gameState.questions];
    } else {
        gameState.filteredQuestions = gameState.questions.filter(
            q => q.difficulty === gameState.selectedDifficulty
        );
    }
    
    // Shuffle questions
    shuffleArray(gameState.filteredQuestions);
    
    // Reset game state
    gameState.currentQuestionIndex = 0;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.maxStreak = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    gameState.isPlaying = true;
    
    // Create orbs
    createQuestionOrbs();
    
    // Show game HUD
    document.getElementById('game-hud').classList.remove('hidden');
    updateHUD();
    
    // Hide welcome screen
    showScreen('game');
}

// Mouse Move Handler
function onMouseMove(event) {
    gameState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    gameState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Canvas Click Handler
function onCanvasClick(event) {
    if (!gameState.isPlaying) return;
    
    // Update mouse position
    gameState.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    gameState.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycast to find clicked orb
    gameState.raycaster.setFromCamera(gameState.mouse, gameState.camera);
    const intersects = gameState.raycaster.intersectObjects(gameState.orbs);
    
    if (intersects.length > 0) {
        const orb = intersects[0].object;
        if (!orb.userData.answered) {
            showQuestionModal(orb.userData.questionIndex, orb);
        }
    }
}

// Show Question Modal
function showQuestionModal(questionIndex, orb) {
    const question = gameState.filteredQuestions[questionIndex];
    
    // Populate modal
    document.getElementById('question-difficulty').textContent = 
        question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
    document.getElementById('question-category').textContent = question.category;
    document.getElementById('question-text').textContent = question.question;
    
    // Create option buttons
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.dataset.answer = option.charAt(0);
        btn.onclick = () => selectAnswer(btn, question, orb);
        optionsContainer.appendChild(btn);
    });
    
    // Hide feedback
    document.getElementById('answer-feedback').classList.add('hidden');
    document.getElementById('continue-btn').classList.add('hidden');
    
    // Show modal
    document.getElementById('question-modal').classList.remove('hidden');
}

// Select Answer
function selectAnswer(selectedBtn, question, orb) {
    const isCorrect = selectedBtn.dataset.answer === question.correct;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.add('disabled');
        if (btn.dataset.answer === question.correct) {
            btn.classList.add('correct');
        } else if (btn === selectedBtn && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Update game state
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.streak++;
        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
        
        const points = { easy: 10, medium: 15, hard: 20 }[question.difficulty] || 10;
        gameState.score += points + (gameState.streak >= 3 ? gameState.streak : 0);
        
        // Mark orb as answered
        orb.userData.answered = true;
        orb.material.opacity = 0.3;
        orb.material.emissiveIntensity = 0.1;
    } else {
        gameState.incorrectAnswers++;
        gameState.streak = 0;
    }
    
    // Show feedback
    showAnswerFeedback(isCorrect, question.explanation);
    
    // Update HUD
    updateHUD();
    
    // Show continue button
    document.getElementById('continue-btn').classList.remove('hidden');
    
    // Check if all questions answered
    if (gameState.correctAnswers + gameState.incorrectAnswers >= gameState.filteredQuestions.length) {
        setTimeout(() => {
            closeQuestionModal();
            endGame();
        }, 3000);
    }
}

// Show Answer Feedback
function showAnswerFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('answer-feedback');
    feedback.classList.remove('hidden');
    feedback.className = `answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    feedback.querySelector('.feedback-icon').textContent = isCorrect ? '🎉' : '💡';
    feedback.querySelector('.feedback-message').textContent = 
        isCorrect ? 'Awesome! That\'s correct!' : 'Not quite, but keep learning!';
    feedback.querySelector('.feedback-explanation').textContent = explanation;
}

// Close Question Modal
function closeQuestionModal() {
    document.getElementById('question-modal').classList.add('hidden');
}

// Update HUD
function updateHUD() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('streak').textContent = 
        gameState.streak > 0 ? `${gameState.streak}🔥` : '0';
    document.getElementById('progress').textContent = 
        `${gameState.correctAnswers + gameState.incorrectAnswers}/${gameState.filteredQuestions.length}`;
}

// End Game
function endGame() {
    gameState.isPlaying = false;
    
    // Calculate stats
    const totalQuestions = gameState.filteredQuestions.length;
    const accuracy = Math.round((gameState.correctAnswers / totalQuestions) * 100);
    
    // Update results
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('correct-count').textContent = gameState.correctAnswers;
    document.getElementById('incorrect-count').textContent = gameState.incorrectAnswers;
    document.getElementById('max-streak-count').textContent = gameState.maxStreak;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Achievement
    const achievement = getAchievement(accuracy);
    document.getElementById('achievement-title').textContent = achievement.title;
    document.getElementById('achievement-message').textContent = achievement.message;
    
    // Show results
    document.getElementById('game-hud').classList.add('hidden');
    showScreen('results');
}

// Get Achievement
function getAchievement(accuracy) {
    if (accuracy >= 90) {
        return { title: '🌟 Outstanding! Agricultural Expert!', message: 'You know satellites and farming like a pro!' };
    } else if (accuracy >= 75) {
        return { title: '🎖️ Excellent Work! Rising Star!', message: 'You\'re well on your way to becoming an expert!' };
    } else if (accuracy >= 60) {
        return { title: '👍 Good Job! Keep Learning!', message: 'You\'re making great progress!' };
    } else if (accuracy >= 40) {
        return { title: '💪 Nice Try! Practice Makes Perfect!', message: 'Keep exploring and you\'ll master this!' };
    } else {
        return { title: '🌱 Great Start! Every Expert Was Once a Beginner!', message: 'Review and try again!' };
    }
}

// Show Screen
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    switch (screen) {
        case 'loading':
            document.getElementById('loading-screen').classList.add('active');
            break;
        case 'welcome':
            document.getElementById('welcome-screen').classList.add('active');
            break;
        case 'game':
            // Just hide screens, show 3D world
            break;
        case 'results':
            document.getElementById('results-screen').classList.add('active');
            break;
    }
}

// Window Resize
function onWindowResize() {
    gameState.camera.aspect = window.innerWidth / window.innerHeight;
    gameState.camera.updateProjectionMatrix();
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialize game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already loaded
    init();
}

// Also listen for window load as backup
window.addEventListener('load', () => {
    console.log('Window fully loaded');
});


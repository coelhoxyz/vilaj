/**
 * AgriSpace Quest - Vue.js Farm Simulator
 * Based on NASA satellite data
 */

const { createApp } = Vue;

createApp({
    data() {
        return {
            gameStarted: false,
            gamePhase: 'introduction', // introduction, playerName, locationSelect, welcome, planting, learnContext, question, eventResult, results, gameover
            farmerState: 'idle', // idle, walking, running, jumping, sad
            farmerSpeech: false,
            farmerMessage: '',
            hoveredOption: null,
            playerName: '',
            playerLocation: '',
            locationSearch: '',
            locationData: null, // Store real location data
            
            // Quiz system - MAIN GAME MECHANIC
            questions: [],
            currentQuestion: null,
            currentQuestionIndex: 0,
            selectedAnswer: null,
            
            game: {
                round: 1,
                maxRounds: 10,
                money: 50,
                tree: 50,
                prestige: 50,
                activeCrops: [],
                history: [],
                usedEvents: [],
                streak: 0,
                multiplier: 1,
                totalScore: 0,
                achievements: [],
                perfectRounds: 0,
                riskMode: false,
                comboPoints: 0
            },
            highScore: 0,
            lastScore: 0,
            currentEvent: null,
            selectedOption: null,
            
            seasons: [
                { name: 'Spring', icon: '🌸' },
                { name: 'Summer', icon: '☀️' },
                { name: 'Autumn', icon: '🍂' },
                { name: 'Winter', icon: '❄️' }
            ],
            
            nasaData: {
                2015: [
                    { temp: 25, rain: 180, humidity: 75, ndvi: 0.65, soil: 28, radiation: 18.5 },
                    { temp: 28, rain: 220, humidity: 80, ndvi: 0.70, soil: 31, radiation: 22.3 },
                    { temp: 22, rain: 140, humidity: 68, ndvi: 0.58, soil: 24, radiation: 16.2 },
                    { temp: 18, rain: 95, humidity: 62, ndvi: 0.52, soil: 20, radiation: 14.1 }
                ],
                2016: [
                    { temp: 24, rain: 160, humidity: 72, ndvi: 0.62, soil: 27, radiation: 17.8 },
                    { temp: 29, rain: 195, humidity: 78, ndvi: 0.68, soil: 32, radiation: 21.5 },
                    { temp: 23, rain: 155, humidity: 70, ndvi: 0.60, soil: 25, radiation: 16.5 },
                    { temp: 19, rain: 110, humidity: 65, ndvi: 0.55, soil: 21, radiation: 14.5 }
                ],
                2017: [
                    { temp: 26, rain: 175, humidity: 76, ndvi: 0.66, soil: 29, radiation: 19.0 },
                    { temp: 30, rain: 210, humidity: 82, ndvi: 0.72, soil: 33, radiation: 23.0 },
                    { temp: 21, rain: 145, humidity: 67, ndvi: 0.59, soil: 23, radiation: 15.8 },
                    { temp: 17, rain: 100, humidity: 63, ndvi: 0.53, soil: 19, radiation: 13.8 }
                ]
            },
            
            cultures: {
                soja: {
                    name: 'Soy', icon: '🌾', profit: 15, duration: 2, seasons: [0, 1],
                    description: 'Thrives in warm, moderate rainfall',
                    needs: { temp: [22, 30], rain: [140, 220], humidity: [65, 85], soil: [20, 32], radiation: [16, 24], ndvi: [0.60, 0.75] }
                },
                milho: {
                    name: 'Corn', icon: '🌽', profit: 18, duration: 2, seasons: [0, 1],
                    description: 'Loves heat and plenty of water',
                    needs: { temp: [24, 32], rain: [160, 240], humidity: [70, 90], soil: [22, 35], radiation: [18, 26], ndvi: [0.65, 0.80] }
                },
                trigo: {
                    name: 'Wheat', icon: '🌾', profit: 12, duration: 2, seasons: [2, 3],
                    description: 'Prefers cooler temperatures',
                    needs: { temp: [15, 24], rain: [80, 150], humidity: [55, 75], soil: [15, 28], radiation: [12, 20], ndvi: [0.50, 0.65] }
                },
                feijao: {
                    name: 'Beans', icon: '🫘', profit: 14, duration: 1, seasons: [0, 2],
                    description: 'Grows well in mild conditions',
                    needs: { temp: [18, 28], rain: [120, 180], humidity: [60, 80], soil: [18, 30], radiation: [14, 22], ndvi: [0.55, 0.70] }
                }
            },
            
            events: [
                {
                    id: 1, title: 'Locust Invasion', icon: '🦗',
                    description: 'Migratory locust plague approaching. Urgent action needed!',
                    options: [
                        { text: 'Chemical Insecticide', desc: 'Conventional aerial spray', money: -5, tree: -10, prestige: -3, cropDamage: 0, message: 'Plague eliminated, soil contaminated', explanation: 'Chemical products were 100% effective in 24h but contaminated groundwater (-10 sustainability) and hurt reputation due to environmental impact.' },
                        { text: 'Biocontrol with Fungi', desc: 'Apply Metarhizium', money: -8, tree: 5, prestige: 7, cropDamage: 12, message: 'Eco method took time, moderate losses', explanation: 'Fungus took 5 days to infect locusts, causing 12% losses. Higher cost but improved sustainability and reputation as innovative producer.' },
                        { text: 'Monitor Population', desc: 'Observe without intervening', money: 0, tree: 0, prestige: -8, cropDamage: 35, message: 'Infestation devastated crops', explanation: 'Locusts consumed 35% of leaves. No direct costs but reputation plummeted due to negligence. Neighbors complained plague spread to adjacent farms.' }
                    ]
                },
                {
                    id: 2, title: 'Prolonged Drought', icon: '☀️',
                    description: '15 days without rain at 38°C. Water stress imminent!',
                    options: [
                        { text: 'Sprinkler Irrigation', desc: 'Run intensive 24h system', money: -12, tree: -6, prestige: 0, cropDamage: 3, message: 'High water use saved harvest', explanation: 'Irrigation consumed 200k liters/day, 40% evaporated from heat. Minimal losses (3%) but high energy/water cost and regional water impact.' },
                        { text: 'Mulching + Night Irrigation', desc: 'Cover + efficiency', money: -7, tree: 8, prestige: 6, cropDamage: 10, message: 'Smart management reduced damage', explanation: 'Straw retained moisture, night irrigation avoided evaporation. 10% losses from initial heat stress. Sustainable method increased prestige and soil health.' },
                        { text: 'Wait for Rain Forecast', desc: 'Trust meteorology', money: 0, tree: 0, prestige: -6, cropDamage: 28, message: 'Rains delayed, plants wilted', explanation: 'Forecast was 5 days off. Plants suffered severe dehydration (28% losses). Zero costs but poor management hurt professional reputation.' }
                    ]
                },
                {
                    id: 3, title: 'Flash Flood', icon: '💧',
                    description: '180mm rain in 6h. Low-lying flooding imminent!',
                    options: [
                        { text: 'Emergency Drainage', desc: 'Open runoff ditches', money: -10, tree: -4, prestige: 2, cropDamage: 8, message: 'Ditches saved most of it', explanation: 'Machinery opened drainage channels in 12h. 8% losses in lowest areas. High fuel cost, soil erosion (-4 sustainability) but good management.' },
                        { text: 'Early Harvest', desc: 'Harvest floodable area now', money: -6, tree: 0, prestige: -5, cropDamage: 22, message: 'Immature product, lower value', explanation: 'Grains not yet at ideal point. 22% losses in productivity and quality. Emergency night work cost extra and inferior product hurt reputation.' },
                        { text: 'Accept Flooding', desc: 'Let water drain naturally', money: 0, tree: 3, prestige: -10, cropDamage: 40, message: 'Flooding destroyed roots', explanation: 'Water remained 48h, causing root hypoxia (40% losses). No costs, slight aquifer recharge improvement, but passive management destroyed credibility.' }
                    ]
                }
            ]
        };
    },
    
    computed: {
        currentSeason() {
            const seasonIndex = (this.game.round - 1) % 4;
            return this.seasons[seasonIndex];
        },
        
        currentData() {
            const dataIndex = (this.game.round - 1) % 12;
            const year = 2015 + Math.floor(dataIndex / 4);
            const season = dataIndex % 4;
            return this.nasaData[year][season];
        },
        
        roundProgress() {
            return Math.round((this.game.round / this.game.maxRounds) * 100);
        },
        
        currentIndicators() {
            const data = this.currentData;
            return [
                {
                    icon: '🌡️',
                    title: 'Air Temp',
                    value: data.temp + '°C',
                    desc: 'MODIS Terra'
                },
                {
                    icon: '💧',
                    title: 'Rain',
                    value: data.rain + 'mm',
                    desc: 'GPM'
                },
                {
                    icon: '💨',
                    title: 'Humidity',
                    value: data.humidity + '%',
                    desc: 'AIRS'
                },
                {
                    icon: '🌿',
                    title: 'NDVI',
                    value: data.ndvi.toFixed(2),
                    desc: 'Landsat 8'
                },
                {
                    icon: '🌡️',
                    title: 'Soil',
                    value: data.soil + '°C',
                    desc: 'SMAP'
                },
                {
                    icon: '☀️',
                    title: 'Radiation',
                    value: data.radiation.toFixed(1),
                    desc: 'CERES MJ/m²'
                }
            ];
        },
        
        availableCrops() {
            const crops = {};
            const data = this.currentData;
            
            for (const [key, crop] of Object.entries(this.cultures)) {
                // Make all crops available all the time
                const tempOk = data.temp >= crop.needs.temp[0] && data.temp <= crop.needs.temp[1];
                const rainOk = data.rain >= crop.needs.rain[0] && data.rain <= crop.needs.rain[1];
                const humOk = data.humidity >= crop.needs.humidity[0] && data.humidity <= crop.needs.humidity[1];
                const ndviOk = data.ndvi >= crop.needs.ndvi[0] && data.ndvi <= crop.needs.ndvi[1];
                
                crops[key] = {
                    ...crop,
                    isMatch: tempOk && rainOk && humOk && ndviOk
                };
            }
            
            return crops;
        },
        
        finalScore() {
            const base = Math.round((this.game.money + this.game.tree + this.game.prestige) / 3);
            const streakBonus = this.game.perfectRounds * 10;
            const comboBonus = Math.floor(this.game.comboPoints / 10);
            return base + streakBonus + comboBonus;
        },
        
        finalRating() {
            const score = this.finalScore;
            if (score >= 150) return '👑 GODLIKE';
            if (score >= 120) return '💎 LEGENDARY';
            if (score >= 90) return '🏆 MASTER';
            if (score >= 60) return '⭐ EXPERT';
            return '💪 ROOKIE';
        },
        
        isNewRecord() {
            return this.finalScore > this.highScore;
        }
    },
    
    async mounted() {
        // Load quiz questions on game start
        console.log('🎮 Game mounted, loading questions...');
        await this.loadQuestions();
        if (this.questions && this.questions.length > 0) {
            console.log('✓ Loaded', this.questions.length, 'questions');
            console.log('First question:', this.questions[0].question);
        } else {
            console.error('❌ No questions loaded!');
        }
        
        // Load high score from localStorage
        const saved = localStorage.getItem('vilajHighScore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
    },
    
    methods: {
        // Load questions from JSON file
        async loadQuestions() {
            try {
                const response = await fetch('game/assets/agricultural_questions.json');
                if (!response.ok) throw new Error('Failed to load questions');
                this.questions = await response.json();
                // Shuffle questions for variety
                this.questions = this.shuffleArray(this.questions);
            } catch (error) {
                console.error('Error loading questions:', error);
                this.farmerSay('Oops! Could not load questions. Please refresh!', 5000);
            }
        },
        
        // Shuffle array helper
        shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },
        

        // Calculate event severity (number of extra icons to show)
        getEventSeverity() {
            if (!this.currentEvent) return 0;
            
            // Calculate average crop damage across options
            const avgDamage = this.currentEvent.options.reduce((sum, opt) => sum + (opt.cropDamage || 0), 0) / this.currentEvent.options.length;
            
            // More icons for worse events
            if (avgDamage >= 30) return 4; // Very severe (5 total icons)
            if (avgDamage >= 20) return 3; // Severe (4 total icons)
            if (avgDamage >= 10) return 2; // Moderate (3 total icons)
            if (avgDamage >= 5) return 1;  // Light (2 total icons)
            return 0; // Minimal (1 icon)
        },
        
        // Farmer animation helpers
        setFarmerState(state, duration = 2000) {
            this.farmerState = state;
            if (duration > 0) {
                setTimeout(() => {
                    this.farmerState = 'idle';
                }, duration);
            }
        },
        
        farmerSay(message, duration = 3000) {
            this.farmerMessage = message;
            this.farmerSpeech = true;
            setTimeout(() => {
                this.farmerSpeech = false;
            }, duration);
        },
        
        // Player name and location methods
        savePlayerName() {
            if (!this.playerName || this.playerName.trim().length < 2) {
                alert('Please enter a valid name (minimum 2 characters)');
                return;
            }
            this.gamePhase = 'locationSelect';
            this.farmerSay(`Welcome ${this.playerName}! Choose your farm location.`);
        },
        
        handleLocationSearch() {
            // Método será chamado pelo input em tempo real
        },
        
        selectLocation() {
            this.playerLocation = 'Florianópolis, Santa Catarina, Brasil';
            
            // Set default location data immediately
            this.locationData = {
                name: 'Florianópolis',
                state: 'Santa Catarina',
                country: 'Brasil',
                lat: '-27.59',
                lon: '-48.55',
                currentTemp: '24',
                currentHumidity: '75',
                currentPrecipitation: '0.0',
                currentWindSpeed: '15.0',
                climate: 'Humid Subtropical (Cfa)',
                population: '~500,000',
                area: '675 km²',
                elevation: '~3m above sea level',
                timezone: 'America/Sao_Paulo'
            };
            
            // Move to next phase immediately (don't block)
            this.gamePhase = 'welcome';
            this.farmerSay(`Great choice ${this.playerName}! Florianópolis has excellent conditions!`, 4000);
            
            // Fetch real location data in background (non-blocking)
            this.fetchLocationData().catch(err => {
                console.log('Using default location data due to:', err);
            });
        },
        
        async fetchLocationData() {
            try {
                // Use OpenStreetMap Nominatim for geocoding (free, no API key needed)
                const geoResponse = await fetch('https://nominatim.openstreetmap.org/search?q=Florianopolis,Santa+Catarina,Brazil&format=json&limit=1', {
                    headers: {
                        'User-Agent': 'VilajFarmGame/1.0'
                    }
                });
                
                if (!geoResponse.ok) {
                    throw new Error('Geocoding API failed');
                }
                
                const geoData = await geoResponse.json();
                
                if (geoData && geoData.length > 0) {
                    const location = geoData[0];
                    const lat = parseFloat(location.lat);
                    const lon = parseFloat(location.lon);
                    
                    // Fetch current weather data from Open-Meteo (free, no API key needed)
                    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=America/Sao_Paulo`);
                    
                    if (!weatherResponse.ok) {
                        throw new Error('Weather API failed');
                    }
                    
                    const weatherData = await weatherResponse.json();
                    
                    // Update location data with real values
                    this.locationData.lat = lat.toFixed(2);
                    this.locationData.lon = lon.toFixed(2);
                    
                    if (weatherData.current) {
                        this.locationData.currentTemp = Math.round(weatherData.current.temperature_2m);
                        this.locationData.currentHumidity = Math.round(weatherData.current.relative_humidity_2m);
                        this.locationData.currentPrecipitation = weatherData.current.precipitation.toFixed(1);
                        this.locationData.currentWindSpeed = weatherData.current.wind_speed_10m.toFixed(1);
                    }
                    
                    if (weatherData.timezone) {
                        this.locationData.timezone = weatherData.timezone;
                    }
                    
                    console.log('✓ Real location data updated:', this.locationData);
                }
            } catch (error) {
                console.log('Using default location data:', error.message);
                // Data already set to defaults, no need to do anything
            }
        },
        
        skipIntroduction() {
            this.playerName = 'Farmer';
            this.playerLocation = 'Florianópolis, SC, Brazil';
            this.gamePhase = 'welcome';
        },
        
        startPlanting() {
            // Make sure questions are loaded before starting
            if (!this.questions || this.questions.length === 0) {
                this.farmerSay("Hold on! Loading questions first...");
                setTimeout(() => this.startPlanting(), 1000);
                return;
            }
            
            this.gamePhase = 'planting';
            this.farmerSay("Choose your crop wisely!");
        },
        
        plantCrop(cropKey) {
            const crop = this.cultures[cropKey];
            const isPerfect = this.availableCrops[cropKey].isMatch;
            
            this.game.activeCrops.push({
                type: cropKey,
                name: crop.name,
                icon: crop.icon,
                progress: 0,
                duration: crop.duration,
                profit: crop.profit,
                damage: 0,
                harvested: false,
                isPerfect: isPerfect
            });
            
            // Track perfect selections
            if (isPerfect) {
                this.game.perfectRounds++;
                this.game.comboPoints += 5;
                this.setFarmerState('jumping', 1500);
                this.farmerSay(`PERFECT MATCH! +5 COMBO`);
            } else {
                this.setFarmerState('walking', 1500);
                this.farmerSay(`Risky... but might work!`);
            }
            
            // Go to learning phase instead of event
            setTimeout(() => {
                this.showLearningContext();
            }, 1500);
        },
        
        // Show educational context before question
        showLearningContext() {
            // Check if questions are loaded
            if (!this.questions || this.questions.length === 0) {
                console.error('No questions loaded!');
                this.farmerSay("Oops! Questions didn't load. Let me try again...");
                setTimeout(() => this.loadQuestions(), 1000);
                return;
            }
            
            if (this.currentQuestionIndex >= this.questions.length) {
                this.currentQuestionIndex = 0; // Loop questions
            }
            
            this.currentQuestion = this.questions[this.currentQuestionIndex];
            this.gamePhase = 'learnContext';
            
            console.log('Showing question:', this.currentQuestion.question);
            
            this.setFarmerState('idle', 0);
            this.farmerSay("Let me teach you something cool about farming!");
        },
        
        // Continue to question after reading context
        continueToQuestion() {
            this.gamePhase = 'question';
            this.selectedAnswer = null;
            this.setFarmerState('idle', 0);
            this.farmerSay("Now answer this question!");
        },
        
        // Select answer
        selectAnswer(answerLetter) {
            this.selectedAnswer = answerLetter;
        },
        
        // Submit answer and see result
        submitAnswer() {
            const isCorrect = this.selectedAnswer === this.currentQuestion.correct;
            
            // Store explanation for results screen
            if (this.currentQuestion.explanation) {
                this.lastAnswerExplanation = this.currentQuestion.explanation;
            } else {
                this.lastAnswerExplanation = '';
            }
            
            if (isCorrect) {
                this.game.streak++;
                this.game.multiplier = Math.min(1 + (this.game.streak * 0.3), 5);
                this.game.comboPoints += this.game.streak;
                
                // Random critical hit (20% chance)
                const isCritical = Math.random() < 0.2;
                const critMultiplier = isCritical ? 2 : 1;
                
                this.setFarmerState('jumping', 1500);
                
                const baseReward = 20;
                const bonusMoney = Math.round(baseReward * this.game.multiplier * critMultiplier);
                const bonusTree = Math.round(10 * this.game.multiplier * critMultiplier);
                const bonusPrestige = Math.round(15 * this.game.multiplier * critMultiplier);
                
                this.game.money += bonusMoney;
                this.game.tree += bonusTree;
                this.game.prestige += bonusPrestige;
                this.game.totalScore += bonusMoney + bonusTree + bonusPrestige;
                
                if (isCritical) {
                    this.farmerSay(`⚡ CRITICAL HIT! ${this.game.streak}x STREAK! +${bonusMoney}!`);
                } else if (this.game.streak >= 5) {
                    this.farmerSay(`🔥 ON FIRE! ${this.game.streak}x STREAK!`);
                } else if (this.game.streak > 1) {
                    this.farmerSay(`${this.game.streak}x COMBO! +${bonusMoney}!`);
                }
                
                // Check achievements
                this.checkAchievements();
            } else {
                this.game.streak = 0;
                this.game.multiplier = 1;
                this.setFarmerState('sad', 2000);
                
                this.game.money -= 15;
                this.game.tree -= 12;
                this.farmerSay(`STREAK BROKEN!`);
            }
            
            this.currentQuestionIndex++;
            
            setTimeout(() => {
                this.triggerEventBasedOnAnswer(isCorrect);
            }, 2000);
        },
        
        checkAchievements() {
            const achievements = [];
            
            if (this.game.streak === 5 && !this.game.achievements.includes('hotstreak')) {
                achievements.push({ id: 'hotstreak', name: '🔥 HOT STREAK', desc: '5 correct in a row!' });
                this.game.achievements.push('hotstreak');
            }
            
            if (this.game.streak === 10 && !this.game.achievements.includes('unstoppable')) {
                achievements.push({ id: 'unstoppable', name: '⚡ UNSTOPPABLE', desc: '10 streak combo!' });
                this.game.achievements.push('unstoppable');
                this.game.money += 50;
            }
            
            if (this.game.perfectRounds === 5 && !this.game.achievements.includes('perfectionist')) {
                achievements.push({ id: 'perfectionist', name: '💎 PERFECTIONIST', desc: '5 perfect matches!' });
                this.game.achievements.push('perfectionist');
                this.game.tree += 50;
            }
            
            if (achievements.length > 0) {
                setTimeout(() => {
                    achievements.forEach(ach => {
                        this.farmerSay(`ACHIEVEMENT: ${ach.name}`);
                    });
                }, 1000);
            }
        },
        
        // Trigger event based on answer correctness
        triggerEventBasedOnAnswer(isCorrect) {
            // If answer was correct, get easier events
            // If wrong, get harder events
            let availableEvents = this.events.filter(e => !this.game.usedEvents.includes(e.id));
            
            if (availableEvents.length === 0) {
                this.game.usedEvents = [];
                availableEvents = this.events;
            }
            
            this.currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            this.game.usedEvents.push(this.currentEvent.id);
            this.gamePhase = 'event';
            
            // Farmer reacts to event
            this.setFarmerState('running', 1000);
            if (isCorrect) {
                this.farmerSay("Thanks to your knowledge, we're prepared!");
            } else {
                this.farmerSay("Uh oh, this might be tougher to handle!");
            }
        },
        
        triggerEvent() {
            let availableEvents = this.events.filter(e => !this.game.usedEvents.includes(e.id));
            
            if (availableEvents.length === 0) {
                this.game.usedEvents = [];
                availableEvents = this.events;
            }
            
            this.currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            this.game.usedEvents.push(this.currentEvent.id);
            this.gamePhase = 'event';
            
            // Farmer reacts to event
            this.setFarmerState('running', 1000);
            this.farmerSay("Oh no! We need to handle this situation!");
        },
        
        selectEventOption(optionIndex) {
            this.selectedOption = this.currentEvent.options[optionIndex];
            
            this.game.money += this.selectedOption.money;
            this.game.tree += this.selectedOption.tree;
            this.game.prestige += this.selectedOption.prestige;
            
            if (this.selectedOption.cropDamage > 0 && this.game.activeCrops.length > 0) {
                this.game.activeCrops[this.game.activeCrops.length - 1].damage = this.selectedOption.cropDamage;
            }
            
            // Farmer reacts to decision
            const totalImpact = this.selectedOption.money + this.selectedOption.tree + this.selectedOption.prestige;
            if (totalImpact > 5) {
                this.setFarmerState('jumping', 500);
                this.farmerSay("Great choice! That worked out well!");
            } else if (totalImpact < -5) {
                this.setFarmerState('sad', 3000);
                this.farmerSay("Ouch... that hurt. We'll learn from this.");
            } else {
                this.setFarmerState('walking', 1500);
                this.farmerSay("Alright, let's see how this plays out.");
            }
            
            this.gamePhase = 'eventResult';
        },
        
        showResults() {
            // Process crops
            const data = this.currentData;
            
            this.game.activeCrops.forEach(crop => {
                crop.progress++;
                
                const c = this.cultures[crop.type];
                let compatibility = 0;
                
                if (data.temp >= c.needs.temp[0] && data.temp <= c.needs.temp[1]) compatibility++;
                if (data.rain >= c.needs.rain[0] && data.rain <= c.needs.rain[1]) compatibility++;
                if (data.humidity >= c.needs.humidity[0] && data.humidity <= c.needs.humidity[1]) compatibility++;
                if (data.ndvi >= c.needs.ndvi[0] && data.ndvi <= c.needs.ndvi[1]) compatibility++;
                
                const compatibilityPct = (compatibility / 4) * 100;
                const growthImpact = (compatibilityPct / 100) * 5;
                this.game.tree += growthImpact;
                
                if (crop.progress >= crop.duration) {
                    const damageReduction = crop.damage / 100;
                    const finalProfit = Math.round(crop.profit * (compatibilityPct / 100) * (1 - damageReduction));
                    this.game.money += finalProfit;
                    this.game.prestige += Math.round(compatibilityPct / 20);
                    crop.finalProfit = finalProfit;
                    crop.harvested = true;
                }
            });
            
            // Remove harvested crops
            const harvested = this.game.activeCrops.filter(c => c.harvested).length;
            this.game.activeCrops = this.game.activeCrops.filter(c => !c.harvested || c.progress < c.duration);
            
            // Farmer celebrates harvest
            if (harvested > 0) {
                this.setFarmerState('jumping', 800);
                this.farmerSay(`Harvest time! We collected ${harvested} crop(s)!`);
            }
            
            this.gamePhase = 'results';
        },
        
        nextQuarter() {
            this.game.round++;
            
            if (this.game.round > this.game.maxRounds) {
                this.gamePhase = 'gameover';
                
                const score = this.finalScore;
                this.lastScore = score;
                
                // Save high score
                if (score > this.highScore) {
                    this.highScore = score;
                    localStorage.setItem('vilajHighScore', score.toString());
                    this.setFarmerState('jumping', 0);
                    this.farmerSay("NEW RECORD!");
                } else if (score >= 120) {
                    this.setFarmerState('jumping', 0);
                    this.farmerSay("LEGENDARY!");
                } else if (score >= 90) {
                    this.setFarmerState('walking', 0);
                    this.farmerSay("MASTER LEVEL!");
                } else {
                    this.setFarmerState('sad', 0);
                    this.farmerSay("TRY AGAIN!");
                }
                return;
            }
            
            this.setFarmerState('walking', 1500);
            this.farmerSay(`Round ${this.game.round}/${this.game.maxRounds}`);
            this.gamePhase = 'planting';
        },
        
        restartGame() {
            this.game = {
                round: 1,
                maxRounds: 10,
                money: 50,
                tree: 50,
                prestige: 50,
                activeCrops: [],
                history: [],
                usedEvents: [],
                streak: 0,
                multiplier: 1,
                totalScore: 0,
                achievements: [],
                perfectRounds: 0,
                riskMode: false,
                comboPoints: 0
            };
            this.gamePhase = 'planting';
            this.currentEvent = null;
            this.selectedOption = null;
            this.farmerState = 'idle';
            this.farmerSpeech = false;
            this.currentQuestionIndex = 0;
            this.farmerSay("BEAT YOUR RECORD!");
        }
    }
}).mount('#app');


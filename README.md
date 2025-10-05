# 🌾 AgriSpace Quest - NASA Farm Simulator

An educational **farming simulation game** with authentic **16-bit retro design**, powered by real NASA satellite data and Vue.js.

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)
![NASA](https://img.shields.io/badge/NASA-E03C31?style=for-the-badge&logo=nasa&logoColor=white)
![AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

## 🎮 Game Features

### 🌱 Farm Simulation
- **Manage a farm for 10 years** (40 quarters from 2015-2025)
- **Use real NASA satellite data** to make crop decisions
- **Handle climate events** like droughts, floods, locust invasions, wildfires
- **Balance three resources**: Money 💰, Sustainability 🌳, and Prestige ⭐

### 🛰️ Real NASA Data
The game uses actual satellite data from:
- **MODIS Terra**: Air temperature monitoring
- **GPM**: Global Precipitation Measurement
- **AIRS**: Atmospheric Infrared Sounder (humidity)
- **Landsat 8**: NDVI (vegetation health index)
- **SMAP**: Soil Moisture Active Passive (soil temperature)
- **CERES**: Clouds and Earth's Radiant Energy System (solar radiation)

### 🕹️ 16-Bit Retro Design
- **Authentic SNES/Genesis era** pixel art aesthetic
- **Press Start 2P** retro font
- **Scanline effects** for CRT monitor feel
- **Pixel borders** and retro color palette
- **Nostalgic 90s gaming** experience

### 🎯 Strategic Gameplay
- **Choose crops wisely** based on temperature, rainfall, humidity, and NDVI
- **Handle emergencies** with multiple decision paths (each with consequences)
- **Learn from mistakes** with detailed explanations after each choice
- **Compete for high scores** based on money, sustainability, and prestige

## 🚀 Quick Start

### Play the Game (No Installation Required!)

Simply open in a web browser:

```bash
# From project root
open index.html  # macOS
# or
xdg-open index.html  # Linux  
# or just double-click index.html on Windows
```

**That's it!** The game runs entirely in your browser with Vue.js loaded from CDN.

## 🎯 How to Play

### Starting Your Farm
1. **Click "Launch Mission"** to begin your 10-year farming journey
2. **Read the NASA data** in the left sidebar (temperature, rain, humidity, etc.)

### Planting Crops
3. **Choose a crop** based on current conditions
   - 🌾 **Soy**: Spring/Summer (22-30°C, moderate rain)
   - 🌽 **Corn**: Spring/Summer (24-32°C, high rain)
   - 🌾 **Wheat**: Autumn/Winter (15-24°C, low rain)
   - 🫘 **Beans**: Spring/Autumn (18-28°C, moderate rain)

4. **Check compatibility**: Green = ✅ Ideal, Red = ⚠️ Not ideal
   - Ideal conditions = higher profits
   - Poor conditions = lower yields

### Handling Events
5. **Face climate challenges** every quarter
   - Locust invasions 🦗
   - Droughts ☀️
   - Floods 💧
   - Wildfires 🔥
   - And more!

6. **Choose your response**:
   - **Chemical solutions**: Fast but hurt sustainability
   - **Eco-friendly options**: Slower but improve reputation
   - **Wait and see**: No cost but higher risk

7. **Learn from results**: Each choice has detailed explanations

### Harvesting & Progress
8. **Harvest crops** after their growth period (1-2 quarters)
9. **Track your progress** in the top bar
10. **Complete 40 quarters** to see your final score!

### Winning Strategy
- Balance **short-term profits** vs **long-term sustainability**
- **Match crops to conditions** for maximum yield
- **Think ahead** about climate impacts
- **Learn from failed decisions** (that's the educational part!)

## 📊 Resources Explained

### 💰 Money
- Used to buy equipment, seeds, and handle emergencies
- Earned by harvesting crops
- Affected by: crop sales, event costs, damage control

### 🌳 Sustainability
- Represents environmental health of your farm
- Affected by: chemical use, erosion, biocontrol, cover crops
- Important for long-term viability

### ⭐ Prestige
- Your reputation in the farming community
- Affected by: innovation, good decisions, poor management
- Opens up opportunities and certifications

## 🎓 Educational Topics

### Remote Sensing Concepts
- **NDVI**: How satellites measure plant health
- **Multispectral imaging**: Using different light wavelengths
- **Temporal analysis**: Tracking changes over time
- **Ground truth validation**: Comparing satellite data to reality

### Climate & Agriculture
- **Drought stress**: Impact of water shortage on crops
- **Heat stress**: Temperature effects on plant growth
- **Flood damage**: Root hypoxia and soil erosion
- **Seasonal patterns**: Crop compatibility with climate

### Sustainable Farming
- **Biocontrol vs chemicals**: Ecological pest management
- **Water efficiency**: Mulching, drip irrigation, timing
- **Soil conservation**: Terracing, cover crops, rotation
- **Carbon footprint**: Energy use and emissions

### Decision Making
- **Risk vs reward**: Short-term gains vs long-term costs
- **Uncertainty**: Dealing with unpredictable weather
- **Systems thinking**: How choices affect multiple resources
- **Adaptive management**: Learning from outcomes

## 📁 Project Structure

```
vilaj/
├── index.html                      # Main game (Vue.js farm simulator)
├── appeears_products.json          # NASA AppEEARS API data
│
├── question-generator/             # AI-powered question generator
│   ├── generate_questions.py       # Python script using Gemini AI
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Generator documentation
│
└── game/                           # Game assets & styles
    ├── css/
    │   └── style.css              # 16-bit retro styles
    └── js/
        ├── main.js                 # Original Three.js game (archived)
        └── farm-game.js            # Vue.js farm simulator logic
```

## 🛠️ Technology Stack

- **Vue.js 3**: Reactive framework for game state management
- **CSS3**: 16-bit retro pixel art styling with scanline effects
- **JavaScript (ES6+)**: Game logic and event handling
- **NASA AppEEARS API**: Real satellite data products
- **Python + Gemini AI**: Question generation (optional feature)

## 🎨 Customization

### Add More Crops

Edit `game/js/farm-game.js`:

```javascript
cultures: {
    tomato: {
        name: 'Tomato', 
        icon: '🍅', 
        profit: 20, 
        duration: 2, 
        seasons: [0, 1],
        needs: { 
            temp: [20, 32], 
            rain: [100, 200], 
            humidity: [60, 85], 
            ndvi: [0.60, 0.75] 
        }
    }
}
```

### Add More Events

```javascript
events: [
    {
        id: 16,
        title: 'Heatwave',
        icon: '🔥',
        description: 'Temperature reaches 42°C for 5 days!',
        options: [
            { 
                text: 'Install shade nets', 
                desc: 'Physical protection',
                money: -10, 
                tree: 3, 
                prestige: 5, 
                cropDamage: 5,
                message: 'Nets reduced heat stress',
                explanation: 'Shade nets blocked 40% of solar radiation...'
            }
        ]
    }
]
```

### Modify Retro Design

Edit `index.html` styles or `game/css/style.css`:

```css
/* Change color scheme */
:root {
    --pixel-green: #00ff00;  /* Change to any color */
    --pixel-yellow: #ffff00;
    --pixel-red: #ff0055;
}
```

## 🏆 Score Calculation

Final Score = Average of (Money + Sustainability + Prestige)

- **🏆 Excellent** (80-100): Master farmer!
- **🥈 Very Good** (60-79): Strong performance
- **🥉 Good** (40-59): Solid foundation
- **📈 Keep Practicing** (<40): Learn and try again!

## 🌍 Real-World Applications

This game teaches concepts used by:
- **Commercial farmers**: Crop selection, irrigation planning
- **Agricultural consultants**: Risk assessment, sustainability audits
- **Climate scientists**: Understanding climate-agriculture interactions
- **Policy makers**: Food security and environmental balance

## 🤝 Contributing

Want to improve the game? Ideas:
- Add more crop varieties (rice, cotton, vegetables)
- Include more climate events (hailstorms, tornados)
- Add farm upgrades (irrigation systems, equipment)
- Implement multiplayer/leaderboards
- Add tutorial mode with hints
- Create different biomes/regions

## 📚 Educational Standards

Aligns with:
- **NGSS** (Next Generation Science Standards)
- **Earth & Space Science** curricula
- **STEM** education programs
- **Environmental Science** courses
- **Decision Making & Systems Thinking** frameworks

## 🙏 Acknowledgments

- **NASA** for AppEEARS API and free satellite data access
- **Vue.js** community for the amazing reactive framework
- **Google** for Gemini AI (question generation)
- **Farmers and agronomists** who provided domain knowledge
- **Retro gaming community** for pixel art inspiration

## 📖 Resources

- [AppEEARS Documentation](https://appeears.earthdatacloud.nasa.gov/api/)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [NASA Earthdata](https://earthdata.nasa.gov/)
- [Agricultural Remote Sensing](https://www.fao.org/3/ca7184en/ca7184en.pdf)

## 📝 License

Educational project using publicly available NASA data and open-source technologies.

---

**Made with 💚 for kids, teens, and anyone curious about how satellites help feed the world!**

🌍 **Farm • Learn • Thrive** 🛰️

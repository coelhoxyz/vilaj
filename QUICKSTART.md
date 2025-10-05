# 🚀 Quick Start Guide

Get started with AgriSpace Quest in 3 easy steps!

## Option 1: Play Immediately (Recommended)

Just play the game with sample questions:

```bash
cd game
open index.html
```

**That's it!** The game works right away with 3 sample questions.

## Option 2: Generate Full 100 Questions

Want the complete experience? Generate 100 AI-powered questions:

### 1. Get Your Free API Key

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) and get a free Gemini API key (takes 2 minutes).

### 2. Set Up Question Generator

```bash
# Go to question generator folder
cd question-generator

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
export GEMINI_API_KEY='your-api-key-here'
```

### 3. Generate Questions

```bash
# Generate 100 questions
python generate_questions.py

# This creates agricultural_questions.json
```

### 4. Copy to Game

```bash
# Copy generated questions to game
cp agricultural_questions.json ../game/assets/
```

### 5. Play!

```bash
cd ../game
open index.html
```

## 🎮 Game Controls

- **Mouse**: Look around and interact
- **Click Orbs**: Answer questions
- **Follow Instructions**: The game will guide you!

## 🎯 Difficulty Levels

- 🌱 **Easy**: Perfect for beginners (green orbs)
- 🌿 **Medium**: Moderate challenge (yellow orbs)
- 🌳 **Hard**: Expert level (red orbs)
- 🌈 **All Levels**: Mix of everything

## 🔧 Troubleshooting

### Questions not loading?

Make sure `game/assets/agricultural_questions.json` exists. The game includes 3 sample questions by default.

### Python script fails?

1. Check Python version: `python --version` (need 3.7+)
2. Make sure you set GEMINI_API_KEY
3. Check internet connection

### Game not working?

1. Use a modern browser (Chrome, Firefox, Safari, Edge)
2. Check browser console for errors (F12)
3. Make sure JavaScript is enabled

## 📚 Learn More

- Read the full [README.md](README.md)
- Check [question-generator/README.md](question-generator/README.md)
- Visit [NASA AppEEARS](https://appeears.earthdatacloud.nasa.gov/)

## 🎉 Have Fun!

Remember: Every expert was once a beginner. Enjoy learning about satellite agriculture! 🌍🛰️🌾


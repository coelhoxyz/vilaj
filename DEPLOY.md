# 🚀 Deploy to Vercel

## Quick Deploy

1. **Install Vercel CLI** (if you haven't):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Production Deploy**:
   ```bash
   vercel --prod
   ```

## Or Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a static site
5. Click "Deploy"

That's it! ✨

## Project Structure

- `index.html` - Main game file
- `game/` - Game assets, CSS, JS
  - `assets/` - Questions JSON, sprites
  - `css/` - Styles
  - `js/` - Game logic (Vue.js)
- `question-generator/` - Python script to generate questions (excluded from deploy)

## Tech Stack

- **Frontend**: Vue.js 3 (CDN)
- **Styling**: Custom CSS with 16-bit retro pixel art theme
- **Questions**: 30 educational questions about agriculture
- **Data**: NASA AppEEARS satellite data

## Features

- 📚 Educational context before each question
- 🎮 Quiz-based gameplay with farming simulation
- 👨‍🌾 Animated pixel art farmer
- 📊 Real-time NASA satellite data
- 🎨 Custom color palette (#0c0c35, #D1C3F6, #4f4bdb, #77C307)
- ⭐ Progress tracking (Money, Sustainability, Prestige)

## Local Development

```bash
# Start local server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

## Generate More Questions

See `question-generator/README.md` for instructions on generating additional questions using the Gemini API.


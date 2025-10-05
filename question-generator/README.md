# Question Generator

This folder contains the scripts to generate educational questions about agricultural satellite data from NASA's AppEEARS API.

## Files

- `generate_questions.py` - Main script that generates questions using Gemini AI
- `requirements.txt` - Python dependencies
- `agricultural_questions.json` - Generated questions (output)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Get your free Gemini API key:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in and create an API key

3. Set environment variable:
```bash
export GEMINI_API_KEY='your-api-key-here'
```

## Usage

Run from the project root:
```bash
python question-generator/generate_questions.py
```

Or from this folder:
```bash
cd question-generator
python generate_questions.py
```

This will:
- Load `../appeears_products.json` (the API data)
- Filter agricultural-relevant products
- Generate 100 questions using Gemini AI
- Save to `agricultural_questions.json`

## Customization

Edit `generate_questions.py` to:
- Change number of questions (default: 100)
- Adjust difficulty distribution
- Add more agricultural keywords
- Customize question categories


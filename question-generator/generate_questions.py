#!/usr/bin/env python3
"""
AppEEARS Agricultural Question Generator
Generates educational questions about agricultural satellite data products
"""

import json
import os
import re
import sys
import requests
from typing import List, Dict
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai not installed")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed, using environment variables directly")
    print("Run: pip install python-dotenv (optional)")

# Agricultural keywords to filter relevant products
AGRICULTURAL_KEYWORDS = [
    'vegetation', 'ndvi', 'evi', 'land cover', 'crop', 'agriculture',
    'lai', 'fpar', 'photosynthetically', 'gross primary productivity',
    'gpp', 'npp', 'primary production', 'evapotranspiration', 
    'soil moisture', 'land surface temperature', 'surface reflectance',
    'burned area', 'fire', 'phenology', 'albedo'
]

def get_products_path():
    """Get the path to appeears_products.json"""
    # Check if running from question-generator folder or project root
    if os.path.exists('appeears_products.json'):
        return 'appeears_products.json'
    elif os.path.exists('../appeears_products.json'):
        return '../appeears_products.json'
    else:
        raise FileNotFoundError("Could not find appeears_products.json")

def load_products() -> List[Dict]:
    """Load AppEEARS products from JSON file"""
    products_path = get_products_path()
    with open(products_path, 'r') as f:
        return json.load(f)

def filter_agricultural_products(products: List[Dict]) -> List[Dict]:
    """Filter products relevant to agriculture"""
    agricultural_products = []
    
    for product in products:
        description = product.get('Description', '').lower()
        product_name = product.get('Product', '').lower()
        
        # Check if any agricultural keyword is in the description or product name
        if any(keyword in description or keyword in product_name 
               for keyword in AGRICULTURAL_KEYWORDS):
            agricultural_products.append(product)
    
    return agricultural_products

def login_to_appeears(username: str, password: str) -> str:
    """Login to AppEEARS API and get authentication token"""
    try:
        login_url = "https://appeears.earthdatacloud.nasa.gov/api/login"
        response = requests.post(
            login_url,
            auth=(username, password),
            timeout=30
        )
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✓ Successfully logged in to AppEEARS API\n")
            return token
        else:
            print(f"✗ Login failed with status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"✗ Login error: {e}")
        return None

def fetch_bundle_layers(product_name: str, version: str, token: str) -> List[Dict]:
    """Fetch layer/band information from AppEEARS bundle endpoint"""
    try:
        bundle_url = f"https://appeears.earthdatacloud.nasa.gov/api/bundle/{product_name}/{version}"
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.get(bundle_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            # Extract layers/bands information
            layers = data.get('layers', [])
            if not layers:
                # Try alternate field names
                layers = data.get('bands', [])
            return layers
        else:
            return []
            
    except Exception as e:
        print(f"  Warning: Could not fetch bundle for {product_name}: {e}")
        return []

def enrich_products_with_metadata(products: List[Dict], token: str = None, max_products: int = 20) -> List[Dict]:
    """Prepare agricultural products with metadata and layer information"""
    enriched_products = []
    
    print(f"Fetching detailed layer information from AppEEARS API...")
    print(f"(Processing {min(len(products), max_products)} products)\n")
    
    for i, product in enumerate(products[:max_products]):
        product_name = product.get('Product')
        version = product.get('Version')
        
        print(f"  [{i+1}/{min(len(products), max_products)}] Fetching {product_name}...")
        
        enriched_product = product.copy()
        
        # Add helpful metadata
        enriched_product['DocumentationLink'] = product.get('DocLink', '')
        enriched_product['DOI'] = product.get('DOI', '')
        
        # Add a simplified description for kids
        description = product.get('Description', '')
        enriched_product['UseCases'] = get_agricultural_use_case(product_name, description)
        
        # Fetch layer information if token is available
        if token:
            layers = fetch_bundle_layers(product_name, version, token)
            enriched_product['Layers'] = layers
            enriched_product['LayerCount'] = len(layers)
        else:
            enriched_product['Layers'] = []
            enriched_product['LayerCount'] = 0
        
        enriched_products.append(enriched_product)
    
    print(f"\n✓ Successfully prepared {len(enriched_products)} products\n")
    
    # Save enriched data for verification
    os.makedirs('data', exist_ok=True)
    output_file = 'data/enriched_products_with_metadata.json'
    with open(output_file, 'w') as f:
        json.dump(enriched_products, indent=2, fp=f)
    print(f"✓ Saved product data to {output_file}")
    print(f"  You can verify by checking DocLink for each product\n")
    
    return enriched_products

def get_agricultural_use_case(product_name: str, description: str) -> str:
    """Generate simple use case description based on product type"""
    desc_lower = description.lower()
    
    if 'ndvi' in desc_lower or 'vegetation' in desc_lower:
        return "Helps farmers see how healthy their crops are by measuring how green plants are"
    elif 'temperature' in desc_lower or 'lst' in desc_lower:
        return "Measures how hot or cold the ground is, which affects crop growth"
    elif 'moisture' in desc_lower or 'water' in desc_lower:
        return "Shows how much water is in the soil to help decide when to water crops"
    elif 'fire' in desc_lower or 'burn' in desc_lower:
        return "Detects fires and burned areas to protect farms and manage land"
    elif 'lai' in desc_lower or 'leaf area' in desc_lower:
        return "Measures how many leaves plants have, showing if they're growing well"
    elif 'albedo' in desc_lower or 'reflectance' in desc_lower:
        return "Shows how much sunlight bounces off the ground, affecting soil temperature"
    elif 'land cover' in desc_lower:
        return "Identifies what type of land is in an area (crops, forest, water, etc.)"
    elif 'evapotranspiration' in desc_lower:
        return "Measures how much water plants release into the air, important for irrigation"
    elif 'productivity' in desc_lower:
        return "Measures how fast plants are growing and making food through photosynthesis"
    else:
        return "Provides satellite data to help farmers make better decisions"

def create_product_summary(products: List[Dict]) -> str:
    """Create a summary of agricultural products for the AI"""
    summary = "# Agricultural Satellite Data Products\n\n"
    summary += "These NASA satellite datasets help farmers and scientists monitor crops and make better decisions:\n\n"
    
    for product in products[:20]:  # Limit to avoid token limits
        summary += f"## {product['Product']} - {product['Description']}\n"
        summary += f"**Platform:** {product['Platform']}\n"
        summary += f"**Resolution:** {product['Resolution']} | **Frequency:** {product['TemporalGranularity']}\n"
        
        # Add use case if available
        if product.get('UseCases'):
            summary += f"**What it does:** {product['UseCases']}\n"
        
        # Add documentation link
        if product.get('DocumentationLink'):
            summary += f"**Documentation:** {product['DocumentationLink']}\n"
        
        summary += "\n"
    
    return summary

def generate_questions_with_gemini(products: List[Dict], api_key: str, num_questions: int = 100) -> List[Dict]:
    """Generate educational questions using Gemini API"""
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    product_summary = create_product_summary(products)
    
    prompt = f"""You are an educational game designer creating SCENARIO-BASED questions about sustainable agriculture and farming decisions for CHILDREN ages 6-15.

Using the satellite data products and their measurements below, create {num_questions} decision-making scenario questions.

{product_summary}

IMPORTANT - Question Style:
Create PRACTICAL, SCENARIO-BASED questions about agricultural decisions and their consequences, NOT just factual questions.

Since this is for CHILDREN (ages 6-15), each question MUST include:
1. An "educational_context" field that explains the concept BEFORE the question (kid-friendly language)
2. Simple, clear language they can understand
3. Relatable scenarios from everyday life

Examples of GOOD questions with educational context:

Question with context:
- educational_context: "NDVI is like a health score for plants! Healthy green plants have high scores (0.7-0.9), while sick or dying plants have low scores (0.2-0.4). Satellites measure this to help farmers know if their crops are doing well."
- question: "Your farm's NDVI score dropped from 0.8 to 0.3 in two weeks. What should you check first?"

- educational_context: "Soil moisture tells us how much water is in the soil. Plants need water to grow, but too much or too little can hurt them. Satellites can measure soil moisture from space!"
- question: "A farmer notices soil moisture levels are very low. What's the best thing to do?"

Examples of BAD questions (avoid these):
- "What does NDVI stand for?" (too factual, no context)
- Questions with technical jargon without explanation
- Complex scenarios without teaching the concept first

Question Requirements:
1. ALWAYS include "educational_context" that teaches the concept first (2-3 sentences, kid-friendly)
2. Focus on DECISION-MAKING: "What should you do if...", "What happens when...", "How should a farmer respond when..."
3. Include CONSEQUENCES: Show cause and effect relationships
4. Teach SUSTAINABLE PRACTICES: Emphasize caring for the environment
5. Use REAL DATA VALUES but explain what they mean in simple terms
6. Make scenarios RELATABLE: Use situations kids can imagine
7. Use simple, clear language (no unexplained technical terms)
8. Mix difficulty: easy (simple concepts), medium (multiple factors), hard (complex decisions)

Categories to cover:
- Crop Health Monitoring
- Water Management
- Soil Health
- Sustainable Farming Practices
- Climate Impact
- Decision Making

JSON Format (return ONLY valid JSON):
[
  {{
    "educational_context": "2-3 sentences explaining the concept in kid-friendly language",
    "question": "Scenario-based question about a farming decision or observation?",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correct": "A",
    "explanation": "Why this is the best decision and what consequences the other choices might have (kid-friendly)",
    "difficulty": "easy/medium/hard",
    "category": "Category Name"
  }}
]

Generate exactly {num_questions} EDUCATIONAL, SCENARIO-BASED questions with context that teach kids ages 6-15 how real-world farming decisions work!"""

    print("Generating questions with Gemini AI...")
    print(f"This may take a minute for {num_questions} questions...\n")
    
    try:
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present (more robust)
        if '```' in response_text:
            # Find content between code blocks
            parts = response_text.split('```')
            for part in parts:
                part = part.strip()
                # Skip empty parts
                if not part:
                    continue
                # Remove language identifier if present (json, javascript, js, etc.)
                if part.lower().startswith(('json', 'javascript', 'js')):
                    # Remove the language identifier line
                    lines = part.split('\n', 1)
                    if len(lines) > 1:
                        part = lines[1].strip()
                    else:
                        continue
                # Try to parse this part as JSON
                if part.startswith('[') or part.startswith('{'):
                    response_text = part
                    break
        
        # Clean up any remaining markdown or whitespace
        response_text = response_text.strip()
        
        # Fix common JSON errors from AI generation
        response_text = re.sub(r',(\s*])', r'\1', response_text)  # Remove comma before ]
        response_text = re.sub(r',(\s*})', r'\1', response_text)  # Remove comma before }
        response_text = re.sub(r'",%([\s\n])', r'"\1', response_text)  # Remove ,% after quotes
        response_text = re.sub(r'",%', r'"', response_text)  # Remove ,% patterns
        response_text = re.sub(r',\s*%', r'', response_text)  # Remove ,% patterns
        
        # Remove any trailing characters after the closing bracket
        if ']' in response_text:
            bracket_index = response_text.rfind(']')
            if bracket_index > 0 and bracket_index < len(response_text) - 1:
                # Check if there's junk after the closing bracket
                after_bracket = response_text[bracket_index+1:].strip()
                if after_bracket and after_bracket not in ['', '}']:
                    print("  Warning: Removing trailing characters after JSON...")
                    response_text = response_text[:bracket_index+1]
                    print("  ✓ Cleaned JSON")
        
        # Check if JSON is complete (ends with ] or })
        if not response_text.endswith(']') and not response_text.endswith('}'):
            print("  Warning: Response appears truncated, attempting to fix...")
            # Try to find the last complete question
            last_complete = response_text.rfind('},')
            if last_complete > 0:
                response_text = response_text[:last_complete+1] + '\n]'
                print("  ✓ Fixed truncated JSON")
        
        questions = json.loads(response_text)
        
        print(f"✓ Successfully generated {len(questions)} questions!")
        return questions
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        print("\nDebug: Saving raw response to debug_response.txt for inspection...")
        try:
            with open('debug_response.txt', 'w') as f:
                f.write(response.text if 'response' in locals() else 'No response received')
            print("✓ Raw response saved to debug_response.txt")
        except:
            pass
        print("\nGenerating fallback questions...")
        return generate_fallback_questions()

def generate_fallback_questions() -> List[Dict]:
    """Generate some basic fallback questions if API fails"""
    return [
        {
            "educational_context": "Satellites in space take special pictures of Earth that help us see how healthy plants are. One measurement they use is called NDVI, which is like a report card for plant health. High numbers mean healthy plants!",
            "question": "A farmer sees their field has an NDVI score of 0.8. What does this tell them?",
            "options": [
                "A) The plants are very healthy and growing well",
                "B) The plants are dying and need help",
                "C) There is no water in the soil",
                "D) It's time to harvest"
            ],
            "correct": "A",
            "explanation": "NDVI scores range from 0 to 1. A score of 0.8 is very high, which means the plants are healthy and green! Low scores (like 0.2) would mean the plants are stressed or unhealthy.",
            "difficulty": "easy",
            "category": "Crop Health Monitoring"
        },
        {
            "educational_context": "Farmers need to know if their crops are getting enough water. Satellites can measure soil moisture from space! This helps farmers decide when to water their crops and save water at the same time.",
            "question": "If satellite data shows your field has very low soil moisture, what should you do?",
            "options": [
                "A) Add more fertilizer",
                "B) Water the crops soon",
                "C) Harvest the crops immediately",
                "D) Do nothing"
            ],
            "correct": "B",
            "explanation": "Low soil moisture means there's not enough water for plants to grow well. Watering the crops will help them stay healthy! Satellites help farmers know exactly when watering is needed.",
            "difficulty": "easy",
            "category": "Water Management"
        },
        {
            "educational_context": "Temperature matters a lot for crops! Satellites can measure how hot the ground is. If it's too hot, plants can get stressed, just like how you feel tired on a very hot day.",
            "question": "Your field's temperature is much higher than normal. What might help cool it down and protect the plants?",
            "options": [
                "A) Plant cover crops to provide shade",
                "B) Add more fertilizer",
                "C) Stop watering",
                "D) Remove all plants"
            ],
            "correct": "A",
            "explanation": "Cover crops create shade and help keep the soil cooler, just like how a tree's shade keeps you cool! This protects the main crops from heat stress and helps them grow better.",
            "difficulty": "medium",
            "category": "Sustainable Farming Practices"
        }
    ]

def save_questions(questions: List[Dict], filename: str = 'agricultural_questions.json'):
    """Save questions to JSON file"""
    with open(filename, 'w') as f:
        json.dump(questions, indent=2, fp=f)
    print(f"\n✓ Questions saved to {filename}")

def print_statistics(questions: List[Dict]):
    """Print statistics about generated questions"""
    print("\n" + "="*50)
    print("QUESTION STATISTICS")
    print("="*50)
    
    print(f"\nTotal Questions: {len(questions)}")
    
    # Difficulty distribution
    difficulties = {}
    for q in questions:
        diff = q.get('difficulty', 'unknown')
        difficulties[diff] = difficulties.get(diff, 0) + 1
    
    print("\nDifficulty Distribution:")
    for diff, count in sorted(difficulties.items()):
        print(f"  {diff.capitalize()}: {count}")
    
    # Category distribution
    categories = {}
    for q in questions:
        cat = q.get('category', 'unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nCategory Distribution:")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}")
    
    print("\n" + "="*50)

def main():
    print("="*60)
    print("AppEEARS Agricultural Question Generator")
    print("="*60 + "\n")
    
    # Check if filtered products file exists
    if os.path.exists('agricultural_products_filtered.json'):
        print("Loading pre-filtered agricultural products...")
        try:
            with open('agricultural_products_filtered.json', 'r') as f:
                ag_products = json.load(f)
            print(f"✓ Loaded {len(ag_products)} agricultural products\n")
        except Exception as e:
            print(f"Error loading filtered products: {e}")
            sys.exit(1)
    else:
        # Fallback to filtering from main file
        print("Loading AppEEARS products...")
        try:
            products = load_products()
            print(f"✓ Loaded {len(products)} total products\n")
        except FileNotFoundError as e:
            print(f"Error: {e}")
            print("Make sure you're running from the project root or question-generator folder")
            sys.exit(1)
        
        # Filter agricultural products
        print("Filtering agricultural products...")
        ag_products = filter_agricultural_products(products)
        print(f"✓ Found {len(ag_products)} agricultural-related products\n")
    
    # Show some examples
    print("Example products:")
    for product in ag_products[:5]:
        print(f"  - {product['Product']}: {product['Description']}")
    print()
    
    # Login to AppEEARS to get detailed layer information
    print("Logging in to AppEEARS API...")
    appeears_username = os.environ.get('APPEEARS_USERNAME')
    appeears_password = os.environ.get('APPEEARS_PASSWORD')
    
    token = None
    if appeears_username and appeears_password:
        token = login_to_appeears(appeears_username, appeears_password)
        if not token:
            print("⚠ Could not authenticate with AppEEARS - will generate questions without layer details\n")
    else:
        print("⚠ AppEEARS credentials not found in environment")
        print("  Set APPEEARS_USERNAME and APPEEARS_PASSWORD in .env to get detailed layer information\n")
    
    # Enrich products with metadata and layer information
    enriched_products = enrich_products_with_metadata(ag_products, token=token, max_products=20)
    
    # Get API key
    api_key = os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        print("⚠ GEMINI_API_KEY not found in environment variables")
        print("Please set it with: export GEMINI_API_KEY='your-api-key'")
        print("Get your free API key at: https://makersuite.google.com/app/apikey")
        print("\nGenerating fallback questions instead...\n")
        questions = generate_fallback_questions()
    else:
        # Generate questions (reduced to 30 for better reliability)
        num_questions = 30
        print(f"Note: Generating {num_questions} questions to avoid API limits")
        print("      Run this script multiple times to generate more questions!\n")
        questions = generate_questions_with_gemini(enriched_products, api_key, num_questions)
    
    # Save questions
    save_questions(questions)
    
    # Print statistics
    print_statistics(questions)
    
    print("\n✨ Done! The questions are ready for the game.")
    print("   Copy agricultural_questions.json to the game/assets/ folder\n")

if __name__ == "__main__":
    main()

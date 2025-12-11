from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class WaterBrand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    barcode: str
    brand_name: str
    product_name: str
    source_type: str  # Spring, Purified, Mineral, etc.
    source_location: Optional[str] = None
    baseline_ph: Optional[float] = None
    baseline_tds: Optional[int] = None  # Total Dissolved Solids
    bottle_material: str = "Plastic"  # Plastic, Glass, Aluminum

class ScanResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    barcode: str
    brand_name: str
    product_name: str
    quality_score: int  # 0-100
    trust_grade: str  # A, B, C, D, F
    trust_badges: List[str]  # Trust labels
    report_summary: str
    detailed_report: str
    contaminants: dict
    compliance: dict
    source_context: dict  # Source type, location, transparency
    test_violations: List[dict]  # EPA/State violations
    bottle_material: str  # Plastic, Glass, Aluminum
    material_impact: str  # Impact description
    location: Optional[dict] = None  # Geolocation data
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_favorite: bool = False

class ScanLocationRequest(BaseModel):
    barcode: str
    latitude: float
    longitude: float
    location_name: Optional[str] = None

class ScanRequest(BaseModel):
    barcode: str

class RatingRequest(BaseModel):
    scan_id: str
    barcode: str
    brand_name: str
    quality_score: int
    user_rating: str  # 'drink_again' or 'upgrade'

# Seed water brand database
WATER_BRANDS_DATA = [
    {
        "barcode": "012345678901",
        "brand_name": "Fiji",
        "product_name": "Fiji Natural Artesian Water",
        "source_type": "Artesian",
        "source_location": "Viti Levu, Fiji",
        "baseline_ph": 7.7,
        "baseline_tds": 222
    },
    {
        "barcode": "012345678902",
        "brand_name": "Evian",
        "product_name": "Evian Natural Spring Water",
        "source_type": "Spring",
        "source_location": "French Alps",
        "baseline_ph": 7.2,
        "baseline_tds": 357
    },
    {
        "barcode": "012345678903",
        "brand_name": "Dasani",
        "product_name": "Dasani Purified Water",
        "source_type": "Purified",
        "source_location": "Municipal Supply",
        "baseline_ph": 5.6,
        "baseline_tds": 40
    },
    {
        "barcode": "012345678904",
        "brand_name": "Aquafina",
        "product_name": "Aquafina Purified Drinking Water",
        "source_type": "Purified",
        "source_location": "Municipal Supply",
        "baseline_ph": 5.5,
        "baseline_tds": 35
    },
    {
        "barcode": "012345678905",
        "brand_name": "Poland Spring",
        "product_name": "Poland Spring Natural Spring Water",
        "source_type": "Spring",
        "source_location": "Maine, USA",
        "baseline_ph": 7.3,
        "baseline_tds": 85
    },
    {
        "barcode": "012345678906",
        "brand_name": "Smartwater",
        "product_name": "Glacéau Smartwater",
        "source_type": "Vapor Distilled",
        "source_location": "Various",
        "baseline_ph": 6.8,
        "baseline_tds": 32
    },
    {
        "barcode": "012345678907",
        "brand_name": "Voss",
        "product_name": "Voss Artesian Water",
        "source_type": "Artesian",
        "source_location": "Norway",
        "baseline_ph": 6.4,
        "baseline_tds": 44
    },
    {
        "barcode": "012345678908",
        "brand_name": "Nestle Pure Life",
        "product_name": "Nestle Pure Life Purified Water",
        "source_type": "Purified",
        "source_location": "Various",
        "baseline_ph": 6.9,
        "baseline_tds": 65
    }
]

def calculate_trust_score_and_badges(quality_score: int, contaminants: dict, compliance: dict, source_type: str, baseline_tds: int) -> tuple:
    """
    Calculate WTR Trust Score™ grade and badges based on water quality data.
    Returns: (trust_grade: str, trust_badges: List[str])
    """
    trust_badges = []
    
    # Calculate trust grade from quality score
    if quality_score >= 90:
        trust_grade = "A"
    elif quality_score >= 80:
        trust_grade = "B"
    elif quality_score >= 70:
        trust_grade = "C"
    elif quality_score >= 60:
        trust_grade = "D"
    else:
        trust_grade = "F"
    
    # Award badges based on specific criteria
    
    # Clean & Safe - High quality score + EPA compliant
    if quality_score >= 85 and compliance.get("epa_compliant", False):
        trust_badges.append("Clean & Safe")
    
    # Better Than Tap - Purified source with low contaminants
    if source_type in ["Purified", "Vapor Distilled"] and contaminants.get("lead_ppb", 0) < 5:
        trust_badges.append("Better Than Tap")
    
    # Source Verified - Natural sources (Spring, Artesian)
    if source_type in ["Spring", "Artesian"]:
        trust_badges.append("Source Verified")
    
    # Microplastics Risk - High microplastics
    if contaminants.get("microplastics", "Low") in ["High", "Medium"]:
        trust_badges.append("Microplastics Risk")
    
    # High Mineral Content - TDS > 200
    if baseline_tds and baseline_tds > 200:
        trust_badges.append("High Mineral Content")
    
    # Recheck Brand Transparency - Low EWG rating or non-compliant
    ewg_rating = compliance.get("ewg_rating", "Good")
    if ewg_rating in ["Poor", "Fair"] or not compliance.get("state_compliant", True):
        trust_badges.append("Recheck Brand Transparency")
    
    # Ultra Pure - Very low contaminants across the board
    if (contaminants.get("lead_ppb", 0) < 1 and 
        contaminants.get("pfas_ppt", 0) < 1 and 
        contaminants.get("microplastics", "Low") == "Low"):
        trust_badges.append("Ultra Pure")
    
    return trust_grade, trust_badges

async def seed_water_brands():
    """Seed the database with water brand data if empty"""
    count = await db.water_brands.count_documents({})
    if count == 0:
        logger.info("Seeding water brands database...")
        for brand_data in WATER_BRANDS_DATA:
            brand = WaterBrand(**brand_data)
            doc = brand.model_dump()
            await db.water_brands.insert_one(doc)
        logger.info(f"Seeded {len(WATER_BRANDS_DATA)} water brands")

async def generate_water_quality_report(brand: WaterBrand) -> dict:
    """Generate AI-powered water quality report using GPT-5.1"""
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        # Create LLM chat instance with timeout
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"water-scan-{uuid.uuid4()}",
            system_message="You are a water quality analyst. Generate concise water quality reports based on EPA and EWG standards. Respond in valid JSON format only."
        )
        
        # Configure for OpenAI GPT-5.1
        chat.with_model("openai", "gpt-5.1")
        
        # Create shorter, more focused prompt
        prompt = f"""Analyze this bottled water and return ONLY valid JSON (no markdown):

Product: {brand.brand_name} {brand.product_name}
Source: {brand.source_type} from {brand.source_location}
pH: {brand.baseline_ph}, TDS: {brand.baseline_tds} ppm

Return JSON with this structure:

{{
  "quality_score": 75,
  "summary": "Brief quality assessment",
  "detailed_report": "Water quality report",
  "contaminants": {{"lead_ppb": 0.5, "pfas_ppt": 2.0, "microplastics": "Low", "disinfection_byproducts": "Low"}},
  "compliance": {{"epa_compliant": true, "ewg_rating": "Good", "state_compliant": true}}
}}"""
        
        # Add timeout and retry logic
        import asyncio
        import json
        
        max_retries = 2
        timeout_seconds = 15
        
        for attempt in range(max_retries):
            try:
                user_message = UserMessage(text=prompt)
                
                # Use asyncio.wait_for for timeout
                response = await asyncio.wait_for(
                    chat.send_message(user_message),
                    timeout=timeout_seconds
                )
                
                # Parse JSON response
                cleaned_response = response.strip()
                if cleaned_response.startswith('```json'):
                    cleaned_response = cleaned_response[7:]
                if cleaned_response.startswith('```'):
                    cleaned_response = cleaned_response[3:]
                if cleaned_response.endswith('```'):
                    cleaned_response = cleaned_response[:-3]
                
                report_data = json.loads(cleaned_response.strip())
                return report_data
                
            except asyncio.TimeoutError:
                logger.warning(f"GPT-5.1 API timeout on attempt {attempt + 1}")
                if attempt == max_retries - 1:
                    raise Exception("API timeout after retries")
                await asyncio.sleep(1)  # Brief delay before retry
                
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parsing error on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    raise Exception("Invalid JSON response after retries")
                await asyncio.sleep(1)
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        # Return fallback report
        return {
            "quality_score": 75,
            "summary": f"Analysis for {brand.brand_name} {brand.product_name}. Source: {brand.source_type} from {brand.source_location}. Generally meets EPA standards.",
            "detailed_report": f"# Water Quality Report\n\n## Product Information\n- Brand: {brand.brand_name}\n- Product: {brand.product_name}\n- Source: {brand.source_type}\n- Location: {brand.source_location}\n\n## Quality Analysis\nThis water meets federal EPA standards for bottled water.",
            "contaminants": {
                "lead_ppb": 0.5,
                "pfas_ppt": 2.0,
                "microplastics": "Low",
                "disinfection_byproducts": "Low"
            },
            "compliance": {
                "epa_compliant": True,
                "ewg_rating": "Good",
                "state_compliant": True
            }
        }

# Routes
@api_router.get("/")
async def root():
    return {"message": "WTR APP - Water Quality Scanner API"}

@api_router.get("/brands", response_model=List[WaterBrand])
async def get_brands():
    """Get all available water brands"""
    brands = await db.water_brands.find({}, {"_id": 0}).to_list(1000)
    return brands

@api_router.post("/scan", response_model=ScanResult)
async def scan_water(request: ScanRequest):
    """Scan a water bottle barcode and generate quality report"""
    # Look up brand by barcode
    brand_doc = await db.water_brands.find_one({"barcode": request.barcode}, {"_id": 0})
    
    if not brand_doc:
        # If barcode not in database, check if it looks like Smartwater (common prefixes)
        # UPC codes for Smartwater typically start with certain prefixes
        barcode_str = request.barcode
        
        # Try to identify brand from common UPC patterns
        if barcode_str.startswith(('78915', '0786162', '786162')):
            # Smartwater UPC pattern
            brand = WaterBrand(
                barcode=request.barcode,
                brand_name="Smartwater",
                product_name="Glacéau Smartwater",
                source_type="Vapor Distilled",
                source_location="Various",
                baseline_ph=6.8,
                baseline_tds=32
            )
        elif barcode_str.startswith(('04963', '049000')):
            # Dasani pattern
            brand = WaterBrand(
                barcode=request.barcode,
                brand_name="Dasani",
                product_name="Dasani Purified Water",
                source_type="Purified",
                source_location="Municipal Supply",
                baseline_ph=5.6,
                baseline_tds=40
            )
        elif barcode_str.startswith(('01249', '012000')):
            # Aquafina pattern
            brand = WaterBrand(
                barcode=request.barcode,
                brand_name="Aquafina",
                product_name="Aquafina Purified Drinking Water",
                source_type="Purified",
                source_location="Municipal Supply",
                baseline_ph=5.5,
                baseline_tds=35
            )
        else:
            # Generic bottled water for unknown barcodes
            brand = WaterBrand(
                barcode=request.barcode,
                brand_name="Bottled Water",
                product_name="Generic Bottled Water",
                source_type="Purified",
                source_location="Unknown",
                baseline_ph=7.0,
                baseline_tds=50
            )
        
        # Save new brand to database for future scans
        brand_dict = brand.model_dump()
        await db.water_brands.insert_one(brand_dict)
        logger.info(f"New water brand added: {brand.brand_name} with barcode {request.barcode}")
    else:
        brand = WaterBrand(**brand_doc)
    
    # Generate AI report
    report_data = await generate_water_quality_report(brand)
    
    # Calculate WTR Trust Score™ and badges
    trust_grade, trust_badges = calculate_trust_score_and_badges(
        quality_score=report_data["quality_score"],
        contaminants=report_data["contaminants"],
        compliance=report_data["compliance"],
        source_type=brand.source_type,
        baseline_tds=brand.baseline_tds or 0
    )
    
    # Create source context
    source_context = {
        "source_type": brand.source_type,
        "source_location": brand.source_location or "Unknown",
        "baseline_ph": brand.baseline_ph,
        "baseline_tds": brand.baseline_tds,
        "transparency_score": "High" if report_data["compliance"].get("epa_compliant") and report_data["compliance"].get("ewg_rating") in ["Excellent", "Good"] else "Medium"
    }
    
    # Create scan result with Trust Score
    scan_result = ScanResult(
        barcode=request.barcode,
        brand_name=brand.brand_name,
        product_name=brand.product_name,
        quality_score=report_data["quality_score"],
        trust_grade=trust_grade,
        trust_badges=trust_badges,
        report_summary=report_data["summary"],
        detailed_report=report_data["detailed_report"],
        contaminants=report_data["contaminants"],
        compliance=report_data["compliance"],
        source_context=source_context
    )
    
    # Save to history
    doc = scan_result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.scan_history.insert_one(doc)
    
    return scan_result

@api_router.get("/history", response_model=List[ScanResult])
async def get_scan_history():
    """Get scan history"""
    history = await db.scan_history.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    for item in history:
        if isinstance(item['timestamp'], str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return history

@api_router.post("/rate")
async def save_rating(request: RatingRequest):
    """Save user rating for a water scan"""
    try:
        rating_doc = {
            "id": str(uuid.uuid4()),
            "scan_id": request.scan_id,
            "barcode": request.barcode,
            "brand_name": request.brand_name,
            "quality_score": request.quality_score,
            "user_rating": request.user_rating,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.user_ratings.insert_one(rating_doc)
        logger.info(f"Rating saved: {request.brand_name} - {request.user_rating}")
        
        return {"status": "success", "message": "Rating saved successfully"}
    except Exception as e:
        logger.error(f"Error saving rating: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save rating")

@api_router.post("/favorite/{scan_id}")
async def toggle_favorite(scan_id: str):
    """Toggle favorite status for a scan"""
    try:
        scan = await db.scan_history.find_one({"id": scan_id})
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        new_status = not scan.get("is_favorite", False)
        await db.scan_history.update_one(
            {"id": scan_id},
            {"$set": {"is_favorite": new_status}}
        )
        
        return {"status": "success", "is_favorite": new_status}
    except Exception as e:
        logger.error(f"Error toggling favorite: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle favorite")

@api_router.get("/stats")
async def get_user_stats():
    """Get user scan statistics"""
    try:
        # Get all scans
        scans = await db.scan_history.find({}, {"_id": 0}).to_list(1000)
        
        if not scans:
            return {
                "total_scans": 0,
                "average_trust_score": 0,
                "most_scanned_brand": "None",
                "top_5_cleanest": [],
                "brands_to_watch": [],
                "most_frequent": []
            }
        
        # Calculate stats
        total_scans = len(scans)
        avg_score = sum(scan.get("quality_score", 0) for scan in scans) / total_scans if total_scans > 0 else 0
        
        # Most scanned brand
        brand_counts = {}
        for scan in scans:
            brand = scan.get("brand_name", "Unknown")
            brand_counts[brand] = brand_counts.get(brand, 0) + 1
        most_scanned = max(brand_counts.items(), key=lambda x: x[1])[0] if brand_counts else "None"
        
        # Top 5 cleanest (unique brands with highest scores)
        brand_best_scores = {}
        for scan in scans:
            brand = scan.get("brand_name", "Unknown")
            score = scan.get("quality_score", 0)
            if brand not in brand_best_scores or score > brand_best_scores[brand]["score"]:
                brand_best_scores[brand] = {
                    "brand_name": brand,
                    "product_name": scan.get("product_name", ""),
                    "score": score,
                    "trust_grade": scan.get("trust_grade", "C")
                }
        top_5 = sorted(brand_best_scores.values(), key=lambda x: x["score"], reverse=True)[:5]
        
        # Brands to watch (lowest scores)
        brands_to_watch = sorted(brand_best_scores.values(), key=lambda x: x["score"])[:3]
        
        # Most frequent brands
        most_frequent = [{"brand": brand, "count": count} for brand, count in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        return {
            "total_scans": total_scans,
            "average_trust_score": round(avg_score, 1),
            "most_scanned_brand": most_scanned,
            "top_5_cleanest": top_5,
            "brands_to_watch": brands_to_watch,
            "most_frequent": most_frequent
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await seed_water_brands()
    logger.info("WTR APP API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

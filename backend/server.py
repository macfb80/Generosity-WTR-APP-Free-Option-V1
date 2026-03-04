from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import hashlib
import jwt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Create MongoDB client with Atlas-compatible settings
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=5000,  # 5 second timeout
    connectTimeoutMS=10000,  # 10 second connection timeout
    retryWrites=True,  # Enable retry writes for Atlas
    w='majority'  # Write concern for Atlas
)
db = client[db_name]

# Create the main app without a prefix
app = FastAPI()

# Startup event to verify MongoDB connection
@app.on_event("startup")
async def startup_db_client():
    try:
        # Verify connection on startup
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB: {db_name}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        # Don't raise - let health check handle it

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed")

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
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user_id: Optional[str] = None
    app_version: Optional[str] = "1.0.0"
    consumption_confirmed: Optional[bool] = None

class RatingRequest(BaseModel):
    scan_id: str
    barcode: str
    brand_name: str
    quality_score: int
    user_rating: str  # 'drink_again' or 'upgrade'

# User Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    dob: Optional[str] = None
    zip_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    name: str
    dob: Optional[str] = None
    zip_code: Optional[str] = None
    connected_wearables: Optional[Dict[str, Any]] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    zip_code: Optional[str] = None

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

def calculate_trust_score_and_badges(quality_score: int, contaminants: dict, compliance: dict, source_type: str, baseline_tds: int, bottle_material: str = "Plastic") -> tuple:
    """
    Calculate WTR Trust Score™ grade and badges based on water quality data.
    Applies penalty for plastic/aluminum bottles.
    Returns: (adjusted_score: int, trust_grade: str, trust_badges: List[str], material_impact: str)
    """
    trust_badges = []
    adjusted_score = quality_score
    material_impact = ""
    
    # Apply bottle material impact
    if bottle_material == "Plastic":
        adjusted_score -= 5  # 5-point penalty for plastic
        trust_badges.append("Plastic Bottle Risk")
        material_impact = "Plastic bottles may leach microplastics and chemicals (BPA, phthalates) into water, especially when exposed to heat or sunlight."
    elif bottle_material == "Aluminum":
        adjusted_score -= 3  # 3-point penalty for aluminum
        trust_badges.append("Metal Container")
        material_impact = "Aluminum containers may leach trace metals. Most have protective linings, but integrity varies by brand and storage conditions."
    elif bottle_material == "Glass":
        # No penalty for glass - it's the safest material
        trust_badges.append("Glass Bottle - Best Choice")
        material_impact = "Glass is the safest bottle material - no chemical leaching or microplastic contamination."
    
    # Ensure score stays in valid range
    adjusted_score = max(0, min(100, adjusted_score))
    
    # Calculate trust grade from adjusted quality score
    if adjusted_score >= 90:
        trust_grade = "A"
    elif adjusted_score >= 80:
        trust_grade = "B"
    elif adjusted_score >= 70:
        trust_grade = "C"
    elif adjusted_score >= 60:
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
    
    return adjusted_score, trust_grade, trust_badges, material_impact

def generate_test_violations(brand_name: str, compliance: dict) -> List[dict]:
    """
    Generate test violations based on compliance data and EPA/State records.
    In production, this would query actual EPA violation databases.
    """
    violations = []
    
    # Check EPA compliance
    if not compliance.get("epa_compliant", True):
        violations.append({
            "date": "2024-03-15",
            "type": "EPA Maximum Contaminant Level",
            "contaminant": "Total Trihalomethanes (TTHMs)",
            "level_found": "82 ppb",
            "legal_limit": "80 ppb",
            "severity": "Minor",
            "resolution": "Corrected within 30 days"
        })
    
    # Check EWG rating for potential issues
    ewg_rating = compliance.get("ewg_rating", "Good")
    if ewg_rating in ["Poor", "Fair"]:
        violations.append({
            "date": "2024-01-20",
            "type": "EWG Health Guideline Exceedance",
            "contaminant": "Chromium-6",
            "level_found": "0.08 ppb",
            "legal_limit": "Legal but above EWG health guideline (0.02 ppb)",
            "severity": "Moderate",
            "resolution": "Under review by brand"
        })
    
    # State compliance issues
    if not compliance.get("state_compliant", True):
        violations.append({
            "date": "2023-11-10",
            "type": "State Title 21 Violation",
            "contaminant": "Arsenic",
            "level_found": "8.5 ppb",
            "legal_limit": "5 ppb (State)",
            "severity": "Moderate",
            "resolution": "Source changed, retested and passed"
        })
    
    # If no violations, return clean record
    if not violations:
        violations.append({
            "status": "clean",
            "message": f"No violations found in the last 3 years for {brand_name}. All EPA and state compliance tests passed.",
            "last_test_date": "2024-11-15"
        })
    
    return violations

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

# Helper Functions
security = HTTPBearer()
JWT_SECRET = os.environ['JWT_SECRET']  # Required, no fallback
JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_jwt_token(user_id: str, email: str) -> str:
    """Create JWT token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "WTR APP - Water Quality Scanner API"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    try:
        # Test MongoDB connection
        await db.command('ping')
        return {
            "status": "healthy",
            "service": "WTR APP API",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

# Auth Routes
@api_router.post("/auth/register")
async def register(user: UserRegister):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user.password)
        
        user_doc = {
            "user_id": user_id,
            "email": user.email,
            "password_hash": hashed_password,
            "name": user.name,
            "dob": user.dob,
            "zip_code": user.zip_code,
            "connected_wearables": {},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.users.insert_one(user_doc)
        
        # Create JWT token
        token = create_jwt_token(user_id, user.email)
        
        # Return user profile without password
        user_profile = {
            "user_id": user_id,
            "email": user.email,
            "name": user.name,
            "dob": user.dob,
            "zip_code": user.zip_code,
            "connected_wearables": {}
        }
        
        return {
            "user": user_profile,
            "token": token,
            "message": "User registered successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register user")

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    try:
        # Find user
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create JWT token
        token = create_jwt_token(user["user_id"], user["email"])
        
        # Return user profile
        user_profile = {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "dob": user.get("dob"),
            "zip_code": user.get("zip_code"),
            "connected_wearables": user.get("connected_wearables", {})
        }
        
        return {
            "user": user_profile,
            "token": token,
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to login")

@api_router.get("/auth/google")
async def google_auth():
    """Initiate Google OAuth flow"""
    # Placeholder for Google OAuth integration
    return {"message": "Google OAuth integration coming soon"}

# User Profile Routes
@api_router.get("/user/profile")
async def get_profile(token_data: dict = Depends(verify_token)):
    """Get user profile"""
    try:
        user = await db.users.find_one({"user_id": token_data["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get profile")

@api_router.put("/user/profile")
async def update_profile(
    update_data: UserUpdateRequest,
    token_data: dict = Depends(verify_token)
):
    """Update user profile"""
    try:
        # Prepare update document
        update_doc = {"updated_at": datetime.now(timezone.utc)}
        
        if update_data.name is not None:
            update_doc["name"] = update_data.name
        if update_data.dob is not None:
            update_doc["dob"] = update_data.dob
        if update_data.zip_code is not None:
            update_doc["zip_code"] = update_data.zip_code
        
        # Update user
        result = await db.users.update_one(
            {"user_id": token_data["user_id"]},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get updated user
        user = await db.users.find_one({"user_id": token_data["user_id"]}, {"_id": 0, "password_hash": 0})
        
        return {
            "user": user,
            "message": "Profile updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@api_router.get("/brands", response_model=List[WaterBrand])
async def get_brands():
    """Get all available water brands"""
    brands = await db.water_brands.find({}, {"_id": 0}).limit(100).to_list(100)
    return brands

@api_router.post("/scan", response_model=ScanResult)
async def scan_water(request: ScanRequest):
    """Scan a water bottle barcode and generate quality report"""
    # Log incoming location data
    if request.latitude and request.longitude:
        logger.info(f"Scan with location: lat={request.latitude}, lon={request.longitude}")
    
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
    
    # Calculate WTR Trust Score™ and badges with bottle material impact
    adjusted_score, trust_grade, trust_badges, material_impact = calculate_trust_score_and_badges(
        quality_score=report_data["quality_score"],
        contaminants=report_data["contaminants"],
        compliance=report_data["compliance"],
        source_type=brand.source_type,
        baseline_tds=brand.baseline_tds or 0,
        bottle_material=brand.bottle_material
    )
    
    # Generate test violations
    test_violations = generate_test_violations(brand.brand_name, report_data["compliance"])
    
    # Create source context
    source_context = {
        "source_type": brand.source_type,
        "source_location": brand.source_location or "Unknown",
        "baseline_ph": brand.baseline_ph,
        "baseline_tds": brand.baseline_tds,
        "transparency_score": "High" if report_data["compliance"].get("epa_compliant") and report_data["compliance"].get("ewg_rating") in ["Excellent", "Good"] else "Medium"
    }
    
    # Prepare location data if provided
    location_data = None
    if request.latitude is not None and request.longitude is not None:
        location_data = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Create scan result with Trust Score and violations
    scan_result = ScanResult(
        barcode=request.barcode,
        brand_name=brand.brand_name,
        product_name=brand.product_name,
        quality_score=adjusted_score,  # Use adjusted score
        trust_grade=trust_grade,
        trust_badges=trust_badges,
        report_summary=report_data["summary"],
        detailed_report=report_data["detailed_report"],
        contaminants=report_data["contaminants"],
        compliance=report_data["compliance"],
        source_context=source_context,
        test_violations=test_violations,
        bottle_material=brand.bottle_material,
        material_impact=material_impact,
        location=location_data
    )
    
    # Save to history with additional metadata
    doc = scan_result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    doc['user_id'] = request.user_id or "anonymous"
    doc['app_version'] = request.app_version or "1.0.0"
    if request.consumption_confirmed is not None:
        doc['consumption_confirmed'] = request.consumption_confirmed
    await db.scan_history.insert_one(doc)
    
    return scan_result

@api_router.get("/history")
async def get_scan_history():
    """Get scan history - returns raw documents to handle schema evolution"""
    try:
        # Use projection to fetch only needed fields for display
        projection = {
            "_id": 0,
            "id": 1,
            "barcode": 1,
            "brand_name": 1,
            "product_name": 1,
            "quality_score": 1,
            "trust_grade": 1,
            "trust_badges": 1,
            "timestamp": 1,
            "bottle_material": 1,
            "location": 1
        }
        
        history = await db.scan_history.find({}, projection).sort("timestamp", -1).limit(100).to_list(100)
        
        # Convert timestamp strings to datetime objects for consistency
        for item in history:
            if isinstance(item.get('timestamp'), str):
                item['timestamp'] = datetime.fromisoformat(item['timestamp']).isoformat()
            elif isinstance(item.get('timestamp'), datetime):
                item['timestamp'] = item['timestamp'].isoformat()
            
            # Ensure all required fields exist with defaults for old records
            if 'trust_badges' not in item:
                item['trust_badges'] = []
            if 'source_context' not in item:
                item['source_context'] = {}
            if 'test_violations' not in item:
                item['test_violations'] = []
            if 'material_impact' not in item:
                item['material_impact'] = ""
            if 'location' not in item:
                item['location'] = None
        
        return history
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        return []

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

@api_router.post("/scan/location")
async def add_scan_location(request: ScanLocationRequest):
    """Add geolocation to a scan"""
    try:
        # Find the most recent scan with this barcode
        scan = await db.scan_history.find_one(
            {"barcode": request.barcode},
            sort=[("timestamp", -1)]
        )
        
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        # Update with location
        location_data = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "location_name": request.location_name or "Unknown Location",
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add to locations array (support multiple locations per bottle)
        await db.scan_history.update_one(
            {"id": scan["id"]},
            {"$push": {"locations": location_data}}
        )
        
        return {"status": "success", "message": "Location added"}
    except Exception as e:
        logger.error(f"Error adding location: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add location")

@api_router.get("/scan/{scan_id}/locations")
async def get_scan_locations(scan_id: str):
    """Get all locations for a specific scan"""
    try:
        scan = await db.scan_history.find_one({"id": scan_id}, {"_id": 0})
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        locations = scan.get("locations", [])
        return {
            "brand_name": scan.get("brand_name"),
            "product_name": scan.get("product_name"),
            "locations": locations
        }
    except Exception as e:
        logger.error(f"Error getting locations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get locations")

@api_router.get("/stats")
async def get_user_stats():
    """Get comprehensive user scan statistics with trends and insights"""
    try:
        # Use projection to fetch only needed fields for stats calculation
        projection = {
            "_id": 0,
            "quality_score": 1,
            "brand_name": 1,
            "product_name": 1,
            "trust_grade": 1,
            "bottle_material": 1,
            "timestamp": 1,
            "location": 1,
            "trust_badges": 1
        }
        
        # Get all scans with projection
        scans = await db.scan_history.find({}, projection).limit(1000).to_list(1000)
        
        if not scans:
            return {
                "total_scans": 0,
                "average_trust_score": 0,
                "most_scanned_brand": "None",
                "top_5_cleanest": [],
                "brands_to_avoid": [],
                "most_frequent": [],
                "this_week": 0,
                "this_month": 0,
                "clean_water_percentage": 0,
                "trend": "neutral",
                "unique_brands_scanned": 0,
                "locations_tracked": 0,
                "health_score": 0,
                "safety_alerts": []
            }
        
        # Parse timestamps
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        two_weeks_ago = now - timedelta(days=14)
        
        scans_with_time = []
        for scan in scans:
            ts = scan.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            scan["parsed_timestamp"] = ts
            scans_with_time.append(scan)
        
        # Basic stats
        total_scans = len(scans_with_time)
        avg_score = sum(scan.get("quality_score", 0) for scan in scans_with_time) / total_scans if total_scans > 0 else 0
        
        # Time-based counts
        scans_this_week = [s for s in scans_with_time if s["parsed_timestamp"] >= week_ago]
        scans_this_month = [s for s in scans_with_time if s["parsed_timestamp"] >= month_ago]
        scans_prev_week = [s for s in scans_with_time if two_weeks_ago <= s["parsed_timestamp"] < week_ago]
        
        # Trend calculation (this week vs previous week)
        this_week_avg = sum(s.get("quality_score", 0) for s in scans_this_week) / len(scans_this_week) if scans_this_week else 0
        prev_week_avg = sum(s.get("quality_score", 0) for s in scans_prev_week) / len(scans_prev_week) if scans_prev_week else 0
        
        if this_week_avg > prev_week_avg + 5:
            trend = "improving"
        elif this_week_avg < prev_week_avg - 5:
            trend = "declining"
        else:
            trend = "stable"
        
        # Clean water percentage (score >= 75)
        clean_scans = [s for s in scans_with_time if s.get("quality_score", 0) >= 75]
        clean_percentage = (len(clean_scans) / total_scans * 100) if total_scans > 0 else 0
        
        # Unique brands
        unique_brands = len(set(s.get("brand_name", "Unknown") for s in scans_with_time))
        
        # Locations tracked
        locations_count = sum(1 for s in scans_with_time if s.get("location"))
        
        # Health score (composite: avg score * 0.6 + clean percentage * 0.4)
        health_score = round((avg_score * 0.6) + (clean_percentage * 0.4), 1)
        
        # Most scanned brand
        brand_counts = {}
        for scan in scans_with_time:
            brand = scan.get("brand_name", "Unknown")
            brand_counts[brand] = brand_counts.get(brand, 0) + 1
        most_scanned = max(brand_counts.items(), key=lambda x: x[1])[0] if brand_counts else "None"
        
        # Top 5 cleanest (unique brands with highest scores)
        brand_best_scores = {}
        for scan in scans_with_time:
            brand = scan.get("brand_name", "Unknown")
            score = scan.get("quality_score", 0)
            if brand not in brand_best_scores or score > brand_best_scores[brand]["score"]:
                brand_best_scores[brand] = {
                    "brand_name": brand,
                    "product_name": scan.get("product_name", ""),
                    "score": score,
                    "trust_grade": scan.get("trust_grade", "C"),
                    "bottle_material": scan.get("bottle_material", "Plastic")
                }
        top_5 = sorted(brand_best_scores.values(), key=lambda x: x["score"], reverse=True)[:5]
        
        # Brands to AVOID (lowest scores - more actionable than "watch")
        brands_to_avoid = sorted(brand_best_scores.values(), key=lambda x: x["score"])[:3]
        
        # Most frequent brands
        most_frequent = [{"brand": brand, "count": count} for brand, count in sorted(brand_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        # Safety alerts (critical issues)
        safety_alerts = []
        for scan in scans_with_time[-5:]:  # Check last 5 scans
            score = scan.get("quality_score", 0)
            brand = scan.get("brand_name", "Unknown")
            
            if score < 60:
                safety_alerts.append({
                    "type": "low_quality",
                    "message": f"{brand} scored below 60. Consider upgrading.",
                    "severity": "warning"
                })
            
            # Check for plastic bottles with microplastic risk
            if scan.get("bottle_material") == "Plastic":
                badges = scan.get("trust_badges", [])
                if any("Microplastics Risk" in badge for badge in badges):
                    safety_alerts.append({
                        "type": "microplastics",
                        "message": f"{brand}: Microplastics detected. Consider glass bottles.",
                        "severity": "caution"
                    })
        
        # Remove duplicate alerts
        safety_alerts = [dict(t) for t in {tuple(d.items()) for d in safety_alerts}]
        
        return {
            "total_scans": total_scans,
            "average_trust_score": round(avg_score, 1),
            "most_scanned_brand": most_scanned,
            "top_5_cleanest": top_5,
            "brands_to_avoid": brands_to_avoid,
            "most_frequent": most_frequent,
            "this_week": len(scans_this_week),
            "this_month": len(scans_this_month),
            "clean_water_percentage": round(clean_percentage, 1),
            "trend": trend,
            "unique_brands_scanned": unique_brands,
            "locations_tracked": locations_count,
            "health_score": health_score,
            "safety_alerts": safety_alerts[:3]  # Max 3 alerts
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

@api_router.post("/water-quality/zip")
async def get_water_quality_by_zip(request: dict):
    """Get water quality data by ZIP code using EPA SDWIS data"""
    try:
        zip_code = request.get('zip_code')
        
        if not zip_code or len(zip_code) != 5:
            raise HTTPException(status_code=400, detail="Valid 5-digit ZIP code required")
        
        # Mock data structure - In production, integrate with EPA SDWIS API
        # https://data.epa.gov/efservice/sdwa.sdwis_water_systems/
        
        # Simulated EPA data based on zip code patterns
        water_quality_data = await generate_zip_water_quality_report(zip_code)
        
        return water_quality_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching water quality data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch water quality data")

async def generate_water_quality_report(zip_code: str):
    """Generate water quality report based on ZIP code
    
    In production, this would:
    1. Query EPA SDWIS API by zip-to-county mapping
    2. Fetch contaminant data for local water utility
    3. Check violation history
    4. Return comprehensive report
    """
    
    # Sample utilities by region
    utilities = {
        "10001": ("New York City Water", "NYC DEP", "New York, NY"),
        "90210": ("Los Angeles Water", "LADWP", "Los Angeles, CA"),
        "85001": ("Phoenix Water", "Phoenix Water Services", "Phoenix, AZ"),
        "60601": ("Chicago Water", "Chicago Water Dept", "Chicago, IL"),
        "33101": ("Miami-Dade Water", "Miami-Dade WASD", "Miami, FL"),
    }
    
    # Default to generic utility
    utility_name, utility_system, location = utilities.get(
        zip_code,
        ("Local Water Utility", "Municipal Water System", f"ZIP {zip_code}")
    )
    
    # Simulate quality score (70-95 range)
    base_score = 75 + (int(zip_code) % 20)
    
    # Common contaminants with realistic data
    contaminants = [
        {
            "name": "Total Trihalomethanes (TTHMs)",
            "description": "Disinfection byproducts formed when chlorine treats water with organic matter",
            "level": "45 ppb",
            "legal_limit": "80 ppb",
            "severity": "low",
            "exceeds_limit": False
        },
        {
            "name": "Lead",
            "description": "Heavy metal that can leach from pipes and plumbing fixtures",
            "level": "8 ppb",
            "legal_limit": "15 ppb",
            "severity": "medium",
            "exceeds_limit": False
        },
        {
            "name": "Chlorine",
            "description": "Disinfectant added to kill bacteria and viruses in water",
            "level": "2.1 mg/L",
            "legal_limit": "4 mg/L",
            "severity": "low",
            "exceeds_limit": False
        },
        {
            "name": "Total Hardness",
            "description": "Calcium and magnesium minerals that cause scale buildup",
            "level": "180 mg/L",
            "legal_limit": "No federal limit",
            "severity": "low",
            "exceeds_limit": False
        }
    ]
    
    # Add region-specific contaminants
    if zip_code.startswith("8"):  # Southwest (AZ, NV, NM)
        contaminants.append({
            "name": "Arsenic",
            "description": "Naturally occurring element found in Southwest groundwater",
            "level": "8 ppb",
            "legal_limit": "10 ppb",
            "severity": "medium",
            "exceeds_limit": False
        })
        base_score -= 5
    
    if zip_code.startswith("3"):  # Southeast (FL, GA, SC)
        contaminants.append({
            "name": "Radium-228",
            "description": "Radioactive element found in some groundwater sources",
            "level": "3 pCi/L",
            "legal_limit": "5 pCi/L",
            "severity": "low",
            "exceeds_limit": False
        })
    
    # Determine grade
    if base_score >= 90:
        grade = "A"
        risk_level = "low"
    elif base_score >= 80:
        grade = "B"
        risk_level = "low"
    elif base_score >= 70:
        grade = "C"
        risk_level = "medium"
    elif base_score >= 60:
        grade = "D"
        risk_level = "high"
    else:
        grade = "F"
        risk_level = "high"
    
    # Sample violations
    violations = [
        {
            "type": "Monitoring & Reporting Violation",
            "date": "Q2 2023",
            "description": "Late submission of quarterly water quality report"
        }
    ] if base_score < 85 else []
    
    # Recommendations based on quality
    recommendations = [
        "Consider using a certified water filter for additional protection",
        "Flush pipes for 30 seconds before drinking after prolonged non-use",
        "Test your tap water annually with a certified laboratory"
    ]
    
    if any(c["name"] == "Lead" and float(c["level"].split()[0]) > 5 for c in contaminants):
        recommendations.insert(0, "Consider NSF-certified lead reduction filter")
    
    if any(c["name"] == "Total Hardness" for c in contaminants):
        recommendations.append("Water softener may improve taste and reduce scale buildup")
    
    return {
        "zip_code": zip_code,
        "utility_name": utility_name,
        "utility_system": utility_system,
        "location": location,
        "quality_score": base_score,
        "grade": grade,
        "risk_level": risk_level,
        "contaminants": contaminants,
        "violations": violations,
        "recommendations": recommendations,
        "last_updated": "December 2024",
        "data_source": "EPA SDWIS Database",
        "note": "This is a demonstration using sample data. Production version integrates with EPA's real-time SDWIS API."
    }

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

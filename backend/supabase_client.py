import os
import httpx
from dotenv import load_dotenv
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from jose import jwt, JWTError
from fastapi import Header, HTTPException, Depends

# 1. Load environment variables from the .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in the .env file.")

# 2. Initialize the Supabase Client with disabled SSL validation for development environment
http_client = httpx.Client(verify=False)
options = SyncClientOptions(httpx_client=http_client)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)

def query_supabase_rest(method: str, path: str, json_data = None, raw_token: str = None, prefer_header: str = None):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {raw_token}" if raw_token else f"Bearer {SUPABASE_KEY}"
    }
    if json_data is not None:
        headers["Content-Type"] = "application/json"
    if prefer_header:
        headers["Prefer"] = prefer_header

    with httpx.Client(verify=False) as client:
        if method.upper() == "GET":
            response = client.get(url, headers=headers)
        elif method.upper() == "POST":
            response = client.post(url, headers=headers, json=json_data)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
    if response.status_code >= 400:
        raise Exception(f"Supabase REST error {response.status_code}: {response.text}")
        
    if not response.text:
        return {}
        
    try:
        return response.json()
    except Exception:
        return {}

# 3. Token Verification Dependency
def verify_token(authorization: str = Header(...)) -> dict:
    """
    FastAPI dependency to verify the Supabase JWT token sent by the React frontend
    by calling the Supabase Auth API (/auth/v1/user) directly.
    """
    try:
        # Split "Bearer <token>" to extract the raw token
        token_type, token = authorization.split(" ")
        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=401, 
                detail="Invalid authorization header. Must start with 'Bearer'."
            )
            
        # Call Supabase Auth API to verify the token and get user info
        url = f"{SUPABASE_URL}/auth/v1/user"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {token}"
        }
        
        with httpx.Client(verify=False) as client:
            response = client.get(url, headers=headers)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail=f"Could not validate credentials with Supabase. Status: {response.status_code}"
            )
            
        user_data = response.json()
        
        # Build payload dictionary compatible with the main application logic
        payload = {
            "sub": user_data["id"],
            "email": user_data["email"],
            "raw_token": token
        }
        return payload
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Could not validate credentials. Access token is invalid or expired. Error: {str(e)}"
        )

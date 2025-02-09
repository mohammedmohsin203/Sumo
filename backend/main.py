from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import cadquery as cq
import os
from pathlib import Path
import logging

# ✅ Setup logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# ✅ Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly allow these methods
    allow_headers=["*"],  # Allow all headers
)


# ✅ Directory for storing 3D models
MODEL_DIR = Path("generated_models")
MODEL_DIR.mkdir(parents=True, exist_ok=True)


class ModelRequest(BaseModel):
    width: float
    height: float
    depth: float
    file_format: str = "stl"  # Default to STL


def generate_3d_model(width: float, height: float, depth: float, file_format: str = "stl") -> Path:
    """Generates a 3D model and saves it in the requested format."""
    try:
        # ✅ Create a simple box model
        model = cq.Workplane("XY").box(width, height, depth).faces(">Z").workplane().hole(50)

        # ✅ Define the output filename
        filename = MODEL_DIR / f"box_model.{file_format}"

        # ✅ Export based on requested file format
        if file_format == "stl":
            cq.exporters.export(model, str(filename))
            media_type = "model/stl"
        elif file_format == "step":
            cq.exporters.export(model, str(filename), cq.exporters.ExportTypes.STEP)
            media_type = "model/step"
        elif file_format == "obj":
            cq.exporters.export(model, str(filename), cq.exporters.ExportTypes.OBJ)
            media_type = "model/obj"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use 'stl', 'step', or 'obj'.")

        logging.info(f"✅ 3D Model Generated: {filename}")
        return filename, media_type

    except Exception as e:
        logging.error(f"❌ Error generating 3D model: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model generation failed: {str(e)}")


@app.post("/generate/")
async def generate_model(request: ModelRequest):
    """API Endpoint to generate and return a 3D Model"""
    file_path, media_type = generate_3d_model(request.width, request.height, request.depth, request.file_format)

    if not file_path.exists():
        raise HTTPException(status_code=500, detail="Failed to generate model file.")

    return FileResponse(file_path, media_type=media_type, filename=f"model.{request.file_format}")


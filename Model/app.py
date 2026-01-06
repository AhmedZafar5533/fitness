import base64
import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import torch
from torchvision import transforms
import timm
from safetensors.torch import load_file

# --- Load model ---
model_path = "efficientnet_b0_epoch5.safetensors"
num_classes = 101
classes_file = "food101_classes.txt"

model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=num_classes)
state_dict = load_file(model_path)
model.load_state_dict(state_dict)
model.eval()

# --- Preprocessing ---
preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

# --- Load class names ---
with open(classes_file) as f:
    class_names = [line.strip() for line in f]

# --- FastAPI setup ---
app = FastAPI()

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request schema ---
class ImageRequest(BaseModel):
    image_base64: str


# --- Health check endpoint ---
@app.get("/health")
async def health_check():
    return {"status": "Server is running"}


# --- Predict endpoint ---
@app.post("/predict")
async def predict_food(request: ImageRequest):
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image_base64)
        img = Image.open(io.BytesIO(image_data)).convert("RGB")

        # Preprocess
        img_tensor = preprocess(img).unsqueeze(0)

        # Inference
        with torch.no_grad():
            outputs = model(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            top1_idx = probs.argmax(dim=1).item()
            top1_prob = probs[0, top1_idx].item()

        return {
            "predicted_class": class_names[top1_idx],
            "confidence": round(top1_prob, 4),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

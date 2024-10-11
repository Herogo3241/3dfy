from flask import Flask, request, jsonify, send_from_directory
import cv2
import torch
import urllib.request
import os
import numpy as np
import matplotlib.pyplot as plt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

# Load MiDaS model
model_type = "DPT_Large"  
midas = torch.hub.load("intel-isl/MiDaS", model_type)
device = torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
midas.to(device)
midas.eval()

# MiDaS transforms
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")

# Choose appropriate transform based on the model type
if model_type == "DPT_Large" or model_type == "DPT_Hybrid":
    transform = midas_transforms.dpt_transform
else:
    transform = midas_transforms.small_transform


def process_image(image_path):
    """ Process the uploaded image to produce a depth map using MiDaS. """
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    input_batch = transform(img).to(device)

    with torch.no_grad():
        prediction = midas(input_batch)

        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=img.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()

    output = prediction.cpu().numpy()

    # Save the depth map as an image
    output_path = "static/depth_map.png"
    plt.imsave(output_path, output, cmap='plasma')

    return output_path


@app.route("/")
def index():
    return "Depth Map Estimation API"


@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file in the static directory for easy access
    original_image_path = os.path.join("static", file.filename)
    file.save(original_image_path)

    # Process the image and generate depth map
    depth_map_path = process_image(original_image_path)

    # Return JSON response with both original image and depth map URLs
    return jsonify({
        "original_image_url": f"/{original_image_path}",
        "depth_map_url": f"/{depth_map_path}"
    }), 200
    
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


if __name__ == "__main__":
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    if not os.path.exists("static"):
        os.makedirs("static")
    app.run(debug=True)

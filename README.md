# 3D Model Viewer from Depth Map

This project allows users to upload an image, generate a depth map, and view a 3D representation of the image based on the depth map using Three.js. The app consists of a **Nextjs frontend** and a **Flask backend**.




## Features

- Upload an image and generate a depth map.
- Display the original image and the depth map.
- Render a 3D model from the depth map using Three.js.
- Apply the original image texture to the 3D model for enhanced visualization.

## Technologies

### Frontend:
- React
- @react-three/fiber (Three.js)
- @react-three/drei (OrbitControls)
- Tailwind CSS for styling

### Backend:
- Python (Flask)
- OpenCV (for image processing)
- Pytorch (MiDaS - computes relative inverse depth) 

## Video on How it works
[![Watch the video](https://img.youtube.com/vi/op4MsEdGXvk/0.jpg)](https://youtu.be/op4MsEdGXvk)



## Setup

### Frontend

1. Clone the repository:

```bash
git clone https://github.com/yourusername/3dfy
cd 3dfy/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the React app:

```bash
npm run dev
```

### Backend

1. Navigate to the backend directory:

```bash
cd ../backend
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the Flask server:

```bash
flask run 
```

> The backend runs on `http://localhost:5000` by default.


## Usage

1. Go to the frontend web application and upload an image.
2. The backend will generate a depth map.
3. The frontend will display the original image, the depth map, and a 3D model based on the depth map.
4. You can view the 3D model with and without texture using the depth map displacement.

## Contributing

Contributions are welcome! Please open an issue or create a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.


## References

- Ranftl, R., Lasinger, K., Hafner, D., Schindler, K., & Koltun, V. (2020). Towards Robust Monocular Depth Estimation: Mixing Datasets for Zero-shot Cross-dataset Transfer. *IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)*.


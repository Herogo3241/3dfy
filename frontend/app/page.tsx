"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader, PlaneGeometry } from "three";
import { useEffect, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [depthMapUrl, setDepthMapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [depthTexture, setDepthTexture] = useState<any>(null);
  const [originalTexture, setOriginalTexture] = useState<any>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    setIsLoading(true);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send file to Flask backend
      const response = await fetch("https://threedfy-1.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const depthMapUrl = `https://threedfy-1.onrender.com${data.depth_map_url}`;
      const originalImageUrl = `https://threedfy-1.onrender.com${data.original_image_url}`;
      
      setDepthMapUrl(depthMapUrl);
      setOriginalImageUrl(originalImageUrl);

      // Load the depth map as a texture
      const textureLoader = new TextureLoader();
      textureLoader.load(depthMapUrl, (texture) => {
        setDepthTexture(texture);
      });

      // Load the original image as a texture
      textureLoader.load(originalImageUrl, (texture) => {
        setOriginalTexture(texture);
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  function DepthMapMesh({ depthTexture }: { depthTexture: any }) {
    const meshRef = useRef<any>();

    useEffect(() => {
      if (meshRef.current) {
        const geometry = meshRef.current.geometry as PlaneGeometry;
        const position = geometry.attributes.position;

        // Use the depth texture to displace the vertices
        const imageWidth = depthTexture.image.width;
        const imageHeight = depthTexture.image.height;

        const canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(depthTexture.image, 0, 0, imageWidth, imageHeight);
          const depthData = context.getImageData(0, 0, imageWidth, imageHeight).data;

          // Modify the vertices of the plane based on the depth map
          for (let i = 0; i < position.count; i++) {
            const pixelIndex = i * 4; // RGBA

            // Read depth from the red channel (assuming grayscale image)
            const depthValue = depthData[pixelIndex] / 255; // Normalize depth to [0, 1]
            position.setZ(i, depthValue); // Displace Z-coordinate
          }

          position.needsUpdate = true;
        }
      }
    }, [depthTexture]);

    return (
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 2, depthTexture.image.width - 1, depthTexture.image.height - 1]} />
        <meshBasicMaterial map={depthTexture} />
      </mesh>
    );
  }

  function TextureDepthMapMesh({ depthTexture, originalTexture }: { depthTexture: any; originalTexture: any }) {
    const meshRef = useRef<any>();

    useEffect(() => {
      if (meshRef.current) {
        const geometry = meshRef.current.geometry as PlaneGeometry;
        const position = geometry.attributes.position;

        // Use the depth texture to displace the vertices
        const imageWidth = depthTexture.image.width;
        const imageHeight = depthTexture.image.height;

        const canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(depthTexture.image, 0, 0, imageWidth, imageHeight);
          const depthData = context.getImageData(0, 0, imageWidth, imageHeight).data;

          // Modify the vertices of the plane based on the depth map
          for (let i = 0; i < position.count; i++) {
            const pixelIndex = i * 4; // RGBA

            // Read depth from the red channel (assuming grayscale image)
            const depthValue = depthData[pixelIndex] / 255; // Normalize depth to [0, 1]
            position.setZ(i, depthValue); // Displace Z-coordinate
          }

          position.needsUpdate = true;
        }
      }
    }, [depthTexture]);
    return (
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 2, depthTexture.image.width - 1, depthTexture.image.height - 1]} />
        <meshBasicMaterial map={originalTexture} />
      </mesh>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">3Dfy</h1>
      <form className="flex flex-col items-center w-full max-w-md" onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Upload"}
        </button>
      </form>

      {originalImageUrl && depthMapUrl && (
        <div className="mt-6 w-full flex flex-col md:flex-row justify-between">
          <div className="w-full md:w-1/2 p-2">
            <h2 className="text-xl font-semibold mb-2 text-center">Original Image</h2>
            <img src={originalImageUrl} alt="Original" className="max-w-full h-auto rounded shadow" />
          </div>
          <div className="w-full md:w-1/2 p-2">
            <h2 className="text-xl font-semibold mb-2 text-center">Depth Map</h2>
            <img src={depthMapUrl} alt="Depth Map" className="max-w-full h-auto rounded shadow" />
          </div>
        </div>
      )}

      {depthTexture && (
        <div className="mt-6 w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center">3D Model from Depth Map</h2>
          <div className="h-[400px] w-full">
            <Canvas>
              <OrbitControls />
              <ambientLight intensity={0.5} />
              <DepthMapMesh depthTexture={depthTexture} />
            </Canvas>
          </div>
        </div>
      )}

      {originalTexture && (
        <div className="mt-6 w-full">
          <h2 className="text-2xl font-semibold mb-4 text-center">3D Model with Textures</h2>
          <div className="h-[400px] w-full">
            <Canvas>
              <OrbitControls />
              <ambientLight intensity={0.5} />
              <TextureDepthMapMesh originalTexture={originalTexture} depthTexture={depthTexture} />
            </Canvas>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import ModelViewer from "./components/ModelViewer";

export default function Home() {
  const [formData, setFormData] = useState({
    width: 50,
    height: 50,
    depth: 50,
    format: "stl",
  });
  const [modelUrl, setModelUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const response = await fetch("http://127.0.0.1:8000/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          width: formData.width,
          height: formData.height,
          depth: formData.depth,
          file_format: formData.format,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate model");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setModelUrl(url); // Set the model URL for display

      // Auto-download the model
      const a = document.createElement("a");
      a.href = url;
      a.download = `model.${formData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating model:", error);
    }
  };

  return (
      <div>
        <div className="p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-bold mb-4">3D Model Generator</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="number" name="width" value={formData.width} onChange={handleChange} className="border p-2 w-full" placeholder="Width" />
            <input type="number" name="height" value={formData.height} onChange={handleChange} className="border p-2 w-full" placeholder="Height" />
            <input type="number" name="depth" value={formData.depth} onChange={handleChange} className="border p-2 w-full" placeholder="Depth" />

            <select name="format" value={formData.format} onChange={handleChange} className="border p-2 w-full">
              <option value="stl">STL</option>
              <option value="step">STEP</option>
              <option value="obj">OBJ</option>
            </select>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Generate</button>
          </form>
        </div>

        {/* Show ModelViewer only if modelUrl exists */}
        {modelUrl && <ModelViewer url={modelUrl} />}
      </div>
  );
}

"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ModelViewer({ url }) {
    const [geometry, setGeometry] = useState(null);

    useEffect(() => {
        if (!url) return;

        const loader = new STLLoader();
        loader.load(url, (geo) => {
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const mesh = new THREE.Mesh(geo, material);
            setGeometry(mesh);
        });

        return () => setGeometry(null); // Cleanup function
    }, [url]);

    return (
        <Canvas style={{ width: "100%", height: "500px" }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[1, 1, 1]} />
            {geometry && <primitive object={geometry} />}
            <OrbitControls />
        </Canvas>
    );
}

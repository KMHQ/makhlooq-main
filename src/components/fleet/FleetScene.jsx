"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DRACOLoader, GLTFLoader } from "three-stdlib";
import * as THREE from "three";

const toModelProxyUrl = (url) => {
    if (!url || typeof url !== "string") return "";

    try {
        const parsed = new URL(url);
        if (parsed.hostname === "api.fleetyards.net" || parsed.hostname === "fleetyards.net") {
            return `/api/fleetyards/model-proxy?url=${encodeURIComponent(parsed.toString())}`;
        }
    } catch {
        return url;
    }

    return url;
};

function FleetHoloModel({ url, accentColor, shipKey, onError, onLoaded }) {
    const [scene, setScene] = useState(null);
    const model = useMemo(() => {
        if (!scene) return null;

        const preparedModel = scene.clone(true);

        const box = new THREE.Box3().setFromObject(preparedModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const scale = 9 / maxAxis;

        preparedModel.position.sub(center);
        preparedModel.scale.setScalar(scale);
        preparedModel.position.set(0, 0.25, 0);

        preparedModel.traverse((child) => {
            if (!child.isMesh) return;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.92;
                child.material.side = THREE.DoubleSide;
                child.material.emissive = new THREE.Color(accentColor);
                child.material.emissiveIntensity = 0.08;
                child.material.metalness = Math.max(child.material.metalness || 0, 0.35);
                child.material.roughness = Math.min(child.material.roughness ?? 0.55, 0.45);
            }
        });

        return preparedModel;
    }, [scene, accentColor]);

    useEffect(() => {
        let cancelled = false;
        setScene(null);

        const manager = new THREE.LoadingManager();
        manager.onError = (assetUrl) => {
            if (!cancelled) {
                onError?.(new Error(`Fleet asset failed: ${assetUrl}`));
            }
        };

        const loader = new GLTFLoader(manager);
        loader.setCrossOrigin("anonymous");

        const dracoLoader = new DRACOLoader(manager);
        dracoLoader.setDecoderPath("/draco/");
        loader.setDRACOLoader(dracoLoader);

        try {
            loader.load(
                url,
                (gltf) => {
                    if (!cancelled) {
                        setScene(gltf.scene);
                        onLoaded?.();
                    }
                },
                undefined,
                (error) => {
                    if (!cancelled) {
                        onError?.(error);
                    }
                },
            );
        } catch (error) {
            if (!cancelled) {
                onError?.(error);
            }
        }

        return () => {
            cancelled = true;
            dracoLoader.dispose();
        };
    }, [url, onError, onLoaded]);

    if (!model) return <LoadingModel />;

    return <primitive key={shipKey} object={model} rotation={[0, -0.55, 0]} />;
}

function ScanRing({ color }) {
    return (
        <mesh position={[0, -2.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[3.25, 3.25, 1]}>
            <ringGeometry args={[0.95, 1, 96]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
    );
}

function SimpleStars({ count = 650, radius = 80 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const r = radius * (0.8 + Math.random() * 0.2);
            p[i3] = r * Math.sin(phi) * Math.cos(theta);
            p[i3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)); // Keep them mostly overhead
            p[i3 + 2] = r * Math.cos(phi);
        }
        return p;
    }, [count, radius]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[points, 3]} />
            </bufferGeometry>
            <pointsMaterial color="#ffffff" size={0.25} sizeAttenuation transparent opacity={0.5} />
        </points>
    );
}

function LoadingModel() {
    return (
        <mesh>
            <torusKnotGeometry args={[1, 0.03, 160, 8]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
        </mesh>
    );
}

export default function FleetScene({ selectedShip }) {
    const [modelFailed, setModelFailed] = useState(false);
    const [modelLoading, setModelLoading] = useState(Boolean(selectedShip?.modelPath || selectedShip?.holoUrl));
    const accentColor = selectedShip?.accentColor || "#d4d4d8";
    const modelUrl = selectedShip?.modelPath || selectedShip?.holoUrl || "";
    const loaderUrl = useMemo(() => toModelProxyUrl(modelUrl), [modelUrl]);
    const modelKey = selectedShip?.id || modelUrl;
    const cellColorObj = useMemo(() => {
        const c = new THREE.Color("#27272a");
        return [c.r, c.g, c.b];
    }, []);
    const sectionColorObj = useMemo(() => {
        const c = new THREE.Color(accentColor);
        return [c.r, c.g, c.b];
    }, [accentColor]);
    const handleModelError = useCallback(() => {
        setModelFailed(true);
        setModelLoading(false);
    }, []);
    const handleModelLoaded = useCallback(() => {
        setModelLoading(false);
    }, []);

    useEffect(() => {
        setModelFailed(false);
        setModelLoading(Boolean(modelUrl));
    }, [modelKey, modelUrl]);

    if (!modelUrl) {
        return (
            <div className="flex h-full min-h-[720px] items-center justify-center p-8 text-center">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/35">3D Scene Not Ready</div>
                    <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
                        This ship's 3D model is not currently in the hangar. The picture mode still looks pretty clean though.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full min-h-[520px] md:min-h-[720px]">
            {modelLoading && !modelFailed ? (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[2.5rem] bg-black/45 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative h-16 w-16">
                            <span
                                className="absolute inset-0 rounded-full border border-lime-300/20"
                                style={{ boxShadow: `0 0 30px ${accentColor}18` }}
                            />
                            <span
                                className="absolute inset-1 rounded-full border border-lime-300/55 border-t-transparent animate-spin"
                                style={{ borderTopColor: "transparent" }}
                            />
                            <span
                                className="absolute inset-[18px] rounded-full bg-lime-300/15 blur-[2px]"
                                style={{ boxShadow: `0 0 18px ${accentColor}44` }}
                            />
                        </div>
                        <div className="font-mono text-[10px] font-black uppercase tracking-[0.36em] text-lime-200/70">Loading hangar</div>
                    </div>
                </div>
            ) : null}

            {modelFailed ? (
                <div className="pointer-events-none absolute inset-x-6 top-24 z-20 rounded-2xl border border-lime-300/10 bg-black/55 p-4 text-sm leading-6 text-white/55 backdrop-blur md:left-8 md:right-auto md:max-w-sm">
                    3D file failed to load. No tension, the ship's photo mode is still running clean.
                </div>
            ) : null}

            <Canvas
                camera={{ position: [5.5, 3.5, 6.5], fov: 32 }}
                dpr={[1, 1.35]}
                frameloop="always"
                performance={{ min: 0.5 }}
                gl={{ antialias: false, powerPreference: "low-power" }}
                onCreated={({ gl }) => {
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                }}
                style={{ background: "transparent", minHeight: "inherit" }}
            >
                <fog attach="fog" args={["#050505", 16, 60]} />

                <ambientLight intensity={0.45} />
                <directionalLight position={[10, 10, 5]} intensity={1.8} color="#ffffff" />
                <pointLight position={[-5, 2, 5]} intensity={1.4} color={accentColor} distance={24} />
                <pointLight position={[5, -2, -5]} intensity={0.8} color="#71717a" distance={18} />

                {!modelFailed ? (
                    <FleetHoloModel
                        url={loaderUrl}
                        accentColor={accentColor}
                        shipKey={modelKey}
                        onError={handleModelError}
                        onLoaded={handleModelLoaded}
                    />
                ) : null}

                <ScanRing color={accentColor} />
                <gridHelper args={[100, 100, accentColor, "#27272a"]} position={[0, -2.8, 0]} />
                <SimpleStars radius={80} count={650} />
                <OrbitControls
                    target={[0, 0.35, 0]}
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate
                    autoRotateSpeed={1.5}
                    minDistance={1.8}
                    maxDistance={14}
                    maxPolarAngle={Math.PI / 2 + 0.35}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
}

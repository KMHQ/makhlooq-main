"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DRACOLoader, GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import type { FleetShip } from "./ships";

// FleetYards assets go through our proxy (CORS + caching).
const toModelProxyUrl = (url: string) => {
    if (!url) return "";

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

interface FleetHoloModelProps {
    url: string;
    accentColor: string;
    shipKey: string;
    onError?: (error: unknown) => void;
    onLoaded?: () => void;
}

function FleetHoloModel({ url, accentColor, shipKey, onError, onLoaded }: FleetHoloModelProps) {
    // Tag the loaded scene with its url so a stale scene isn't shown while the next one loads
    const [loaded, setLoaded] = useState<{ url: string; scene: THREE.Group } | null>(null);
    const scene = loaded?.url === url ? loaded.scene : null;
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
            if (!(child instanceof THREE.Mesh)) return;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material instanceof THREE.MeshStandardMaterial) {
                const material = child.material.clone();
                material.transparent = true;
                material.opacity = 0.92;
                material.side = THREE.DoubleSide;
                material.emissive = new THREE.Color(accentColor);
                material.emissiveIntensity = 0.08;
                material.metalness = Math.max(material.metalness || 0, 0.35);
                material.roughness = Math.min(material.roughness ?? 0.55, 0.45);
                child.material = material;
            }
        });

        return preparedModel;
    }, [scene, accentColor]);

    useEffect(() => {
        let cancelled = false;

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
                        setLoaded({ url, scene: gltf.scene });
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

function ScanRing({ color }: { color: string }) {
    return (
        <mesh position={[0, -2.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[3.25, 3.25, 1]}>
            <ringGeometry args={[0.95, 1, 96]} />
            <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
    );
}

function createStarPositions(count: number, radius: number) {
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
}

function SimpleStars({ count = 650, radius = 80 }) {
    // Lazy initializer: positions are generated once per mount, not on every render
    const [points] = useState(() => createStarPositions(count, radius));

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

export default function FleetScene({ selectedShip }: { selectedShip: FleetShip | null }) {
    const modelUrl = selectedShip?.holoUrl || "";
    const [modelFailed, setModelFailed] = useState(false);
    const [modelLoading, setModelLoading] = useState(Boolean(modelUrl));
    const accentColor = selectedShip?.accentColor || "#d4d4d8";
    const loaderUrl = useMemo(() => toModelProxyUrl(modelUrl), [modelUrl]);
    const modelKey = selectedShip?.id || modelUrl;
    const handleModelError = useCallback(() => {
        setModelFailed(true);
        setModelLoading(false);
    }, []);
    const handleModelLoaded = useCallback(() => {
        setModelLoading(false);
    }, []);

    // Reset load state during render when the model changes
    const modelResetKey = `${modelKey}|${modelUrl}`;
    const [prevModelResetKey, setPrevModelResetKey] = useState(modelResetKey);
    if (prevModelResetKey !== modelResetKey) {
        setPrevModelResetKey(modelResetKey);
        setModelFailed(false);
        setModelLoading(Boolean(modelUrl));
    }

    if (!modelUrl) {
        return (
            <div className="flex h-full min-h-[720px] items-center justify-center p-8 text-center">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/35">3D Scene Not Ready</div>
                    <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
                        This ship&apos;s 3D model is not currently in the hangar. The picture mode still looks pretty clean though.
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
                                className="absolute inset-1 animate-spin rounded-full border border-lime-300/55 border-t-transparent"
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
                    3D file failed to load. No tension, the ship&apos;s photo mode is still running clean.
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

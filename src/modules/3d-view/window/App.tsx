import './index.css';
import { useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';

import {
    Bloom,
    EffectComposer,
    N8AO,
} from '@react-three/postprocessing';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MeshStandardMaterial, Mesh, Color } from 'three';
import {  KernelSize } from 'postprocessing'

function Drone(props) {
    const obj = useLoader(OBJLoader, './drone.obj');

    useEffect(() => {
        // Apply MeshStandardMaterial to all meshes in the loaded object
        const material = new MeshStandardMaterial({
            color: '#888888',
            metalness: 0.3,
            roughness: 0.4,
        });

        obj.traverse((child) => {
            if ((child as Mesh).isMesh) {
                (child as Mesh).material = material;
            }
        });
    }, [obj]);

    return (
        <group {...props}>
            <primitive
                rotation={[0, 0, 0]}
                scale={[0.1, 0.1, 0.1]}
                object={obj}
            />
            <Billboard
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <Text
                    position={[0, 2, 0]}
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    <meshStandardMaterial 
                        color="#ffffff"
                        emissive="#00ffff"
                        emissiveIntensity={1}
                        toneMapped={false}
                    />
                    DRONE-001
                </Text>
            </Billboard>
        </group>
    );
}
export function App() {
    const dronePosition: [number, number, number] = [0, 0, 0];

    return (
        <div className="bg-gradient-to-t from-slate-900 to-teal-900 min-h-screen">
            <Canvas camera={{ position: [5, 5, -10], fov: 30 }}>
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    target={dronePosition}
                />
                <ambientLight color={'#0b4f4a'} intensity={10} />
                <pointLight
                    color={'#0b4f4a'}
                    position={[0, 100000, 0]}
                    decay={0}
                    intensity={60}
                />
                <pointLight
                    color={'#0f172b'}
                    position={[0, -100000, 0]}
                    decay={0}
                    intensity={20}
                />
                <Drone position={dronePosition} />
                <EffectComposer>
                    <N8AO 
                        aoRadius={500}
                        distanceFalloff={0.5}
                        aoSamples={64}
                        intensity={10}
                        quality="high"
                        screenSpaceRadius={true}
                        halfRes={true}
                        color={new Color(0, 0, 0)}
                    />
                    <Bloom
                        luminanceThreshold={0.5}
                        luminanceSmoothing={0.9}
                        kernelSize={KernelSize.HUGE}
                        intensity={0.1}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}

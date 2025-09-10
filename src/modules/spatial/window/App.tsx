import './index.css';
import { useEffect, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import { Line } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MeshStandardMaterial, Mesh, Color } from 'three';
import { KernelSize } from 'postprocessing';
import { Status as ControlStatus } from 'src/modules/control/types';
import { Payload } from 'src/connection';
import { AngleStatus } from '../types';

const TEXT_SCALE = 0.15;
const LINE_HEIGHT = TEXT_SCALE * 1.25;

function Drone(props) {
    const obj = useLoader(OBJLoader, './drone.obj');
    const [controlStatus, setControlStatus] = useState<ControlStatus>({
        left: 0,
        right: 0,
        thrust: 0,
        yaw: 0,
        pitch: 0,
    });

    const [angleStatus, setAngleStatus] = useState<AngleStatus>({
        angle: [0, 0, 0],
        yaw: 0,
    });

    useEffect(() => {
        const spatialChannel = new BroadcastChannel('spatial-window');

        const handleMessage = (event: MessageEvent<Payload>) => {
            const payload = event.data;
            if (payload.namespace === 'control') setControlStatus(payload.data);
            if (payload.namespace === 'angle') setAngleStatus(payload.data);
        };

        spatialChannel.addEventListener('message', handleMessage);

        return () => {
            spatialChannel.removeEventListener('message', handleMessage);
            spatialChannel.close();
        };
    }, []);

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
        <group {...props} rotation={[angleStatus.angle[0] * (Math.PI / 180), angleStatus.angle[1] * (Math.PI / 180), angleStatus.angle[2] * (Math.PI / 180)]}>
            <primitive
                rotation={[0, 0, 0]}
                scale={[0.1, 0.1, 0.1]}
                object={obj}
            />
            <group position={[0, -0.5, -2.5]}>
                <Billboard
                    follow={true}
                    lockX={false}
                    lockY={false}
                    lockZ={false}
                >
                    <Text
                        fontSize={TEXT_SCALE * 1}
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
                        Thrust
                    </Text>
                    <Text
                        position={[0, -LINE_HEIGHT, 0]}
                        fontSize={TEXT_SCALE * 0.75}
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
                        Power: {(controlStatus.thrust * 100).toFixed(0)}%
                    </Text>
                </Billboard>
                <Line
                    points={[
                        [0, 0.5, 0], // Left side of drone
                        [0, 0.2, 0], // Right side of drone
                    ]}
                    color="#ffffff"
                    transparent={true}
                    opacity={0.25}
                    lineWidth={0.02}
                    worldUnits={true}
                />
            </group>
            <group position={[0, 0.54, -1.93]}>
                <Billboard
                    position={
                        [-0.85, 0, 0] // Position the billboard above the drone
                    }
                    follow={true}
                    lockX={false}
                    lockY={false}
                    lockZ={false}
                >
                    <Text
                        position={[0, 0, 0]}
                        fontSize={TEXT_SCALE * 1}
                        color="#ffffff"
                        anchorX="left"
                        anchorY="middle"
                    >
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            toneMapped={false}
                        />
                        Yaw
                    </Text>
                    <Text
                        position={[0, -LINE_HEIGHT, 0]}
                        fontSize={TEXT_SCALE * 0.75}
                        color="#ffffff"
                        anchorX="left"
                        anchorY="middle"
                    >
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            toneMapped={false}
                        />
                        Power: {(controlStatus.yaw * 100).toFixed(0)}%
                    </Text>
                </Billboard>

                <Line
                    points={[
                        [-0.2, 0, 0], // Left side of drone
                        [-0.7, 0, 0], // Right side of drone
                    ]}
                    color="#ffffff"
                    transparent={true}
                    opacity={0.25}
                    lineWidth={0.02}
                    worldUnits={true}
                />
            </group>
            <group position={[0, 0, -0.5]}>
                <group position={[-0.7, 0, 0]}>
                    <Billboard
                        position={
                            [-0.4, 1.05, 0] // Position the billboard above the drone
                        }
                        follow={true}
                        lockX={false}
                        lockY={false}
                        lockZ={false}
                    >
                        <Text
                            fontSize={TEXT_SCALE * 1}
                            color="#ffffff"
                            anchorX="left"
                            anchorY="middle"
                        >
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#00ffff"
                                emissiveIntensity={1}
                                toneMapped={false}
                            />
                            Right
                        </Text>
                        <Text
                            position={[0, -LINE_HEIGHT, 0]}
                            fontSize={TEXT_SCALE * 0.75}
                            color="#ffffff"
                            anchorX="left"
                            anchorY="middle"
                        >
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#00ffff"
                                emissiveIntensity={1}
                                toneMapped={false}
                            />
                            Power: {(controlStatus.right * 100).toFixed(0)}%
                        </Text>
                    </Billboard>
                    <Line
                        points={[
                            [0, 0.5, 0], // Left side of drone
                            [-0.25, 1, 0], // Right side of drone
                        ]}
                        color="#ffffff"
                        transparent={true}
                        opacity={0.25}
                        lineWidth={0.02}
                        worldUnits={true}
                    />
                </group>

                <group position={[0.7, 0, 0]}>
                    <Billboard
                        position={
                            [0.4, 1.05, 0] // Position the billboard above the drone
                        }
                        follow={true}
                        lockX={false}
                        lockY={false}
                        lockZ={false}
                    >
                        <Text
                            fontSize={TEXT_SCALE * 1}
                            color="#ffffff"
                            anchorX="right"
                            anchorY="middle"
                        >
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#00ffff"
                                emissiveIntensity={1}
                                toneMapped={false}
                            />
                            Left
                        </Text>
                        <Text
                            position={[0, -LINE_HEIGHT, 0]}
                            fontSize={TEXT_SCALE * 0.75}
                            color="#ffffff"
                            anchorX="right"
                            anchorY="middle"
                        >
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive="#00ffff"
                                emissiveIntensity={1}
                                toneMapped={false}
                            />
                            Power: {(controlStatus.left * 100).toFixed(0)}%
                        </Text>
                    </Billboard>
                    <Line
                        points={[
                            [0, 0.5, 0], // Left side of drone
                            [0.25, 1, 0], // Right side of drone
                        ]}
                        color="#ffffff"
                        transparent={true}
                        opacity={0.25}
                        lineWidth={0.02}
                        worldUnits={true}
                    />
                </group>
            </group>
            <group position={[0, 1, -2.6]}>
                <Billboard
                    position={
                        [0.85, 0.2, 0] // Position the billboard above the drone
                    }
                    follow={true}
                    lockX={false}
                    lockY={false}
                    lockZ={false}
                >
                    <Text
                        position={[0, 0, 0]}
                        fontSize={TEXT_SCALE * 1}
                        color="#ffffff"
                        anchorX="right"
                        anchorY="middle"
                    >
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            toneMapped={false}
                        />
                        Pitch
                    </Text>
                    <Text
                        position={[0, -LINE_HEIGHT, 0]}
                        fontSize={TEXT_SCALE * 0.75}
                        color="#ffffff"
                        anchorX="right"
                        anchorY="middle"
                    >
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#00ffff"
                            emissiveIntensity={1}
                            toneMapped={false}
                        />
                        Power: {(controlStatus.pitch * 100).toFixed(0)}%
                    </Text>
                </Billboard>

                <Line
                    points={[
                        [0.2, 0, 0], // Left side of drone
                        [0.7, 0.2, 0], // Right side of drone
                    ]}
                    color="#ffffff"
                    transparent={true}
                    opacity={0.25}
                    lineWidth={0.02}
                    worldUnits={true}
                />
            </group>
        </group>
    );
}
export function App() {
    const [dronePosition, setDronePosition] =
        useState<[number, number, number]>([0, 0, 0]);

    useEffect(() => {
        const spatialChannel = new BroadcastChannel('spatial-window');

        const handleMessage = (event: MessageEvent<Payload>) => {
            console.log('Received message:', event.data);
            if (event.data.namespace === 'location') {
                console.log('Location data received:', event.data.data);
                // Update drone position based on location data
                setDronePosition([
                    (event.data.data as Location).x,
                    (event.data.data as Location).y,
                    (event.data.data as Location).z,
                ]);
                console.log('Drone position updated:', dronePosition);
            }
        };

        spatialChannel.addEventListener('message', handleMessage);

        return () => {
            spatialChannel.removeEventListener('message', handleMessage);
            spatialChannel.close();
        };
    }, []);

    return (
        <div className="bg-gray-900 bg-gradient-to-t from-gray-950 min-h-screen">
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

"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

type Phase = {
  name: string;
  position: [number, number, number];
  color: string;
  progress: string;
  spi: string;
  delay: string;
};

const phases: Phase[] = [
  { name: "Phase 1", position: [2, 0.45, -3], color: "#22c55e", progress: "31%", spi: "0.93", delay: "4 Days" },
  { name: "Phase 2", position: [-6, 0.45, 2.8], color: "#06b6d4", progress: "18%", spi: "0.82", delay: "7 Days" },
  { name: "Phase 3", position: [3.3, 0.45, -1.2], color: "#22c55e", progress: "42%", spi: "1.00", delay: "0 Days" },
  { name: "Phase 4", position: [-1.2, 0.45, 0.5], color: "#f59e0b", progress: "26%", spi: "0.90", delay: "2 Days" },
  { name: "Phase 5", position: [6.1, 0.45, -4.5], color: "#a855f7", progress: "12%", spi: "0.88", delay: "5 Days" },
];

function Masterplan() {
  const texture = useLoader(THREE.TextureLoader, "/walkthrough/maseel-masterplan.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 12]} />
      <meshStandardMaterial
    map={texture}
    roughness={0.95}
    metalness={0}
 />
    </mesh>
  );
}

function PhaseZone({ phase }: { phase: Phase }) {
  return (
    <group position={phase.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.75, 64]} />
        <meshBasicMaterial color={phase.color} transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={phase.color} emissive={phase.color} emissiveIntensity={2} />
      </mesh>

      <Html center distanceFactor={9} position={[0, 0.65, 0]}>
        <div
          style={{
            background: "rgba(6, 15, 28, 0.86)",
            border: `1px solid ${phase.color}`,
            borderRadius: "12px",
            padding: "8px 11px",
            color: "white",
            fontSize: "12px",
            minWidth: "130px",
            boxShadow: `0 0 24px ${phase.color}55`,
            backdropFilter: "blur(12px)",
          }}
        >
          <b style={{ color: phase.color }}>{phase.name}</b>
          <div>Progress: {phase.progress}</div>
          <div>SPI: {phase.spi}</div>
          <div>Delay: {phase.delay}</div>
        </div>
      </Html>
    </group>
  );
}

export default function WalkthroughPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050b14" }}>
      <Canvas camera={{ position: [0, 9, 11], fov: 42 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.8} />
        <color attach="background" args={["#87CEEB"]} />

<fog attach="fog" args={["#cfefff", 18, 60]} />

<ambientLight intensity={1.2} />

<directionalLight
  castShadow
  position={[15, 20, 10]}
  intensity={2.4}
  shadow-mapSize-width={4096}
  shadow-mapSize-height={4096}
/>

        <Masterplan />
        {phases.map((phase) => (
          <PhaseZone key={phase.name} phase={phase} />
        ))}

        <OrbitControls enablePan enableZoom enableRotate maxPolarAngle={1.35} />
      </Canvas>
    </div>
  );
}
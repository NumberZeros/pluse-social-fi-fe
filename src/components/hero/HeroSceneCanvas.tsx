import type { MotionValue } from 'framer-motion';
import { useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, Sparkles } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface HeroSceneCanvasProps {
  scrollYProgress: MotionValue<number>;
}

type Palette = {
  gold: string;
  cyan: string;
  purple: string;
  rose: string;
};

type NetworkNode = {
  position: [number, number, number];
  color: string;
  size: number;
  orbitSpeed: number;
  orbitRadius: number;
  orbitOffset: number;
};

/* Connection line between two nodes */
function ConnectionLine({ start, end, color, opacity = 0.6 }: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  opacity?: number;
}) {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([start, end]);
  }, [start, end]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
    });
  }, [color, opacity]);

  // Use 'primitive' to attach a THREE.Line directly
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  return <primitive object={line} />;
}

/* Animated node in the network */
function NetworkNodeMesh({ node }: {
  node: NetworkNode;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a1a1a'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.6,
      ior: 1.8,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: new THREE.Color(node.color),
      emissiveIntensity: 0.8,
      reflectivity: 0.9,
      envMapIntensity: 1.5,
    });
  }, [node.color]);

  // Animate orbit using useFrame's clock
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const angle = t * node.orbitSpeed + node.orbitOffset;
      meshRef.current.position.x = node.position[0] + Math.cos(angle) * node.orbitRadius * 0.3;
      meshRef.current.position.y = node.position[1] + Math.sin(angle * 0.7) * node.orbitRadius * 0.2;
      meshRef.current.position.z = node.position[2] + Math.sin(angle) * node.orbitRadius * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={node.position} material={material}>
      <sphereGeometry args={[node.size, 32, 32]} />
    </mesh>
  );
}

function Scene({ scrollRef, pointerRef, palette }: {
  scrollRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  palette: Palette;
}) {
  const group = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const connectionsRef = useRef<THREE.Group>(null);

  const lookAt = useMemo(() => new THREE.Vector3(0.5, 0, 0), []);

  // Central "You" node
  const centralNode = useMemo(() => ({
    position: [0, 0, 0] as [number, number, number],
    color: palette.gold,
    size: 0.35,
    orbitSpeed: 0,
    orbitRadius: 0,
    orbitOffset: 0,
  }), [palette.gold]);

  // Surrounding network nodes (connections/followers)
  const networkNodes: NetworkNode[] = useMemo(() => [
    // Inner ring - closer connections
    { position: [1.2, 0.3, 0.5], color: palette.purple, size: 0.18, orbitSpeed: 0.4, orbitRadius: 0.8, orbitOffset: 0 },
    { position: [-1.0, 0.5, 0.3], color: palette.cyan, size: 0.2, orbitSpeed: 0.35, orbitRadius: 0.7, orbitOffset: Math.PI * 0.5 },
    { position: [0.8, -0.6, 0.4], color: palette.rose, size: 0.16, orbitSpeed: 0.45, orbitRadius: 0.6, orbitOffset: Math.PI },
    { position: [-0.9, -0.4, 0.6], color: palette.purple, size: 0.17, orbitSpeed: 0.38, orbitRadius: 0.75, orbitOffset: Math.PI * 1.5 },
    { position: [0.3, 0.9, 0.2], color: palette.gold, size: 0.19, orbitSpeed: 0.42, orbitRadius: 0.65, orbitOffset: Math.PI * 0.25 },
    // Outer ring - extended network
    { position: [1.8, 0.8, -0.3], color: palette.cyan, size: 0.12, orbitSpeed: 0.3, orbitRadius: 1.0, orbitOffset: Math.PI * 0.3 },
    { position: [-1.6, 0.9, -0.2], color: palette.purple, size: 0.13, orbitSpeed: 0.28, orbitRadius: 0.9, orbitOffset: Math.PI * 0.7 },
    { position: [1.5, -0.9, -0.4], color: palette.rose, size: 0.11, orbitSpeed: 0.32, orbitRadius: 1.1, orbitOffset: Math.PI * 1.1 },
    { position: [-1.4, -0.8, 0.1], color: palette.gold, size: 0.14, orbitSpeed: 0.25, orbitRadius: 0.85, orbitOffset: Math.PI * 1.4 },
    { position: [0.1, 1.4, -0.5], color: palette.purple, size: 0.1, orbitSpeed: 0.33, orbitRadius: 0.95, orbitOffset: Math.PI * 1.8 },
    { position: [-0.3, -1.3, 0.2], color: palette.cyan, size: 0.12, orbitSpeed: 0.29, orbitRadius: 1.05, orbitOffset: Math.PI * 0.1 },
    // Far nodes
    { position: [2.2, 0.2, -0.8], color: palette.purple, size: 0.08, orbitSpeed: 0.22, orbitRadius: 1.2, orbitOffset: Math.PI * 0.6 },
    { position: [-2.0, 0.1, -0.6], color: palette.rose, size: 0.09, orbitSpeed: 0.2, orbitRadius: 1.15, orbitOffset: Math.PI * 1.2 },
  ], [palette.cyan, palette.gold, palette.purple, palette.rose]);

  // Central node material (larger, more prominent)
  const centralMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a1a1a'),
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.9,
      thickness: 1.0,
      ior: 2.0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      emissive: new THREE.Color(palette.gold),
      emissiveIntensity: 1.2,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
    });
  }, [palette.gold]);

  // Glow ring around central node
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(palette.gold),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
  }, [palette.gold]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    timeRef.current = t;
    const s = scrollRef.current;
    const px = pointerRef.current.x;
    const py = pointerRef.current.y;

    if (group.current) {
      // Gentle rotation following pointer
      group.current.rotation.y = t * 0.08 + px * 0.25;
      group.current.rotation.x = t * 0.02 + py * 0.15;

      // Position offset
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0.8 + px * 0.15, 0.05);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, s * -0.4, 0.06);
    }

    state.camera.lookAt(lookAt);
  });

  // Pre-calculate connection endpoints
  const connections = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    const center = new THREE.Vector3(0, 0, 0);

    // Connect all nodes to center
    networkNodes.forEach((node) => {
      result.push({
        start: center.clone(),
        end: new THREE.Vector3(...node.position),
        color: node.color,
      });
    });

    // Some node-to-node connections for network effect
    const pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 6], [7, 8], [9, 10], [0, 5], [2, 7]];
    pairs.forEach(([i, j]) => {
      if (networkNodes[i] && networkNodes[j]) {
        result.push({
          start: new THREE.Vector3(...networkNodes[i].position),
          end: new THREE.Vector3(...networkNodes[j].position),
          color: palette.purple,
        });
      }
    });

    return result;
  }, [networkNodes, palette.purple]);

  return (
    <group ref={group}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 5, 6]} intensity={3.0} color={'#ffffff'} />
      <pointLight position={[-4, 2, -3]} intensity={8} color={palette.gold} />
      <pointLight position={[3, -2, 4]} intensity={5} color={palette.purple} />
      <pointLight position={[-2, -3, 2]} intensity={4} color={palette.cyan} />

      {/* Environment for reflections */}
      <Environment resolution={64}>
        <Lightformer intensity={1.8} position={[0, 5, 2]} scale={[8, 4, 1]} color={'#ffffff'} />
        <Lightformer intensity={1.2} position={[6, 1, 2]} scale={[4, 3, 1]} color={palette.gold} />
        <Lightformer intensity={1.0} position={[-6, 1, 1]} scale={[4, 3, 1]} color={palette.purple} />
      </Environment>

      {/* Sparkles around the network */}
      <Sparkles count={150} scale={[8, 5, 8]} size={0.4} speed={0.4} opacity={0.18} color={palette.gold} />
      <Sparkles count={80} scale={[6, 4, 6]} size={0.25} speed={0.25} opacity={0.12} color={palette.purple} />

      {/* Connection lines */}
      <group ref={connectionsRef}>
        {connections.map((conn, i) => (
          <ConnectionLine
            key={i}
            start={conn.start}
            end={conn.end}
            color={conn.color}
            opacity={i < networkNodes.length ? 0.5 : 0.25}
          />
        ))}
      </group>

      {/* Central node (You) */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh material={centralMaterial}>
          <sphereGeometry args={[centralNode.size, 48, 48]} />
        </mesh>
        {/* Pulse ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={glowMaterial}>
          <ringGeometry args={[0.45, 0.55, 64]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={glowMaterial}>
          <ringGeometry args={[0.65, 0.72, 64]} />
        </mesh>
      </Float>

      {/* Network nodes */}
      {networkNodes.map((node, i) => (
        <NetworkNodeMesh key={i} node={node} />
      ))}

      {/* Outer orbit rings */}
      <mesh rotation={[Math.PI / 2.5, 0.2, 0]}>
        <torusGeometry args={[2.5, 0.008, 12, 200]} />
        <meshBasicMaterial color={palette.gold} transparent opacity={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 3, -0.3, 0.5]}>
        <torusGeometry args={[3.0, 0.006, 12, 200]} />
        <meshBasicMaterial color={palette.purple} transparent opacity={0.12} />
      </mesh>

      {/* Fog for depth */}
      <fog attach="fog" args={['#000000', 8, 25]} />
    </group>
  );
}

export function HeroSceneCanvas({ scrollYProgress }: HeroSceneCanvasProps) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  // Solana-aligned palette: Green, Purple, Lime
  const palette: Palette = useMemo(
    () => ({
      gold: '#14F195',      // Solana Green (Primary)
      cyan: '#ABFE2C',      // Lens Lime (Secondary)
      purple: '#9945FF',    // Solana Purple (Tertiary)
      rose: '#FFFFFF',      // White (Accent)
    }),
    []
  );

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    scrollRef.current = v;
  });

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (e: MouseEvent) => {
      pointerRef.current.x = e.clientX / window.innerWidth - 0.5;
      pointerRef.current.y = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      {/* Keeps the left text readable while the 3D sits on the right */}
      <div className="absolute inset-0 hero-vignette" />

      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0.25, 0.3, 7.8], fov: 38, near: 0.1, far: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene scrollRef={scrollRef} pointerRef={pointerRef} palette={palette} />
      </Canvas>
    </div>
  );
}

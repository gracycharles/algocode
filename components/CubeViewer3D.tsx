'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CubeType, Algorithm } from '@/lib/algorithms';
import { haptics } from '@/lib/haptics';
import { voiceCoach } from '@/lib/voiceCoach';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';

interface CubeViewer3DProps {
  cubeType: CubeType;
  algorithm?: Algorithm | null;
  onMoveChange?: (currentStepIndex: number) => void;
  onAlgorithmComplete?: () => void;
}

// Tournament Competition Colors (WCA Standard)
const COLORS = {
  right: 0xdc2626,   // Red (R face)
  left: 0xea580c,    // Orange (L face)
  top: 0xffffff,     // White (U face)
  bottom: 0xfacc15,  // Yellow (D face)
  front: 0x16a34a,   // Green (F face)
  back: 0x2563eb,    // Blue (B face)
  internal: 0x111827 // Charcoal Black Core
};

// Snaps a quaternion to the nearest exact 90-degree orthogonal orientation
function snapQuaternion(q: THREE.Quaternion): THREE.Quaternion {
  const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const e = m.elements;

  const colX = new THREE.Vector3(e[0], e[1], e[2]);
  const colY = new THREE.Vector3(e[4], e[5], e[6]);

  const snapToAxis = (v: THREE.Vector3): THREE.Vector3 => {
    const ax = Math.abs(v.x);
    const ay = Math.abs(v.y);
    const az = Math.abs(v.z);
    if (ax >= ay && ax >= az) {
      return new THREE.Vector3(Math.sign(v.x) || 1, 0, 0);
    } else if (ay >= ax && ay >= az) {
      return new THREE.Vector3(0, Math.sign(v.y) || 1, 0);
    } else {
      return new THREE.Vector3(0, 0, Math.sign(v.z) || 1);
    }
  };

  const newX = snapToAxis(colX);
  let newY = snapToAxis(colY);

  if (Math.abs(newX.dot(newY)) > 0.5) {
    if (newX.x === 0) newY = new THREE.Vector3(1, 0, 0);
    else newY = new THREE.Vector3(0, 1, 0);
  }

  const newZ = new THREE.Vector3().crossVectors(newX, newY);
  newY = new THREE.Vector3().crossVectors(newZ, newX);

  const snappedM = new THREE.Matrix4().makeBasis(newX, newY, newZ);
  return new THREE.Quaternion().setFromRotationMatrix(snappedM).normalize();
}

export default function CubeViewer3D({
  cubeType,
  algorithm,
  onMoveChange,
  onAlgorithmComplete,
}: CubeViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const cubiesRef = useRef<THREE.Mesh[]>([]);
  const animFrameId = useRef<number | null>(null);
  const activeMoveAnimRef = useRef<number | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Synchronous execution locks and state references
  const isPlayingRef = useRef<boolean>(false);
  const isBusyRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(-1);
  const playSpeedRef = useRef<number>(1);
  const voiceEnabledRef = useRef<boolean>(true);
  const algorithmRef = useRef<Algorithm | null | undefined>(algorithm);
  const onMoveChangeRef = useRef(onMoveChange);
  const onAlgorithmCompleteRef = useRef(onAlgorithmComplete);
  const playbackRunIdRef = useRef<number>(0);

  useEffect(() => {
    algorithmRef.current = algorithm;
  }, [algorithm]);

  useEffect(() => {
    onMoveChangeRef.current = onMoveChange;
  }, [onMoveChange]);

  useEffect(() => {
    onAlgorithmCompleteRef.current = onAlgorithmComplete;
  }, [onAlgorithmComplete]);

  useEffect(() => {
    playSpeedRef.current = playSpeed;
  }, [playSpeed]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  const N = cubeType === '5x5' ? 5 : cubeType === '4x4' ? 4 : 3;
  const isEven = N % 2 === 0;
  const defaultRadius = cubeType === '5x5' ? 13.5 : cubeType === '4x4' ? 11.2 : 9.0;

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSpherical = useRef<{ radius: number; theta: number; phi: number }>({
    radius: defaultRadius,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  const resetCameraView = () => {
    cameraSpherical.current = {
      radius: defaultRadius,
      theta: Math.PI / 4,
      phi: Math.PI / 3,
    };
    updateCameraPosition();
    haptics.trigger('reset');
  };

  const snapCoordinate = useCallback((val: number): number => {
    if (isEven) {
      return Math.round(val * 2) / 2;
    }
    return Math.round(val);
  }, [isEven]);

  const buildCube = useCallback(() => {
    if (!sceneRef.current || !cubeGroupRef.current) return;

    if (activeMoveAnimRef.current) {
      cancelAnimationFrame(activeMoveAnimRef.current);
      activeMoveAnimRef.current = null;
    }

    cubiesRef.current.forEach((cubie) => {
      cubie.geometry.dispose();
      if (Array.isArray(cubie.material)) {
        cubie.material.forEach((m) => m.dispose());
      }
      cubeGroupRef.current?.remove(cubie);
    });
    cubiesRef.current = [];

    const size = 0.93;
    const spacing = 1.0;
    const half = (N - 1) / 2;

    const geometry = new THREE.BoxGeometry(size, size, size);

    for (let x = -half; x <= half + 0.001; x += 1) {
      for (let y = -half; y <= half + 0.001; y += 1) {
        for (let z = -half; z <= half + 0.001; z += 1) {
          const isOuter =
            Math.abs(x) >= half - 0.1 ||
            Math.abs(y) >= half - 0.1 ||
            Math.abs(z) >= half - 0.1;
          if (!isOuter) continue;

          const materials: THREE.MeshStandardMaterial[] = [
            new THREE.MeshStandardMaterial({
              color: x >= half - 0.1 ? COLORS.right : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
            new THREE.MeshStandardMaterial({
              color: x <= -half + 0.1 ? COLORS.left : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
            new THREE.MeshStandardMaterial({
              color: y >= half - 0.1 ? COLORS.top : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
            new THREE.MeshStandardMaterial({
              color: y <= -half + 0.1 ? COLORS.bottom : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
            new THREE.MeshStandardMaterial({
              color: z >= half - 0.1 ? COLORS.front : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
            new THREE.MeshStandardMaterial({
              color: z <= -half + 0.1 ? COLORS.back : COLORS.internal,
              roughness: 0.25,
              metalness: 0.04,
            }),
          ];

          const cubie = new THREE.Mesh(geometry, materials);
          const snappedX = snapCoordinate(x * spacing);
          const snappedY = snapCoordinate(y * spacing);
          const snappedZ = snapCoordinate(z * spacing);
          cubie.position.set(snappedX, snappedY, snappedZ);
          cubie.castShadow = true;
          cubie.receiveShadow = true;

          cubie.userData = {
            gridX: snappedX,
            gridY: snappedY,
            gridZ: snappedZ,
          };

          cubeGroupRef.current.add(cubie);
          cubiesRef.current.push(cubie);
        }
      }
    }
  }, [N, snapCoordinate]);

  const executeMove = useCallback(
    (moveNotation: string, reverse: boolean = false): Promise<void> => {
      return new Promise((resolve) => {
        if (!cubeGroupRef.current || cubiesRef.current.length === 0) {
          resolve();
          return;
        }

        haptics.trigger('turn');

        const half = (N - 1) / 2;
        const norm = moveNotation.trim();
        const isDouble = norm.includes('2');
        const isPrime = norm.includes("'");

        let axis = new THREE.Vector3(1, 0, 0);
        let baseAngle = -Math.PI / 2;
        let condition: (pos: THREE.Vector3) => boolean = () => true;

        const eps = 0.35;

        // Parse target face and slice layers
        if (
          norm.startsWith('R') ||
          norm.startsWith('2R') ||
          norm.startsWith('3R') ||
          norm.startsWith('r')
        ) {
          axis.set(1, 0, 0);
          baseAngle = -Math.PI / 2;
          if (norm.startsWith('3Rw')) {
            condition = (p) => (isEven ? p.x >= -eps : p.x >= half - 2 - eps);
          } else if (norm.startsWith('Rw') || norm.startsWith('r')) {
            condition = (p) => (isEven ? p.x >= -eps : p.x >= half - 1 - eps);
          } else if (norm.startsWith('2R') || norm.startsWith('2Rw')) {
            condition = (p) =>
              isEven
                ? p.x >= 0 && p.x < half - eps
                : Math.abs(p.x - (half - 1)) <= eps;
          } else {
            condition = (p) => p.x >= half - eps;
          }
        } else if (
          norm.startsWith('L') ||
          norm.startsWith('2L') ||
          norm.startsWith('l')
        ) {
          axis.set(1, 0, 0);
          baseAngle = Math.PI / 2;
          if (norm.startsWith('Lw') || norm.startsWith('l')) {
            condition = (p) => (isEven ? p.x <= eps : p.x <= -half + 1 + eps);
          } else if (norm.startsWith('2L') || norm.startsWith('2Lw')) {
            condition = (p) =>
              isEven
                ? p.x <= 0 && p.x > -half + eps
                : Math.abs(p.x - (-half + 1)) <= eps;
          } else {
            condition = (p) => p.x <= -half + eps;
          }
        } else if (
          norm.startsWith('U') ||
          norm.startsWith('2U') ||
          norm.startsWith('u')
        ) {
          axis.set(0, 1, 0);
          baseAngle = -Math.PI / 2;
          if (norm.startsWith('Uw') || norm.startsWith('u')) {
            condition = (p) => (isEven ? p.y >= -eps : p.y >= half - 1 - eps);
          } else if (norm.startsWith('2U') || norm.startsWith('2Uw')) {
            condition = (p) =>
              isEven
                ? p.y >= 0 && p.y < half - eps
                : Math.abs(p.y - (half - 1)) <= eps;
          } else {
            condition = (p) => p.y >= half - eps;
          }
        } else if (
          norm.startsWith('D') ||
          norm.startsWith('2D') ||
          norm.startsWith('d')
        ) {
          axis.set(0, 1, 0);
          baseAngle = Math.PI / 2;
          if (norm.startsWith('Dw') || norm.startsWith('d')) {
            condition = (p) => (isEven ? p.y <= eps : p.y <= -half + 1 + eps);
          } else if (norm.startsWith('2D') || norm.startsWith('2Dw')) {
            condition = (p) =>
              isEven
                ? p.y <= 0 && p.y > -half + eps
                : Math.abs(p.y - (-half + 1)) <= eps;
          } else {
            condition = (p) => p.y <= -half + eps;
          }
        } else if (
          norm.startsWith('F') ||
          norm.startsWith('2F') ||
          norm.startsWith('f')
        ) {
          axis.set(0, 0, 1);
          baseAngle = -Math.PI / 2;
          if (norm.startsWith('Fw') || norm.startsWith('f')) {
            condition = (p) => (isEven ? p.z >= -eps : p.z >= half - 1 - eps);
          } else if (norm.startsWith('2F') || norm.startsWith('2Fw')) {
            condition = (p) =>
              isEven
                ? p.z >= 0 && p.z < half - eps
                : Math.abs(p.z - (half - 1)) <= eps;
          } else {
            condition = (p) => p.z >= half - eps;
          }
        } else if (
          norm.startsWith('B') ||
          norm.startsWith('2B') ||
          norm.startsWith('b')
        ) {
          axis.set(0, 0, 1);
          baseAngle = Math.PI / 2;
          if (norm.startsWith('Bw') || norm.startsWith('b')) {
            condition = (p) => (isEven ? p.z <= eps : p.z <= -half + 1 + eps);
          } else if (norm.startsWith('2B') || norm.startsWith('2Bw')) {
            condition = (p) =>
              isEven
                ? p.z <= 0 && p.z > -half + eps
                : Math.abs(p.z - (-half + 1)) <= eps;
          } else {
            condition = (p) => p.z <= -half + eps;
          }
        } else if (norm.startsWith('M')) {
          axis.set(1, 0, 0);
          baseAngle = Math.PI / 2;
          condition = (p) => Math.abs(p.x) <= eps;
        } else if (norm.startsWith('x')) {
          axis.set(1, 0, 0);
          baseAngle = -Math.PI / 2;
          condition = () => true;
        } else if (norm.startsWith('y')) {
          axis.set(0, 1, 0);
          baseAngle = -Math.PI / 2;
          condition = () => true;
        } else if (norm.startsWith('z')) {
          axis.set(0, 0, 1);
          baseAngle = -Math.PI / 2;
          condition = () => true;
        }

        let totalAngle = baseAngle;
        if (isPrime) totalAngle = -baseAngle;
        if (isDouble) totalAngle = baseAngle * 2;
        if (reverse) totalAngle = -totalAngle;

        const cubiesToRotate: {
          cubie: THREE.Mesh;
          startPos: THREE.Vector3;
          startQuat: THREE.Quaternion;
          endPos: THREE.Vector3;
          endQuat: THREE.Quaternion;
        }[] = [];

        const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, totalAngle);

        cubiesRef.current.forEach((cubie) => {
          if (condition(cubie.position)) {
            const startPos = cubie.position.clone();
            const startQuat = cubie.quaternion.clone();

            const endPos = startPos.clone().applyAxisAngle(axis, totalAngle);
            endPos.x = snapCoordinate(endPos.x);
            endPos.y = snapCoordinate(endPos.y);
            endPos.z = snapCoordinate(endPos.z);

            const rawEndQuat = deltaQuat.clone().multiply(startQuat).normalize();
            const endQuat = snapQuaternion(rawEndQuat);

            cubiesToRotate.push({
              cubie,
              startPos,
              startQuat,
              endPos,
              endQuat,
            });
          }
        });

        const duration = Math.max(120, 290 / playSpeedRef.current);
        const startTime = performance.now();

        const animateMove = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const curAngle = totalAngle * ease;
          const curDeltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, curAngle);

          cubiesToRotate.forEach(({ cubie, startPos, startQuat }) => {
            cubie.position.copy(startPos).applyAxisAngle(axis, curAngle);
            cubie.quaternion.copy(curDeltaQuat).multiply(startQuat);
          });

          if (progress < 1) {
            activeMoveAnimRef.current = requestAnimationFrame(animateMove);
          } else {
            // Strictly snap every single cubie to exact orthogonal coordinates & orientation
            cubiesToRotate.forEach(({ cubie, endPos, endQuat }) => {
              cubie.position.copy(endPos);
              cubie.position.x = snapCoordinate(endPos.x);
              cubie.position.y = snapCoordinate(endPos.y);
              cubie.position.z = snapCoordinate(endPos.z);
              cubie.quaternion.copy(endQuat);
              cubie.updateMatrix();
            });

            activeMoveAnimRef.current = null;
            haptics.trigger('snap');
            resolve();
          }
        };

        activeMoveAnimRef.current = requestAnimationFrame(animateMove);
      });
    },
    [N, isEven, snapCoordinate]
  );

  // Atomic single step execution with mutex lock
  const executeStepAtIndex = useCallback(
    async (targetIdx: number, expectedRunId?: number): Promise<boolean> => {
      if (isBusyRef.current || !algorithmRef.current) return false;
      if (expectedRunId !== undefined && playbackRunIdRef.current !== expectedRunId) return false;

      isBusyRef.current = true;
      setIsRotating(true);

      try {
        const moveStr = algorithmRef.current.moves[targetIdx];
        const stepInfo = algorithmRef.current.moveSteps[targetIdx];

        if (voiceEnabledRef.current && stepInfo) {
          voiceCoach.speakCallout(moveStr);
        }

        await executeMove(moveStr);

        if (expectedRunId !== undefined && playbackRunIdRef.current !== expectedRunId) {
          return false;
        }

        currentStepRef.current = targetIdx;
        setCurrentStepIndex(targetIdx);
        onMoveChangeRef.current?.(targetIdx);

        if (targetIdx === algorithmRef.current.moves.length - 1) {
          haptics.trigger('success');
          setTimeout(() => {
            if (mountedRef.current) {
              onAlgorithmCompleteRef.current?.();
            }
          }, 450);
        }
        return true;
      } catch (err) {
        console.error('Error executing step:', err);
        return false;
      } finally {
        isBusyRef.current = false;
        setIsRotating(false);
      }
    },
    [executeMove]
  );

  const stopAutoPlay = useCallback(() => {
    playbackRunIdRef.current++;
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const startAutoPlay = useCallback(async () => {
    const currentRunId = ++playbackRunIdRef.current;
    isPlayingRef.current = true;
    setIsPlaying(true);

    while (
      isPlayingRef.current &&
      playbackRunIdRef.current === currentRunId &&
      mountedRef.current
    ) {
      const totalMoves = algorithmRef.current?.moves.length || 0;
      if (currentStepRef.current >= totalMoves - 1) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        break;
      }

      const nextIdx = currentStepRef.current + 1;
      const ok = await executeStepAtIndex(nextIdx, currentRunId);
      if (!ok || !isPlayingRef.current || playbackRunIdRef.current !== currentRunId) {
        break;
      }

      const pauseMs = Math.max(360, Math.round(680 / playSpeedRef.current));
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }, [executeStepAtIndex]);

  const resetToStart = useCallback(() => {
    stopAutoPlay();
    currentStepRef.current = -1;
    setCurrentStepIndex(-1);
    onMoveChangeRef.current?.(-1);
    buildCube();
    haptics.trigger('reset');
  }, [stopAutoPlay, buildCube]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      if (currentStepRef.current >= (algorithmRef.current?.moves.length || 0) - 1) {
        resetToStart();
        setTimeout(() => {
          startAutoPlay();
        }, 100);
      } else {
        startAutoPlay();
      }
    }
  }, [isPlaying, stopAutoPlay, resetToStart, startAutoPlay]);

  const stepForward = useCallback(async () => {
    stopAutoPlay();
    if (isBusyRef.current || !algorithmRef.current) return;
    const nextIdx = currentStepRef.current + 1;
    if (nextIdx >= algorithmRef.current.moves.length) return;
    await executeStepAtIndex(nextIdx);
  }, [stopAutoPlay, executeStepAtIndex]);

  const stepBackward = useCallback(async () => {
    stopAutoPlay();
    if (isBusyRef.current || !algorithmRef.current) return;
    const currIdx = currentStepRef.current;
    if (currIdx < 0) return;

    isBusyRef.current = true;
    setIsRotating(true);
    try {
      const moveStr = algorithmRef.current.moves[currIdx];
      await executeMove(moveStr, true);
      const prevIdx = currIdx - 1;
      currentStepRef.current = prevIdx;
      setCurrentStepIndex(prevIdx);
      onMoveChangeRef.current?.(prevIdx);
    } finally {
      isBusyRef.current = false;
      setIsRotating(false);
    }
  }, [stopAutoPlay, executeMove]);

  const handleScrubTo = useCallback(
    async (targetIdx: number) => {
      stopAutoPlay();
      if (isBusyRef.current || !algorithmRef.current) return;
      if (targetIdx === currentStepRef.current) return;

      isBusyRef.current = true;
      setIsRotating(true);
      try {
        if (targetIdx > currentStepRef.current) {
          for (let i = currentStepRef.current + 1; i <= targetIdx; i++) {
            await executeMove(algorithmRef.current.moves[i]);
          }
        } else {
          for (let i = currentStepRef.current; i > targetIdx; i--) {
            await executeMove(algorithmRef.current.moves[i], true);
          }
        }
        currentStepRef.current = targetIdx;
        setCurrentStepIndex(targetIdx);
        onMoveChangeRef.current?.(targetIdx);
      } finally {
        isBusyRef.current = false;
        setIsRotating(false);
      }
    },
    [stopAutoPlay, executeMove]
  );

  const scrambleCube = async () => {
    stopAutoPlay();
    if (isBusyRef.current) return;
    resetToStart();

    const notationPool =
      cubeType === '5x5'
        ? ['R', "R'", 'U', "U'", 'F', 'L', 'B', 'D', 'Rw', "Rw'", 'Uw', "Uw'", '2R', '2R2']
        : cubeType === '4x4'
        ? ['R', "R'", 'U', "U'", 'F', 'L', 'B', 'D', 'Rw', "Rw'", 'Uw', "Uw'", '2R', '2R2']
        : ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'L', "L'", 'D', "D'", 'B'];

    const scrambleLength = cubeType === '5x5' ? 16 : cubeType === '4x4' ? 14 : 12;
    for (let i = 0; i < scrambleLength; i++) {
      const randMove = notationPool[Math.floor(Math.random() * notationPool.length)];
      await executeMove(randMove);
    }
    haptics.trigger('snap');
  };

  useEffect(() => {
    mountedRef.current = true;
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0e16);

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.25);
    rimLight.position.set(-14, 10, -12);
    scene.add(rimLight);

    const bottomFillLight = new THREE.DirectionalLight(0xfef08a, 0.45);
    bottomFillLight.position.set(0, -12, 4);
    scene.add(bottomFillLight);

    const shadowGeo = new THREE.CircleGeometry(N * 1.5, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -(N * 0.5 + 0.6);
    scene.add(shadowMesh);

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    buildCube();

    const renderScene = () => {
      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(renderScene);
    };
    renderScene();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;
      const aspect = width / height;
      cameraRef.current.aspect = aspect;

      // Adaptive FOV for mobile & tablet screens: never clip or distort cubies
      if (aspect < 1) {
        cameraRef.current.fov = 40 + (1 - aspect) * 20;
      } else {
        cameraRef.current.fov = 40;
      }
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      mountedRef.current = false;
      stopAutoPlay();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (activeMoveAnimRef.current) cancelAnimationFrame(activeMoveAnimRef.current);
      renderer.dispose();
    };
  }, [buildCube, updateCameraPosition, N, stopAutoPlay]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    const speed = 0.007;
    cameraSpherical.current.theta -= deltaX * speed;
    cameraSpherical.current.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, cameraSpherical.current.phi - deltaY * speed)
    );
    updateCameraPosition();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-full flex flex-col select-none rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0e16] shadow-2xl">
      <div
        ref={mountRef}
        className="w-full flex-1 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900/90 text-white border border-slate-700/80 rounded-lg backdrop-blur-md shadow-md">
            {cubeType} Interactive Stage
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              voiceCoach.setEnabled(next);
              haptics.trigger('tick');
            }}
            title={voiceEnabled ? 'British Female Voice Active' : 'Voice Coach Muted'}
            className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              voiceEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                : 'bg-slate-900/80 text-slate-400 border border-slate-700/60 hover:text-white'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline font-medium">UK Voice</span>
          </button>

          <button
            onClick={resetCameraView}
            title="Reset Camera Angle"
            className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-400 bg-slate-900/80 border border-slate-700/60 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            onClick={scrambleCube}
            title="Scramble Cube"
            className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-400 bg-slate-900/80 border border-slate-700/60 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Animation Control Bar */}
      {algorithm && algorithm.moves.length > 0 && (
        <div className="px-3 sm:px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md">
          {/* Scrollable Move Sequence Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-2 px-1 scrollbar-none">
            {algorithm.moves.map((move, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              return (
                <button
                  key={`${move}-${idx}`}
                  onClick={() => handleScrubTo(idx)}
                  className={`min-h-[38px] min-w-[44px] px-3 py-1.5 text-xs font-mono font-bold rounded-lg shrink-0 transition-all flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-[1.03] ring-2 ring-blue-400/60'
                      : isPast
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                      : 'bg-slate-900/90 text-slate-400 border-slate-700/80 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {move}
                </button>
              );
            })}
          </div>

          {/* Scrubber & Playback Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-mono text-slate-300 font-semibold">
                Move {Math.max(0, currentStepIndex + 1)} / {algorithm.moves.length}
              </span>
              {currentStepIndex >= 0 && (
                <span className="text-emerald-400 font-medium truncate max-w-[200px] sm:max-w-none">
                  {algorithm.moveSteps[currentStepIndex]?.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Speed Switcher */}
              <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs">
                {[0.75, 1, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaySpeed(spd);
                      haptics.trigger('tick');
                    }}
                    className={`px-2 py-1 rounded-md transition-colors font-mono ${
                      playSpeed === spd
                        ? 'bg-slate-800 text-white font-semibold border border-slate-600/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={stepBackward}
                disabled={currentStepIndex < 0 || isRotating}
                className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center border border-slate-700/80"
                title="Step Backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="min-h-[36px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 border border-blue-400/80 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={stepForward}
                disabled={currentStepIndex >= algorithm.moves.length - 1 || isRotating}
                className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center border border-slate-700/80"
                title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={resetToStart}
                className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center border border-slate-700/80"
                title="Reset to Start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

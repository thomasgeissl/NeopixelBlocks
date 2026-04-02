import * as React from "react";
import { Suspense, useEffect, useId, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconButton, Tooltip } from "@mui/material";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import type { Group } from "three";

const SUPPORTED_EXT = new Set(["stl", "obj", "gltf", "glb"]);

function extFromFilename(name: string): string {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : "";
}

function StlModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#b8bcc4"
        metalness={0.12}
        roughness={0.42}
      />
    </mesh>
  );
}

function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url) as Group;
  return <primitive object={obj} />;
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function LoadedModel({ url, ext }: { url: string; ext: string }) {
  switch (ext) {
    case "stl":
      return <StlModel url={url} />;
    case "obj":
      return <ObjModel url={url} />;
    case "gltf":
    case "glb":
      return <GltfModel url={url} />;
    default:
      return null;
  }
}

function SceneContent({
  url,
  ext,
  orbitControlsRef,
}: {
  url: string;
  ext: string;
  orbitControlsRef: React.RefObject<any>;
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} />
      <directionalLight position={[-4, -2, -6]} intensity={0.35} />
      <Suspense fallback={null}>
        <Center>
          <LoadedModel url={url} ext={ext} />
        </Center>
      </Suspense>
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export type ModelViewer3DProps = {
  /** CSS height of the viewer (default 420px). */
  height?: number | string;
  /** Optional class name for the outer container. */
  className?: string;
};

/**
 * Drag-and-drop 3D viewer for STL, OBJ, GLTF, and GLB (React Three Fiber + drei).
 */
const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  height = 420,
  className,
}) => {
  const inputId = useId();
  const [model, setModel] = useState<{
    url: string;
    ext: string;
    name: string;
  } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const orbitControlsRef = React.useRef<any>(null);

  useEffect(() => {
    return () => {
      if (!model) return;
      if (model.ext === "gltf" || model.ext === "glb") {
        useGLTF.clear(model.url);
      }
      URL.revokeObjectURL(model.url);
    };
  }, [model]);

  const jumpCameraTo = (view: "top" | "bottom" | "left" | "right" | "front" | "back") => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    const camera = controls.object;
    if (!camera) return;

    // OrbitControls target is our "look at" point. We keep it fixed at the model center.
    controls.target.set(0, 0, 0);

    const d = camera.position.distanceTo(controls.target);
    const distance = Number.isFinite(d) && d > 0 ? d : 6.5;

    switch (view) {
      case "top":
        camera.position.set(0, distance, 0);
        break;
      case "bottom":
        camera.position.set(0, -distance, 0);
        break;
      case "left":
        camera.position.set(-distance, 0, 0);
        break;
      case "right":
        camera.position.set(distance, 0, 0);
        break;
      case "front":
        camera.position.set(0, 0, distance);
        break;
      case "back":
        camera.position.set(0, 0, -distance);
        break;
    }

    controls.update();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const loadFile = (file: File) => {
    const ext = extFromFilename(file.name);
    if (!SUPPORTED_EXT.has(ext)) {
      setHint(
        `Unsupported format “.${ext || "?" }”. Use .stl, .obj, .gltf, or .glb.`,
      );
      return;
    }
    setHint(null);
    const url = URL.createObjectURL(file);
    setModel((prev) => {
      if (prev) {
        if (prev.ext === "gltf" || prev.ext === "glb") {
          useGLTF.clear(prev.url);
        }
        URL.revokeObjectURL(prev.url);
      }
      return { url, ext, name: file.name };
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) loadFile(file);
  };

  return (
    <Box
      className={className}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 1,
        overflow: "hidden",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "action.hover",
      }}
    >
      {model && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 3,
            display: "grid",
            gridTemplateColumns: "repeat(3, 34px)",
            gap: 0.5,
            p: 0.5,
            borderRadius: 1,
            bgcolor: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Tooltip title="Top">
            <IconButton size="small" onClick={() => jumpCameraTo("top")}>
              <NorthIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Front">
            <IconButton size="small" onClick={() => jumpCameraTo("front")}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Right">
            <IconButton size="small" onClick={() => jumpCameraTo("right")}>
              <EastIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Left">
            <IconButton size="small" onClick={() => jumpCameraTo("left")}>
              <WestIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bottom">
            <IconButton size="small" onClick={() => jumpCameraTo("bottom")}>
              <SouthIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Back">
            <IconButton size="small" onClick={() => jumpCameraTo("back")}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {!model && (
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 2,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Drop a 3D file here, or click to choose
          </Typography>
          <Typography variant="caption" color="text.disabled">
            .stl · .obj · .gltf · .glb
          </Typography>
          <Box
            id={inputId}
            component="input"
            type="file"
            accept=".stl,.obj,.gltf,.glb"
            onChange={onFileInput}
            sx={{ display: "none" }}
          />
        </Box>
      )}

      {hint && (
        <Typography
          variant="caption"
          color="error"
          sx={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            zIndex: 2,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {hint}
        </Typography>
      )}

      {model && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            pointerEvents: "none",
            maxWidth: "85%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {model.name}
        </Typography>
      )}

      <Canvas
        camera={{ position: [4, 3, 4], fov: 45, near: 0.01, far: 2000 }}
        gl={{ antialias: true, alpha: true }}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      >
        {model ? (
          <SceneContent
            url={model.url}
            ext={model.ext}
            orbitControlsRef={orbitControlsRef}
          />
        ) : (
          <ambientLight intensity={1} />
        )}
      </Canvas>
    </Box>
  );
};

export default ModelViewer3D;

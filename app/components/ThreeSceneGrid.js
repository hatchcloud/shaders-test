'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSceneGrid = ({ imageUrl }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;

    // Scene creation
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    // Renderer setup
    const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    webGLRenderer.setSize(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight
    );
    containerRef.current.appendChild(webGLRenderer.domElement);

    rendererRef.current = webGLRenderer;

    // Load texture asynchronously and start rendering after it's loaded
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        // Shader uniforms
        const shaderUniforms = {
          u_texture: { value: texture },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_aberrationIntensity: { value: 0.5 }, // You can adjust this value
        };

        // Vertex shader
        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        // Fragment shader based on your provided code
        const fragmentShader = `
          varying vec2 vUv;
          uniform sampler2D u_texture;    
          uniform vec2 u_mouse;
          uniform vec2 u_prevMouse;
          uniform float u_aberrationIntensity;

          void main() {
              vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
              vec2 centerOfPixel = gridUV + vec2(1.0/20.0, 1.0/20.0);
              
              vec2 mouseDirection = u_mouse - u_prevMouse;
              
              vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
              float pixelDistanceToMouse = length(pixelToMouseDirection);
              float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);
       
              vec2 uvOffset = strength * -mouseDirection * 0.2;
              vec2 uv = vUv - uvOffset;

              vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
              vec4 colorG = texture2D(u_texture, uv);
              vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

              gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
          }
        `;

        // Create a plane mesh with shader material
        const planeMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.ShaderMaterial({
            uniforms: shaderUniforms,
            vertexShader,
            fragmentShader,
          })
        );

        // Add mesh to scene
        scene.add(planeMesh);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          webGLRenderer.render(scene, camera);
        };

        animate();

        // Event listeners for mouse interaction
        const handleMouseMove = (event) => {
          const rect = containerRef.current.getBoundingClientRect();
          shaderUniforms.u_prevMouse.value.copy(shaderUniforms.u_mouse.value);
          shaderUniforms.u_mouse.value.set(
            (event.clientX - rect.left) / rect.width,
            1.0 - (event.clientY - rect.top) / rect.height
          );
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);

        // Cleanup on component unmount
        return () => {
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
          webGLRenderer.dispose();
          rendererRef.current = null;
        };
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
  }, [imageUrl]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeSceneGrid;
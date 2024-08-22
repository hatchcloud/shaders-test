'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ThreeImageEffect = ({ imageUrl }) => {
  const containerRef = useRef(null);
  const [renderer, setRenderer] = useState(null);

  useEffect(() => {
    if (!containerRef.current || renderer) return;

    // Scene creation
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      80,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.01,
      10
    );
    camera.position.z = 1;

    // Renderer setup
    const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    webGLRenderer.setSize(
      containerRef.current.offsetWidth,
      containerRef.current.offsetHeight
    );
    containerRef.current.appendChild(webGLRenderer.domElement);

    setRenderer(webGLRenderer);

    // Load texture asynchronously and start rendering after it's loaded
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        // Shader uniforms
        const shaderUniforms = {
          u_texture: { value: texture },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_time: { value: 0.0 },
          distortionEnabled: { value: 0.0 },  // New uniform to control distortion
        };

        // Vertex shader
        const vertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        // Fragment shader
        const fragmentShader = `
          uniform sampler2D u_texture;
          uniform vec2 u_mouse;
          uniform float u_time;
          uniform float distortionEnabled;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;

            // If distortion is enabled, apply the wave effect
            if (distortionEnabled > 0.5) {
              float distanceFromMouse = distance(uv, u_mouse);

              // Wave effect
              uv.y += sin(uv.x * 10.0 + u_time * 2.0) * 0.05;
              uv.x += cos(uv.y * 10.0 + u_time * 2.0) * 0.05;

              // Ripple effect from the mouse
              uv += vec2(sin(distanceFromMouse * 10.0 - u_time * 5.0) * 0.02, cos(distanceFromMouse * 10.0 - u_time * 5.0) * 0.02);
            }

            // Fetch the texture color
            vec4 color = texture2D(u_texture, uv);
            gl_FragColor = color;
          }
        `;

        // Create plane mesh with shader material
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
        const clock = new THREE.Clock();
        const animate = () => {
          shaderUniforms.u_time.value += clock.getDelta();
          requestAnimationFrame(animate);
          webGLRenderer.render(scene, camera);
        };

        animate();

        // Event listeners for mouse interaction
        const handleMouseEnter = () => {
          shaderUniforms.distortionEnabled.value = 1.0;  // Enable distortion on mouse enter
        };

        const handleMouseLeave = () => {
          shaderUniforms.distortionEnabled.value = 0.0;  // Disable distortion on mouse leave
        };

        const handleMouseMove = (event) => {
          const rect = containerRef.current.getBoundingClientRect();
          shaderUniforms.u_mouse.value.set(
            (event.clientX - rect.left) / rect.width,
            1.0 - (event.clientY - rect.top) / rect.height
          );
        };

        containerRef.current.addEventListener('mouseenter', handleMouseEnter);
        containerRef.current.addEventListener('mouseleave', handleMouseLeave);
        containerRef.current.addEventListener('mousemove', handleMouseMove);

        // Cleanup event listeners and renderer on component unmount
        return () => {
          containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
          containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
          containerRef.current.removeEventListener('mousemove', handleMouseMove);
          webGLRenderer.dispose();
        };
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
  }, [renderer, imageUrl]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeImageEffect;

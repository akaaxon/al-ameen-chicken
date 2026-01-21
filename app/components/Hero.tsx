"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, ContactShadows, Center, useProgress } from "@react-three/drei";
import gsap from "gsap";

// 1. Loader (Unchanged)
function OverlayLoader({ visible }: { visible: boolean }) {
  const { progress } = useProgress();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!visible && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (overlayRef.current) (overlayRef.current as HTMLElement).style.display = "none";
        },
      });
    }
  }, [visible]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black transition-opacity"
    >
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 border-4 border-[#ff4400]/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-[#ff4400] rounded-full animate-spin"></div>
      </div>
      <p className="text-white font-black text-2xl font-brand">{Math.round(progress)}%</p>
    </div>
  );
}

// 2. Chicken Model
function ChickenGrill({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF("/models/chicken-compressed.glb");

  useFrame((state) => {
    if (scene) {
      scene.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return <primitive object={scene} scale={isMobile ? 0.6 : 1} />;
}

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  // NEW: State to track if the Hero section is visible
  const [isInView, setIsInView] = useState(true); 
  
  const { progress, active } = useProgress();
  const containerRef = useRef<HTMLElement>(null); // Typed explicitly
  const leftTextRef = useRef<HTMLDivElement>(null);
  const sloganWordsRef = useRef<HTMLSpanElement[]>([]);
  const hasAnimated = useRef(false);

  // Monitor loading progress
  useEffect(() => {
    if (progress === 100 && !active && !modelReady) {
      const timer = setTimeout(() => setModelReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, active, modelReady]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // NEW: Intersection Observer to pause rendering when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set state based on whether the Hero is intersecting with viewport
        setIsInView(entry.isIntersecting);
      },
      { 
        root: null, // viewport
        threshold: 0 // trigger as soon as even 1 pixel is visible (or not)
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Text Entrance Animation (Unchanged)
  useEffect(() => {
    if (!modelReady) return;

    let ctx = gsap.context(() => {
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        const tl = gsap.timeline({ delay: 0.5 });

        tl.fromTo(leftTextRef.current,
          { opacity: 0, x: isMobile ? 0 : -50, filter: "blur(20px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out" }
        );

        tl.fromTo(sloganWordsRef.current,
          { opacity: 0, y: 40, filter: "blur(10px) brightness(3)", skewX: -20 },
          { opacity: 1, y: 0, filter: "blur(0px) brightness(1)", skewX: 0, duration: 1, stagger: 0.1, ease: "back.out(1.7)" },
          "-=0.8"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [modelReady, isMobile]);

  const renderSlogan = (text: string, colorClass = "") => {
    return text.split(" ").map((word, i) => (
      <span
        key={i}
        ref={(el) => { if (el && !sloganWordsRef.current.includes(el)) sloganWordsRef.current.push(el); }}
        className={`inline-block mx-2 opacity-0 ${colorClass}`}
      >
        {word}
      </span>
    ));
  };

  sloganWordsRef.current = [];
  const pos: [number, number, number] = [5, 1.18, 18.66];

  return (
    <main ref={containerRef} className="relative h-screen w-screen bg-black overflow-hidden font-brand text-white">
      
      <OverlayLoader visible={!modelReady} />

      {/* Main UI Layer */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between pt-20 h-full w-full px-[6%] py-8 md:py-0 pointer-events-none">
        
        <div 
          ref={leftTextRef} 
          className="opacity-0 text-center md:text-right"
          style={{ visibility: modelReady ? 'visible' : 'hidden' }}
        >
          <h1 dir="rtl" className="font-black leading-tight text-[18vw] md:text-[15vw]">
            فروج <br className="hidden md:block"/>
            <span className="text-[#ff4400]">الأمين</span>
          </h1>
        </div>

        <div 
          className="text-center md:text-left pb-[14vh] md:pb-0"
          style={{ visibility: modelReady ? 'visible' : 'hidden' }}
        >
          <h1 dir="rtl" className="font-black leading-none text-[10vw] md:text-[6.5vw] flex flex-col items-center md:items-start">
            <div className="flex flex-row-reverse">{renderSlogan("ما كيف")}</div>
            <div className="flex flex-row-reverse mt-2">{renderSlogan("أمين برمتو", "text-[#ffaa00]")}</div>
          </h1>
        </div>
      </div>

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        {/* UPDATED: frameloop prop controls the rendering.
            'always' = 60fps
            'never' = 0fps (pauses completely)
        */}
        <Canvas 
          frameloop={isInView ? "always" : "never"} 
          dpr={[1,1.5 ]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          shadows 
          camera={{ position: pos, fov: 35 }}
        >
            <Stage environment="city" intensity={1.5} adjustCamera={false}>
              <Center top>
                <ChickenGrill isMobile={isMobile} />
              </Center>
            </Stage>
        </Canvas>
      </div>
    </main>
  );
}
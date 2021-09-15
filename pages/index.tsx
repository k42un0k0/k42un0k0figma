import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Rect } from "../lib/canvas/entity";
import { Scene } from "../lib/canvas/root";
import styles from "../styles/Home.module.css";

export default function Home() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (typeof window == "undefined") return;
    if (ref.current == null) return;
    const scene = new Scene(ref.current);
    scene.append(new Rect(scene, 0, 0, 100, 100, 20));
    scene.append(new Rect(scene, 100, 100, 100, 100, 0));
    scene.append(new Rect(scene, 200,200, 100, 100, 0));
    scene.draw();
  });
  return <canvas ref={ref}  width="500" height="500"/>;
}

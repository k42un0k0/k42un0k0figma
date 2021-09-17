import dynamic from "next/dynamic";

const Unko = dynamic(() => import("../components/index"));

export default function Home() {
  return <Unko />;
}

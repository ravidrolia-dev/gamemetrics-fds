import platformData from "@/src/data/generated/platform_evolution.json";
import { PlatformEvolutionData } from "@/src/types/data";
import GamingBehaviourClient from "./GamingBehaviourClient";

export default function GamingBehaviourPage() {
  return <GamingBehaviourClient data={platformData as PlatformEvolutionData} />;
}

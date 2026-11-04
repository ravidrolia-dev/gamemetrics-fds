import hypothesisData from "@/src/data/generated/hypothesis.json";
import { HypothesisData } from "@/src/types/data";
import HypothesisClient from "./HypothesisClient";

export default function HypothesisPage() {
  return <HypothesisClient data={hypothesisData as HypothesisData} />;
}

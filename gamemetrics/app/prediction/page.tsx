import predictionData from "@/src/data/generated/prediction.json";
import { PredictionData } from "@/src/types/data";
import PredictionClient from "./PredictionClient";

export default function PredictionPage() {
  return <PredictionClient data={predictionData as PredictionData} />;
}

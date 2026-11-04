import methodologyData from "@/src/data/generated/methodology.json";
import { MethodologyData } from "@/src/types/data";
import MethodologyClient from "./MethodologyClient";

export default function MethodologyPage() {
  return <MethodologyClient data={methodologyData as MethodologyData} />;
}

import overviewData from "@/src/data/generated/overview.json";
import { OverviewData } from "@/src/types/data";
import OverviewClient from "./OverviewClient";

const data = overviewData as OverviewData;

export default function OverviewPage() {
  return <OverviewClient data={data} />;
}

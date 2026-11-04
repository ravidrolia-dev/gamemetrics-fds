import segmentsData from "@/src/data/generated/segments.json";
import { SegmentData } from "@/src/types/data";
import SegmentsClient from "./SegmentsClient";

export default function SegmentsPage() {
  return <SegmentsClient data={segmentsData as SegmentData} />;
}

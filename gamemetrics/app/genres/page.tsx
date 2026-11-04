import genresData from "@/src/data/generated/genres.json";
import { GenreData } from "@/src/types/data";
import GenresClient from "./GenresClient";

export default function GenresPage() {
  return <GenresClient data={genresData as GenreData} />;
}

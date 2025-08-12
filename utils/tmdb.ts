import axios from "axios";
import { TMDB_API_KEY } from "..";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = TMDB_API_KEY || process.env.TMDB_API_KEY;

console.log(`TMDB UTILS: ${apiKey}`)

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: { api_key: apiKey },
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
});

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface TMDBEpisode {
  name: string;
  still_path: string | null;
  episode_number: number;
  air_date: string;
}

interface TMDBSeasonResponse {
  episodes: TMDBEpisode[];
}

interface TMDBMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  number_of_episodes?: number;
  genres: TMDBGenre[];
  status: string;
  videos: {
    results: TMDBVideo[];
  };
}

interface TMDBSearchResult {
  adult: false;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

function getImageUrl(
  path: string | null,
  size: "w500" | "original" = "w500"
): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export async function getMovieDetails(id: string) {
  const { data } = await tmdb.get<TMDBMovieResponse>(`/movie/${id}`, {
    params: { append_to_response: "videos" },
  });

  const trailer = data.videos.results.find((v) => v.type === "Trailer");

  return {
    id: data.id,
    title: data.title,
    description: data.overview,
    thumbnailUrl: getImageUrl(data.poster_path, "w500"),
    bannerImage: getImageUrl(data.backdrop_path, "original"),
    releaseDate: data.release_date,
    year: data.release_date?.slice(0, 4),
    rating: data.vote_average,
    episodes: data.number_of_episodes ?? null,
    genres: data.genres.map((g) => g.name),
    status: data.status,
    nextEpisodeDate: null,
    trailerUrl: trailer
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null,
  };
}

export async function searchMovie(
  query: string,
  page?: number
): Promise<TMDBSearchResult[]> {
  page = page || 1;
  const { data: searchResults } = await tmdb.get(
    `/search/movie?query=${query}&page=${page}`
  );

  return searchResults.results;
}

export async function getPopular(page?: number): Promise<TMDBSearchResult[]> {
  page = page || 1;
  const { data: popular } = await tmdb.get(
    `/movie/popular?page=${page}`
  );

  return popular.results;
}

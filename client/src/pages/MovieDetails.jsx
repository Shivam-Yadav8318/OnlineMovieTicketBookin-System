import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormet";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { axios, shows, favoriteMovies, toggleFavorite } = useAppContext();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const getShow = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
        });
      } else {
        setShow(null);
      }
    } catch (error) {
      console.log("Movie details error:", error);

      setShow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getShow();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  const movie = show.movie;

  const isFavorite = favoriteMovies.some((fav) => fav._id === movie._id);

  const recommendations = shows.filter((m) => m._id !== movie._id).slice(0, 4);

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      
      {/* Movie Details */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">

        <img
          src={movie.poster_path}
          alt={movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">

          <BlurCircle top="-100px" left="-100px" />

          <p className="text-primary">
            {movie.original_language || "ENGLISH"}
          </p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />

            {Number(movie.vote_average || 0).toFixed(1)}

            {" "}User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {movie.overview || "No description available."}
          </p>

          <p>
            {movie.runtime
              ? (isNaN(Number(movie.runtime)) ? movie.runtime : timeFormat(Number(movie.runtime)))
              : "Runtime unavailable"}

            {" . "}

            {movie.genres?.length
              ? movie.genres.map((g) => (typeof g === "string" ? g : g.name)).join(", ")
              : "Genre unavailable"}

            {" . "}

            {movie.release_date || "Release date unavailable"}
          </p>

          <div className="flex items-center flex-wrap gap-4 mt-4">

            <button
              className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            <a
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
              href="#dateSelect"
            >
              Buy Ticket
            </a>

            <button
              onClick={() => toggleFavorite(movie._id)}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart className={`w-5 h-6 ${isFavorite ? "fill-primary text-primary" : ""}`} />
            </button>

          </div>
        </div>
      </div>

      {/* Cast */}
      <p className="text-lg font-medium mt-20">
        Your Favorite Cast
      </p>

      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">

          {movie.casts?.slice(0, 12).map((cast, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >

              <img
                src={
                  typeof cast === "string"
                    ? ""
                    : cast.profile_path || ""
                }
                alt={typeof cast === "string" ? cast : cast.name}
                className="rounded-full h-20 md:h-20 aspect-square object-cover bg-gray-800"
              />

              <p className="font-medium text-xs mt-3">
                {typeof cast === "string" ? cast : cast.name}
              </p>

            </div>
          ))}

        </div>
      </div>

      {/* Date Select */}
      <div id="dateSelect">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <>
          <p className="text-lg font-medium mt-20 mb-8">
            You May Also Like
          </p>

          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {recommendations.map((rec) => (
              <MovieCard movie={rec} key={rec._id} />
            ))}
          </div>
        </>
      )}

      {/* Show More */}
      <div className="flex justify-center mt-20">
        <button
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
        >
          Show More
        </button>
      </div>

    </div>
  );
};

export default MovieDetails;

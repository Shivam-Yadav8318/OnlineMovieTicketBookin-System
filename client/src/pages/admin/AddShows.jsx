import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import { useAppContext } from "../../context/AppContext";

const AddShows = () => {
  const { axios, currency, fetchShows } = useAppContext();

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null);

  const [dateTimeSelection, setDateTimeSelection] = useState({});

  const [dateTimeInput, setDateTimeInput] = useState("");

  const [showPrice, setShowPrice] = useState("");

  // Search input
  const [search, setSearch] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [addingShow, setAddingShow] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ----------------------------------------
  // Search movies from backend
  // ----------------------------------------
  const fetchMovies = async () => {
    if (!search.trim()) {
      setError("Please enter a movie name");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.get(
        "/api/show/search",
        {
          params: {
            query: search,
          },
        }
      );

      setNowPlayingMovies(response.data.movies || []);

    } catch (error) {
      console.log("SEARCH ERROR:", error);

      setNowPlayingMovies([]);

      setError(
        error.response?.data?.message ||
          "Failed to search movies"
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // Select movie
  // ----------------------------------------
  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);

    setError("");
    setSuccess("");

    console.log("Selected Movie:", movie);
  };

  // ----------------------------------------
  // Add date and time
  // ----------------------------------------
  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      setError("Please select date and time");
      return;
    }

    const [date, time] = dateTimeInput.split("T");

    if (!date || !time) {
      return;
    }

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];

      if (!times.includes(time)) {
        return {
          ...prev,
          [date]: [...times, time],
        };
      }

      return prev;
    });

    setDateTimeInput("");
    setError("");
  };

  // ----------------------------------------
  // Remove selected time
  // ----------------------------------------
  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter(
        (t) => t !== time
      );

      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;

        return rest;
      }

      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  // ----------------------------------------
  // Add Show
  // ----------------------------------------
  const handleAddShow = async () => {
    setError("");
    setSuccess("");

    // Check movie
    if (!selectedMovie) {
      setError("Please select a movie");
      return;
    }

    // Check price
    if (!showPrice || Number(showPrice) <= 0) {
      setError("Please enter a valid show price");
      return;
    }

    // Check date/time
    if (Object.keys(dateTimeSelection).length === 0) {
      setError("Please add at least one date and time");
      return;
    }

    try {
      setAddingShow(true);

      // Convert:
      // {
      //   "2026-09-10": ["10:00", "14:00"],
      //   "2026-09-11": ["11:00"]
      // }
      //
      // into:
      //
      // [
      //   {
      //     date: "2026-09-10",
      //     time: ["10:00", "14:00"]
      //   },
      //   {
      //     date: "2026-09-11",
      //     time: ["11:00"]
      //   }
      // ]

      const showsInput = Object.entries(
        dateTimeSelection
      ).map(([date, times]) => ({
        date,
        time: times,
      }));

      const data = {
        // IMPORTANT:
        // OMDb gives imdbID
        movieId: selectedMovie.imdbID,

        showsInput,

        showPrice: Number(showPrice),
      };

      console.log("DATA SENT TO BACKEND:", data);

      const response = await axios.post(
        "/api/show/add",
        data
      );

      console.log(
        "ADD SHOW RESPONSE:",
        response.data
      );

      setSuccess(
        response.data.message ||
          "Movie and shows added successfully"
      );

      // Reset form
      setSelectedMovie(null);

      setShowPrice("");

      setDateTimeSelection({});

      setDateTimeInput("");

      setSearch("");

      setNowPlayingMovies([]);

      // Refresh the shared "now showing" list so the new movie appears
      // immediately across the site (Home, Movies, etc).
      fetchShows();

    } catch (error) {
      console.log("ADD SHOW ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add movie and shows"
      );
    } finally {
      setAddingShow(false);
    }
  };

  return (
    <div>
      <Title text1="Add" text2="Shows" />

      {/* -------------------------------- */}
      {/* Search Movie */}
      {/* -------------------------------- */}

      <div className="mt-8">

        <p className="text-lg font-medium mb-3">
          Search Movies
        </p>

        <div className="flex gap-3 max-w-xl">

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchMovies();
              }
            }}
            placeholder="Enter movie name..."
            className="flex-1 border border-gray-600 rounded-md px-4 py-2 outline-none"
          />

          <button
            onClick={fetchMovies}
            disabled={loading}
            className="bg-primary text-white px-5 py-2 rounded-md cursor-pointer disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>

        </div>

      </div>

      {/* -------------------------------- */}
      {/* Error */}
      {/* -------------------------------- */}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-md max-w-xl">
          {error}
        </div>
      )}

      {/* -------------------------------- */}
      {/* Success */}
      {/* -------------------------------- */}

      {success && (
        <div className="mt-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-md max-w-xl">
          {success}
        </div>
      )}

      {/* -------------------------------- */}
      {/* Movies */}
      {/* -------------------------------- */}

      {loading ? (
        <div className="mt-8">
          <Loading />
        </div>
      ) : nowPlayingMovies.length > 0 ? (
        <>
          <p className="mt-10 text-lg font-medium">
            Search Results
          </p>

          <div className="overflow-x-auto pb-4">

            <div className="flex flex-wrap gap-4 mt-4">

              {nowPlayingMovies.map((movie) => (

                <div
                  key={movie.imdbID}
                  className={`relative max-w-40 cursor-pointer hover:translate-y-1 transition duration-300 ${
                    selectedMovie?.imdbID !== movie.imdbID
                      ? "opacity-70"
                      : ""
                  }`}
                  onClick={() =>
                    handleMovieSelect(movie)
                  }
                >

                  <div className="relative rounded-lg overflow-hidden">

                    {movie.Poster &&
                    movie.Poster !== "N/A" ? (
                      <img
                        src={movie.Poster}
                        alt={movie.Title}
                        className="w-full h-60 object-cover brightness-90"
                      />
                    ) : (
                      <div className="w-40 h-60 bg-gray-800 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">

                      <p className="flex items-center gap-1 text-gray-400">

                        <StarIcon
                          className="w-4 h-4 text-primary fill-primary"
                        />

                        <span>
                          {movie.Year}
                        </span>

                      </p>

                      <p className="text-gray-300">
                        Movie
                      </p>

                    </div>

                  </div>

                  {/* Selected */}
                  {selectedMovie?.imdbID ===
                    movie.imdbID && (
                    <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">

                      <CheckIcon
                        className="w-4 h-4 text-white"
                        strokeWidth={2.5}
                      />

                    </div>
                  )}

                  <p className="text-sm mt-2 line-clamp-2">
                    {movie.Title}
                  </p>

                </div>

              ))}

            </div>

          </div>
        </>
      ) : null}

      {/* -------------------------------- */}
      {/* Selected Movie */}
      {/* -------------------------------- */}

      {selectedMovie && (
        <div className="mt-8">

          <p className="text-lg font-medium">
            Selected Movie
          </p>

          <div className="mt-3 flex items-center gap-4">

            {selectedMovie.Poster &&
            selectedMovie.Poster !== "N/A" && (
              <img
                src={selectedMovie.Poster}
                alt={selectedMovie.Title}
                className="w-20 h-28 object-cover rounded-md"
              />
            )}

            <div>

              <h2 className="text-xl font-semibold">
                {selectedMovie.Title}
              </h2>

              <p className="text-gray-400">
                {selectedMovie.Year}
              </p>

              <p className="text-gray-500 text-sm">
                IMDb ID: {selectedMovie.imdbID}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* -------------------------------- */}
      {/* Show Price */}
      {/* -------------------------------- */}

      {selectedMovie && (
        <div className="mt-8">

          <label className="block text-sm font-medium mb-2">
            Show Price
          </label>

          <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">

            <p className="text-gray-400 text-sm">
              {currency}
            </p>

            <input
              min={0}
              type="number"
              value={showPrice}
              onChange={(e) =>
                setShowPrice(e.target.value)
              }
              placeholder="Enter show price"
              className="outline-none bg-transparent"
            />

          </div>

        </div>
      )}

      {/* -------------------------------- */}
      {/* Date and Time */}
      {/* -------------------------------- */}

      {selectedMovie && (
        <div className="mt-6">

          <label className="block text-sm font-medium mb-2">
            Select Date and Time
          </label>

          <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">

            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) =>
                setDateTimeInput(e.target.value)
              }
              className="outline-none rounded-md bg-transparent"
            />

            <button
              onClick={handleDateTimeAdd}
              className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
            >
              Add Time
            </button>

          </div>

        </div>
      )}

      {/* -------------------------------- */}
      {/* Selected Times */}
      {/* -------------------------------- */}

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">

          <h2 className="mb-2">
            Selected Date-Time
          </h2>

          <ul className="space-y-3">

            {Object.entries(
              dateTimeSelection
            ).map(([date, times]) => (

              <li key={date}>

                <div className="font-medium">
                  {date}
                </div>

                <div className="flex flex-wrap gap-2 mt-1 text-sm">

                  {times.map((time) => (

                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >

                      <span>
                        {time}
                      </span>

                      <DeleteIcon
                        onClick={() =>
                          handleRemoveTime(
                            date,
                            time
                          )
                        }
                        width={15}
                        className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                      />

                    </div>

                  ))}

                </div>

              </li>

            ))}

          </ul>

        </div>
      )}

      {/* -------------------------------- */}
      {/* Add Show Button */}
      {/* -------------------------------- */}

      {selectedMovie && (
        <button
          onClick={handleAddShow}
          disabled={addingShow}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
        >
          {addingShow
            ? "Adding Show..."
            : "Add Show"}
        </button>
      )}
    </div>
  );
};

export default AddShows;
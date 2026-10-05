import axios from "axios";
import Movie from "../model/Movie.js";
import Show from "../model/Show.js";

const OMDB_URL = "https://www.omdbapi.com/";

// API to search movies from OMDb
export const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Please provide a movie name",
      });
    }

    const response = await axios.get(OMDB_URL, {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: query,
      },
    });

    if (response.data.Response === "False") {
      return res.status(404).json({
        success: false,
        message: response.data.Error || "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      movies: response.data.Search || [],
    });
  } catch (error) {
    console.log("FULL ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: error.response?.data?.Error || error.message,
    });
  }
};


// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const {
      movieId,
      showsInput,
      showPrice
    } = req.body;

    // Validate required data
    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({
        success: false,
        message: "movieId, showsInput and showPrice are required",
      });
    }

    // Check if movie already exists
    let movie = await Movie.findById(movieId);

    // If movie does not exist, fetch movie details from OMDb
    if (!movie) {
      const response = await axios.get(OMDB_URL, {
        params: {
          apikey: process.env.OMDB_API_KEY,
          i: movieId,
          plot: "full",
        },
      });

      const movieApiData = response.data;

      if (movieApiData.Response === "False") {
        return res.status(404).json({
          success: false,
          message: movieApiData.Error || "Movie not found",
        });
      }

      // Convert OMDb Genre string into array
      const genres = movieApiData.Genre
        ? movieApiData.Genre.split(",").map((genre) => genre.trim())
        : [];

      // Convert OMDb Actors string into array
      const casts = movieApiData.Actors
        ? movieApiData.Actors.split(",").map((actor) => actor.trim())
        : [];

      // Create movie according to your Movie model
      const movieDetails = {
        _id: movieId,

        title: movieApiData.Title || "",

        overview: movieApiData.Plot || "",

        poster_path:
          movieApiData.Poster && movieApiData.Poster !== "N/A"
            ? movieApiData.Poster
            : "",

        // OMDb does not provide backdrop image
        backdrop_path: "",

        release_date: movieApiData.Released !== "N/A"
          ? movieApiData.Released
          : "",

        original_language: movieApiData.Language !== "N/A"
          ? movieApiData.Language
          : "",

        tagline: "",

        genres: genres,

        casts: casts,

        vote_average:
          movieApiData.imdbRating !== "N/A"
            ? Number(movieApiData.imdbRating)
            : 0,

        runtime:
          movieApiData.Runtime !== "N/A"
            ? movieApiData.Runtime
            : "",
      };

      // Save movie in database
      movie = await Movie.create(movieDetails);
    }

    // Array for all shows
    const showsToCreate = [];

    // Loop through dates
    showsInput.forEach((show) => {
      const showDate = show.date;

      // Loop through times
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;

        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice: Number(showPrice),
          occupiedSeats: {},
        });
      });
    });

    // Check whether at least one show exists
    if (showsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one show date and time",
      });
    }

    // Create all shows
    await Show.insertMany(showsToCreate);

    return res.status(201).json({
      success: true,
      message: "Movie and shows added successfully",
      movie,
      shows: showsToCreate,
    });

  } catch (error) {
    console.log("ADD SHOW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/show/all
// Public — returns each distinct movie that currently has an upcoming show,
// used for the "Now Showing" grid on the Home / Movies pages.
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // De-duplicate by movie, keeping the earliest upcoming show time
    const seen = new Set();
    const movies = [];

    shows.forEach((show) => {
      if (show.movie && !seen.has(show.movie._id)) {
        seen.add(show.movie._id);
        movies.push(show.movie);
      }
    });

    return res.status(200).json({
      success: true,
      shows: movies,
    });
  } catch (error) {
    console.log("GET SHOWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/show/:movieId
// Public — returns the movie details along with all of its upcoming shows,
// grouped by date, for the movie details / seat selection pages.
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    }).sort({ showDateTime: 1 });

    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        showPrice: show.showPrice,
      });
    });

    return res.status(200).json({
      success: true,
      movie,
      dateTime,
    });
  } catch (error) {
    console.log("GET SHOW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
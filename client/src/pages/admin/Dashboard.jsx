import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormet";
import { useAppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { axios, currency } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dashboard cards
  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: `${currency}${dashboardData.totalRevenue}`,
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UserIcon,
    },
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/admin/dashboard"
      );

      console.log("DASHBOARD RESPONSE:", response.data);

      if (response.data.success) {
        setDashboardData({
          totalBookings: response.data.totalBookings || 0,
          totalRevenue: response.data.totalRevenue || 0,
          activeShows: response.data.activeShows || [],
          totalUser: response.data.totalUser || 0,
        });
      } else {
        setError(response.data.message || "Failed to load dashboard");
      }
    } catch (error) {
      console.log("DASHBOARD ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <BlurCircle top="-100px" left="0" />

      {/* Error */}
      {error && (
        <div className="mt-5 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="flex flex-wrap gap-4 w-full mt-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="flex items-center justify-between px-4 py-4 bg-primary/10 border border-primary/20 rounded-md max-w-56 w-full"
            >
              <div>
                <h1 className="text-sm text-gray-400">
                  {card.title}
                </h1>

                <p className="text-xl font-medium mt-1">
                  {card.value}
                </p>
              </div>

              <Icon className="w-6 h-6" />
            </div>
          );
        })}
      </div>

      {/* Active Shows */}
      <p className="mt-10 text-lg font-medium">
        Active Shows
      </p>

      {dashboardData.activeShows.length === 0 ? (
        <div className="mt-5 p-5 rounded-lg border border-primary/20 bg-primary/5 text-gray-400">
          No active shows found.
        </div>
      ) : (
        <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
          <BlurCircle top="100px" left="-10%" />

          {dashboardData.activeShows.map((show) => (
            <div
              key={show._id}
              className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300"
            >
              {/* Movie Poster */}
              <img
                src={show.movie?.poster_path}
                alt={show.movie?.title || "Movie"}
                className="h-60 w-full object-cover"
              />

              {/* Movie Title */}
              <p className="font-medium p-2 truncate">
                {show.movie?.title || "Unknown Movie"}
              </p>

              {/* Price + Rating */}
              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium">
                  {currency}
                  {show.showPrice}
                </p>

                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" />

                  {Number(
                    show.movie?.vote_average || 0
                  ).toFixed(1)}
                </p>
              </div>

              {/* Show Date */}
              <p className="px-2 pt-2 text-sm text-gray-500">
                {dateFormat(show.showDateTime)}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Dashboard;
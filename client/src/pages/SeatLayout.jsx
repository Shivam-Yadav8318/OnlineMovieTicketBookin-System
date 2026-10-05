import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import { ArrowRight, ClockIcon } from 'lucide-react';
import isoTimeFormet from '../lib/isoTimeFormet';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { useUser, useClerk } from '@clerk/react';

const SeatLayout = () => {
  const groupRows = [
    ['A', 'B'],
    ['C', 'D'],
    ['E', 'F'],
    ['G', 'H'],
    ['I', 'J'],
  ];

  const { id, date } = useParams();
  const { axios } = useAppContext();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const navigate = useNavigate();

  const getShow = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`/api/show/${id}`);

      if (data.success) {
        setShow({
          movie: data.movie,
          dateTime: data.dateTime,
        });
      }
    } catch (error) {
      console.log('Seat layout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOccupiedSeats = async (showId) => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`);

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      }
    } catch (error) {
      console.log('Get occupied seats error:', error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast('Please select time first');
    }

    if (occupiedSeats.includes(seatId)) {
      return toast('This seat is already booked');
    }

    if (
      !selectedSeats.includes(seatId) &&
      selectedSeats.length >= 5
    ) {
      return toast('You can only select five seats at a time');
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isOccupied = occupiedSeats.includes(seatId);

          return (
            <button
              key={seatId}
              disabled={isOccupied}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer text-xs transition
                ${
                  isOccupied
                    ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                    : selectedSeats.includes(seatId)
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/20'
                }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const handleCheckout = async () => {
    if (!isSignedIn) {
      return openSignIn();
    }

    if (!selectedTime) {
      return toast('Please select a show time');
    }

    if (selectedSeats.length === 0) {
      return toast('Please select at least one seat');
    }

    try {
      setBooking(true);

      const { data } = await axios.post('/api/booking/create', {
        showId: selectedTime.showId,
        selectedSeats,
      });

      if (data.success) {
        if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          toast.success(data.message || 'Booking confirmed!');
          navigate('/my-bookings');
        }
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.log('Checkout error:', error);
      if (error.response?.status === 401) {
        openSignIn();
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setBooking(false);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats(selectedTime.showId);
      setSelectedSeats([]);
    }
  }, [selectedTime]);

  if (loading || !show) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-10 md:pt-20">

      {/* Available Timings */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        
        <p className="text-lg font-semibold px-6">
          Available Timings
        </p>

        <div className="mt-4">
          {show.dateTime[date]?.map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition
                ${
                  selectedTime?.time === item.time
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary/20'
                }`}
            >
              <ClockIcon className="w-4 h-4" />

              <p className="text-sm">
                {isoTimeFormet(item.time)}
              </p>
            </div>
          ))}

          {!show.dateTime[date]?.length && (
            <p className='px-6 text-sm text-gray-400'>No showtimes for this date.</p>
          )}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">

        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />

        <h1 className="text-2xl font-semibold mb-4">
          Select your seat
        </h1>

        <img
          src={assets.screenImage}
          alt="screen"
        />

        <p className="text-gray-400 text-sm mb-6">
          Screen Side
        </p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">

          {/* First Group */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) =>
              renderSeats(row)
            )}
          </div>

          {/* Remaining Groups */}
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map((row) =>
                  renderSeats(row)
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Checkout */}
        <button
          onClick={handleCheckout}
          disabled={booking}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {booking ? 'Processing...' : 'Proceed to Checkout'}

          <ArrowRight
            strokeWidth={3}
            className="w-4 h-4"
          />
        </button>

      </div>
    </div>
  );
};

export default SeatLayout;

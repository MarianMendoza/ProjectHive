import { useState, useEffect } from "react";

const Countdown = (): JSX.Element => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasEnded, setHasEnded] = useState(false); // State to track if the countdown ended

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const res = await fetch("/api/deadlines");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const openDayDate = new Date(data[0].openDayDate); // Convert to Date object

          const updateCountdown = () => {
            const now = new Date().getTime();
            const eventTime = openDayDate.getTime();
            const difference = eventTime - now; // Get time difference in milliseconds

            if (difference > 0) {
              const days = Math.floor(difference / (1000 * 60 * 60 * 24));
              const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
              const minutes = Math.floor((difference / (1000 * 60)) % 60);
              const seconds = Math.floor((difference / 1000) % 60);

              setTimeLeft({ days, hours, minutes, seconds });
              setHasEnded(false); // Countdown is still running
            } else {
              setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
              setHasEnded(true); // Countdown has ended
            }
          };

          updateCountdown();
          const interval = setInterval(updateCountdown, 1000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching deadlines:", error);
      }
    };

    fetchDeadline();
  }, []);

  return (
    <section className="w-full py-12 bg-white-100">
      {/* Conditionally render UI based on whether the countdown has ended */}
      {hasEnded ? (
        <div className="text-center py-5 text-xl text-lime-700">
          <h3 className="font-bold text-2xl">The Hive is Open!</h3>
          <p className="mt-3">Our busy bee days have ended! 🐝🎉</p>
        </div>
      ) : (
        <>
        <h2 className="text-2xl font-bold text-center text-lime-700 md:text-3xl lg:text-4xl">
            Days till we open our Hive
          </h2>
          <p className="text-center py-3 text-lime-600">
            Our busy bee days end in 🐝:
          </p>
        <div className="mt-8 flex justify-center gap-10 text-center">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-lime-700 bg-lime-200 rounded-lg w-24 h-24 flex items-center justify-center mb-2">
              {timeLeft.days}
            </div>
            <span className="text-lime-700 text-lg">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-lime-700 bg-lime-200 rounded-lg w-24 h-24 flex items-center justify-center mb-2">
              {timeLeft.hours}
            </div>
            <span className="text-lime-700 text-lg">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-lime-700 bg-lime-200 rounded-lg w-24 h-24 flex items-center justify-center mb-2">
              {timeLeft.minutes}
            </div>
            <span className="text-lime-700 text-lg">Minutes</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-lime-700 bg-lime-200 rounded-lg w-24 h-24 flex items-center justify-center mb-2">
              {timeLeft.seconds}
            </div>
            <span className="text-lime-700 text-lg">Seconds</span>
          </div>
        </div>
        </>
      )}
    </section>
  );
};

export default Countdown;

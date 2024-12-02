import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import "./Timer.css";

const Timer = ({ minutes }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  }, [minutes]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      const audio = new Audio("/timer-done.mp3");
      audio.play();
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timer">
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        <button onClick={toggleTimer} className="timer-btn">
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={resetTimer} className="timer-btn">
          <FaRedo />
        </button>
      </div>
    </div>
  );
};

Timer.propTypes = {
  minutes: PropTypes.number.isRequired,
};

export default Timer;

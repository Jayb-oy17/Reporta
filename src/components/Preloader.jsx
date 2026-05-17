import { useState, useEffect } from "react";

const Preloader = ({ onFinish, logo = "src/assets/logo.png" }) => {
  const [animate, setAnimate] = useState("pulse");

  useEffect(() => {
    // Switch to zoom‑in after 3 seconds
    const zoomInTimer = setTimeout(() => {
      setAnimate("zoomIn");
    }, 500);

    // Finish after 5 seconds total
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => {
      clearTimeout(zoomInTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-900">
      <img
        src={logo}
        alt="Logo"
        className={`w-32 h-32 object-contain ${
          animate === "pulse" ? "animate-pulse" : "animate-zoomIn"
        }`}
      />
    </div>
  );
};

export default Preloader;

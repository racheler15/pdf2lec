import React, { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import "../styles/Display.css";

interface CarouselProps {
  pdfUrl: string;
  audioUrl: string;
}

interface SlideViewerProps {
  slides: string[];
  currentSlide: number;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slides, currentSlide }) => {
  console.log("Rendering slide", currentSlide); // Debugging log to track slide change

  return (
    <div className="slide-viewer">
      {slides.length > 0 && (
        <img
          src={slides[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            border: "1px solid gray",
          }}
        />
      )}
    </div>
  );
};

const Carousel: React.FC<CarouselProps> = ({ pdfUrl, audioUrl }) => {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // An array that stores the time in seconds for each slide.
  const slideTimes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]; // Example times for each slide

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const slideImages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const scale = 1;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({ canvasContext: context!, viewport: scaledViewport })
          .promise;
        slideImages.push(canvas.toDataURL());
      }

      setSlides(slideImages);
    };

    loadPdf();
  }, [pdfUrl]);

  const nextSlide = () => {
    const nextSlideIndex = (currentSlide + 1) % slides.length;
    setCurrentSlide(nextSlideIndex);
    if (audioRef.current) {
      audioRef.current.currentTime = slideTimes[nextSlideIndex];
    }
  };

  const prevSlide = () => {
    const prevSlideIndex = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(prevSlideIndex);
    if (audioRef.current) {
      audioRef.current.currentTime = slideTimes[prevSlideIndex];
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || slides.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = audioElement.currentTime;

      // Determine the correct slide based on the current time in the audio
      let newSlide = currentSlide;
      for (let i = 0; i < slideTimes.length; i++) {
        if (
          currentTime >= slideTimes[i] &&
          (i === slideTimes.length - 1 || currentTime < slideTimes[i + 1])
        ) {
          newSlide = i;
          break;
        }
      }

      // Only update `currentSlide` if it’s different to avoid unnecessary re-renders
      if (newSlide !== currentSlide) {
        setCurrentSlide(newSlide);
      }
    };

    // Attach the time update listener
    audioElement.addEventListener("timeupdate", handleTimeUpdate);

    // Cleanup listener on unmount
    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [currentSlide, slides, slideTimes]);

  if (slides.length === 0) {
    return <div>Loading...</div>;
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentSlide(index);
    if (audioRef.current) {
      audioRef.current.currentTime = slideTimes[index];
    }
  };

  const getVisibleThumbnails = () => {
    const start = Math.max(0, currentSlide - 2);
    const end = Math.min(slides.length, start + 4);
    return slides.slice(start, end);
  };

  return (
    <div className="carousel-container">
      <div className="hover-container">
        <SlideViewer slides={slides} currentSlide={currentSlide} />

        <audio ref={audioRef} className="audio-player" controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      <div className="thumbnail-container">
        {getVisibleThumbnails().map((thumbnail, index) => {
          const slideIndex = Math.max(0, currentSlide - 2) + index;
          return (
            <img
              key={slideIndex}
              src={thumbnail}
              alt={`Thumbnail ${slideIndex + 1}`}
              onClick={() => handleThumbnailClick(slideIndex)}
              style={{
                width: "22%",
                height: "100%",
                cursor: "pointer",
                border:
                  slideIndex === currentSlide
                    ? "2px solid #757bf5"
                    : "1px solid #c3c3c3",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Carousel;

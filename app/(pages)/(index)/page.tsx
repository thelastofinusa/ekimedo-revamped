"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { toast } from "sonner";

export default function Home() {
  return (
    <div className="h-dvh py-40">
      <Button onClick={() => toast.success("Welcome to this page")}>
        success
      </Button>
      <Button onClick={() => toast.error("Welcome to this page")}>error</Button>
      <Button onClick={() => toast.warning("Welcome to this page")}>
        warning
      </Button>
      <Button onClick={() => toast.info("Welcome to this page")}>info</Button>
      <Button onClick={() => toast.loading("Welcome to this page")}>
        loading
      </Button>
      <Button onClick={() => toast.dismiss()}>Dismiss</Button>
    </div>
  );
}

// "use client";

// import React, { useCallback, useEffect, useState } from "react";

// const sliderData = [
//   {
//     id: 1,
//     image: "https://unsplash.com",
//     title: "Innovative Tech Solutions",
//     subtitle:
//       "Empowering your digital future with next-generation applications.",
//     ctaText: "Get Started",
//     ctaLink: "#",
//   },
//   {
//     id: 2,
//     image: "https://unsplash.com",
//     title: "Global Connectivity",
//     subtitle:
//       "Bring your teams closer together with seamless cloud integration.",
//     ctaText: "Learn More",
//     ctaLink: "#",
//   },
//   {
//     id: 3,
//     image: "https://unsplash.com",
//     title: "Data-Driven Insights",
//     subtitle: "Make critical business decisions backed by real-time analytics.",
//     ctaText: "View Pricing",
//     ctaLink: "#",
//   },
// ];

// export default function Home() {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const prevSlide = () => {
//     setCurrentIndex((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
//   };

//   const nextSlide = useCallback(() => {
//     setCurrentIndex((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
//   }, []);

//   // Auto-play interval
//   useEffect(() => {
//     const timer = setInterval(nextSlide, 6000);
//     return () => clearInterval(timer);
//   }, [nextSlide]);

//   return (
//     <div className="relative h-[85vh] w-full overflow-hidden bg-black md:h-screen">
//       {/* Slides Container */}
//       <div
//         className="flex h-full w-full transition-transform duration-700 ease-in-out"
//         style={{ transform: `translateX(-${currentIndex * 100}%)` }}
//       >
//         {sliderData.map((slide) => (
//           <div
//             key={slide.id}
//             className="relative h-full w-full shrink-0 bg-cover bg-center"
//             style={{ backgroundImage: `url(${slide.image})` }}
//           >
//             {/* Dark Overlay for Readability */}
//             <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

//             {/* Content Section */}
//             <div className="absolute inset-0 z-10 flex max-w-4xl flex-col items-start justify-center px-6 text-white sm:px-12 md:px-24">
//               <h1 className="animate-fade-in mb-4 text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
//                 {slide.title}
//               </h1>
//               <p className="mb-8 max-w-xl text-base text-gray-300 sm:text-lg md:text-xl">
//                 {slide.subtitle}
//               </p>
//               <a
//                 href={slide.ctaLink}
//                 className="transform rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition duration-300 hover:scale-105 hover:bg-blue-700"
//               >
//                 {slide.ctaText}
//               </a>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Navigation Arrows */}
//       <button
//         onClick={prevSlide}
//         className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/60"
//         aria-label="Previous Slide"
//       >
//         <svg
//           xmlns="http://w3.org"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth={2}
//           stroke="currentColor"
//           className="h-6 w-6"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M15.75 19.5L8.25 12l7.5-7.5"
//           />
//         </svg>
//       </button>
//       <button
//         onClick={nextSlide}
//         className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white transition hover:bg-black/60"
//         aria-label="Next Slide"
//       >
//         <svg
//           xmlns="http://w3.org"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth={2}
//           stroke="currentColor"
//           className="h-6 w-6"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M8.25 4.5l7.5 7.5-7.5 7.5"
//           />
//         </svg>
//       </button>

//       {/* Dot Indicators */}
//       <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-3">
//         {sliderData.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setCurrentIndex(index)}
//             className={`h-3 rounded-full transition-all duration-300 ${
//               currentIndex === index
//                 ? "w-8 bg-blue-600"
//                 : "w-3 bg-white/50 hover:bg-white"
//             }`}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

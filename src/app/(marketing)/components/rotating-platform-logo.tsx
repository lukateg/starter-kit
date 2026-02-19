"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import googleLogo from "../../../../public/logos/google.svg";
import claudeLogo from "../../../../public/logos/claude-ai-icon.svg";
import perplexityLogo from "../../../../public/logos/perplexity.svg";
import bingLogo from "../../../../public/logos/bing.svg";
import chatgptLogo from "../../../../public/logos/chatgpt.svg";

const platformLogos = [
  { name: "Google", logo: googleLogo },
  { name: "Claude", logo: claudeLogo },
  { name: "Perplexity", logo: perplexityLogo },
  { name: "Bing", logo: bingLogo },
  { name: "ChatGPT", logo: chatgptLogo },
];

// Isolated component so the 2s interval doesn't re-render the entire page
export function RotatingPlatformLogo() {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentLogoIndex(
        (prevIndex) => (prevIndex + 1) % platformLogos.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const logo = platformLogos[isMounted ? currentLogoIndex : 0];

  return (
    <div className="inline-flex items-center gap-2 h-12 md:h-16">
      <Image
        src={logo.logo}
        alt={logo.name}
        className="h-12 md:h-16 w-auto object-contain"
        width={120}
        height={64}
      />
      <span className="text-3xl md:text-6xl font-bold text-gray-900 whitespace-nowrap">
        {logo.name}
      </span>
    </div>
  );
}

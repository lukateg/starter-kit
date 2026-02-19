import Image from "next/image";
import { TrendingUp } from "lucide-react";
import wallpaperImage from "../../../../public/landingPage/wallpaper-second.jpg";

export function TrafficGrowthCard() {
  return (
    <div className="rounded-sm border border-border bg-background flex flex-col">
      <div className="relative rounded-t-sm overflow-hidden h-[280px] md:h-[320px]">
        {/* Wallpaper background */}
        <div className="absolute inset-0">
          <Image
            src={wallpaperImage}
            alt=""
            className="w-full h-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
        </div>
        {/* Traffic Growth Card */}
        <div className="relative p-6 md:p-8">
          <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Browser header with traffic lights */}
            <div className="px-4 py-3 border-b bg-primary/7 border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {/* Chart content */}
            <div className="p-5">
              <p className="text-lg font-semibold text-foreground mb-4">
                Traffic Growth
              </p>
              {/* Chart area */}
              <div className="relative h-24 mb-4">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-b border-border/50"></div>
                  <div className="border-b border-border/50"></div>
                  <div className="border-b border-border/50"></div>
                  <div className="border-b border-border/50"></div>
                </div>
                {/* SVG Line chart */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 300 96"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(107, 114, 90)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(107, 114, 90)"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 85 C 10 84, 20 86, 30 82 C 40 78, 45 74, 55 76 C 65 78, 70 72, 80 68 C 90 64, 95 66, 105 62 C 115 58, 125 52, 135 55 C 145 58, 150 50, 160 44 C 170 38, 180 42, 190 36 C 200 30, 210 26, 220 28 C 230 30, 235 22, 245 18 C 255 14, 265 16, 275 10 C 285 4, 295 6, 300 4"
                    fill="none"
                    stroke="rgb(107, 114, 90)"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 85 C 10 84, 20 86, 30 82 C 40 78, 45 74, 55 76 C 65 78, 70 72, 80 68 C 90 64, 95 66, 105 62 C 115 58, 125 52, 135 55 C 145 58, 150 50, 160 44 C 170 38, 180 42, 190 36 C 200 30, 210 26, 220 28 C 230 30, 235 22, 245 18 C 255 14, 265 16, 275 10 C 285 4, 295 6, 300 4 L 300 96 L 0 96 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Last 30 days
                </span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  385%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-foreground mb-3">
          <span className="text-4xl">3.</span> Publish on Autopilot
        </h3>
        <p className="text-muted-foreground">
          We follow the proven plan. Create and publish SEO-optimized articles
          daily. You focus on your work, while your traffic grows on autopilot.
        </p>
      </div>
    </div>
  );
}

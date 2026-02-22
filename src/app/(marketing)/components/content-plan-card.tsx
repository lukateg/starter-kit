import Image from "next/image";
import wallpaperImage from "../../../../public/landingPage/wallpaper-second.jpg";

export function ContentPlanCard() {
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
        {/* Keyword cards */}
        <div className="relative p-6 md:p-8">
          <div className="grid grid-cols-2 gap-3">
            {/* Keyword Card 1 */}
            <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden p-4">
              <div className="text-sm text-muted-foreground mb-2">10</div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 mb-2">
                Guide
              </span>
              <p className="font-semibold text-foreground text-sm mb-2">
                organic lead generation
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>🇺🇸</span>
                <span>
                  Vol: <span className="font-semibold text-foreground">260</span>
                </span>
                <span>
                  KD: <span className="font-semibold text-foreground">1</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-success"></span>
              </div>
              <div className="border border-border rounded-lg px-2 py-1 text-center">
                <span className="text-[12px] font-medium text-foreground">
                  Generate Article
                </span>
              </div>
            </div>
            {/* Keyword Card 2 */}
            <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden p-4">
              <div className="text-sm text-muted-foreground mb-2">11</div>
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-rose-100 text-rose-700 mb-2">
                How-To
              </span>
              <p className="font-semibold text-foreground text-sm mb-2">
                lower customer acquisition cost
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>🇺🇸</span>
                <span>
                  Vol: <span className="font-semibold text-foreground">140</span>
                </span>
                <span>
                  KD: <span className="font-semibold text-foreground">0</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-success"></span>
              </div>
              <div className="border border-border rounded-lg px-2 py-1 text-center">
                <span className="text-[12px] font-medium text-foreground">
                  Generate Article
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-foreground mb-3">
          <span className="text-4xl">2.</span> 30-day Content Plan that
          Outperforms
        </h3>
        <p className="text-muted-foreground">
          We find the best angles and phrases with the highest potential and
          create a content plan optimised to drive traffic in the shortest time
          window.
        </p>
      </div>
    </div>
  );
}

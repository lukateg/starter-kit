import Image from "next/image";
import wallpaperImage from "../../../../public/landingPage/wallpaper-second.jpg";

export function AddWebsiteCard() {
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
        {/* Browser window */}
        <div className="relative p-6 md:p-8">
          <div className="bg-background rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Browser header with traffic lights */}
            <div className="px-4 py-3 border-b bg-primary/7 border-border flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {/* Browser content */}
            <div className="p-6">
              <p className="text-lg font-semibold text-foreground mb-4">
                Add Your Website
              </p>
              <div className="border border-border rounded-lg px-4 py-3 mb-4">
                <span className="text-muted-foreground">yourbusiness.com</span>
              </div>
              <div className="border border-border rounded-lg px-4 py-3 text-center">
                <span className="font-semibold text-foreground">Get Started</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-foreground mb-3">
          <span className="text-4xl">1.</span> Add Your Website
        </h3>
        <p className="text-muted-foreground">
          We explore your market, competitors, and target audience. Discover
          winning keywords with high traffic potential that your competitors
          don&apos;t rank for.
        </p>
      </div>
    </div>
  );
}

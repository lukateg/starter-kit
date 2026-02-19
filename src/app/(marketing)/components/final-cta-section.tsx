import { Rocket } from "lucide-react";
import { TrackedCTALink } from "@/components/app/tracked-cta-link";

interface FinalCTASectionProps {
  buttonLocation?: string;
}

export function FinalCTASection({ buttonLocation = "final_cta" }: FinalCTASectionProps) {
  return (
    <section className="relative pt-16 md:pt-24 pb-16 max-w-7xl mx-auto overflow-hidden rounded-sm bg-primary/5">
      <div className="relative container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Ship Faster?
          </h2>
          <p className="text-lg md:text-xl text-primary max-w-2xl mx-auto mb-8">
            Stop rebuilding infrastructure. Start building your product today.
          </p>

          <TrackedCTALink
            href="/app"
            variant="default"
            size="lg"
            eventData={{ button_location: buttonLocation }}
          >
            <Rocket className="w-5 h-5" />
            Get Started Now
          </TrackedCTALink>
        </div>
      </div>
    </section>
  );
}

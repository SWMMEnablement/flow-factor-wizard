import { Droplets } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-secondary text-primary-foreground py-16 md:py-24">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Droplets className="h-12 w-12" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            ICM InfoSewer Peakable Flow Calculator
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Professional peakable flow calculations for sanitary sewer design and hydraulic modeling
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm md:text-base">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <strong>Harmon Formula</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <strong>Modified Harmon</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <strong>Babbitt Formula</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <strong>Custom Formulas</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

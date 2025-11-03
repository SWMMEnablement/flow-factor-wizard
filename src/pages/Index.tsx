import { useState } from "react";
import { Calculator, BookOpen, LineChart, FileDown, FileCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import FormulaLibrary from "@/components/FormulaLibrary";
import DesignFlowCalculator from "@/components/DesignFlowCalculator";
import ResultsVisualization from "@/components/ResultsVisualization";
import RubyScriptSection from "@/components/RubyScriptSection";

const Index = () => {
  const [results, setResults] = useState<any[]>([]);
  const [calculationParams, setCalculationParams] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
            <TabsTrigger value="formulas" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Formulas</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="script" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span className="hidden sm:inline">Ruby Script</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <AboutSection />
          </TabsContent>

          <TabsContent value="formulas">
            <FormulaLibrary />
          </TabsContent>

          <TabsContent value="calculator">
            <DesignFlowCalculator 
              onCalculate={(newResults, params) => {
                setResults(newResults);
                setCalculationParams(params);
              }}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsVisualization 
              results={results} 
              params={calculationParams}
            />
          </TabsContent>

          <TabsContent value="script">
            <RubyScriptSection />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>InfoWorks ICM Design Flow Calculator • Professional Engineering Tool</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

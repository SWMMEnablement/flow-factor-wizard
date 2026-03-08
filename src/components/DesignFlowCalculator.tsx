import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, Info, Upload } from "lucide-react";
import { toast } from "sonner";

interface DesignFlowCalculatorProps {
  onCalculate: (results: any[], params: any) => void;
}

const formulas = {
  'harmon': { c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0, name: "Harmon Formula" },
  'modified': { c1: 1.0, c2: 18.0, c3: 4.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0, name: "Modified Harmon" },
  'babbitt': { c1: 0.0, c2: 5.0, c3: 0.0, e1: 0.0, e2: 0.2, m1: 0.0, m2: 1.0, name: "Babbitt Formula" },
  'custom': { c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0, name: "Custom Formula" }
};

const DesignFlowCalculator = ({ onCalculate }: DesignFlowCalculatorProps) => {
  const [formulaType, setFormulaType] = useState('harmon');
  const [qPerCapita, setQPerCapita] = useState('200');
  const [cutoff, setCutoff] = useState('6.0');
  const [convertToSeconds, setConvertToSeconds] = useState(true);
  const [populations, setPopulations] = useState('100, 500, 1000, 5000, 10000');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Custom formula coefficients
  const [coefficients, setCoefficients] = useState(formulas['harmon']);

  const handleFormulaChange = (value: string) => {
    setFormulaType(value);
    setCoefficients(formulas[value as keyof typeof formulas]);
  };

  const calculateEFF = (population: number, coef: typeof coefficients) => {
    const { c1, c2, c3, e1, e2, m1, m2 } = coef;
    
    // Convert population to thousands for formula
    const P = population / 1000;
    
    const numerator = c2 + (m1 * Math.pow(P, e1));
    const denominator = c3 + (m2 * Math.pow(P, e2));
    
    if (Math.abs(denominator) < 1e-10) {
      throw new Error("Invalid formula: denominator is zero");
    }
    
    return c1 + (numerator / denominator);
  };

  const handleCalculate = () => {
    try {
      const popArray = populations.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p) && p > 0);
      
      if (popArray.length === 0) {
        toast.error("Please enter valid population values");
        return;
      }

      const qPerCapitaNum = parseFloat(qPerCapita);
      const cutoffNum = parseFloat(cutoff);

      if (isNaN(qPerCapitaNum) || qPerCapitaNum <= 0) {
        toast.error("Flow per capita must be greater than 0");
        return;
      }

      if (isNaN(cutoffNum) || cutoffNum <= 0) {
        toast.error("Cutoff must be greater than 0");
        return;
      }

      const qPerCapitaPerSec = convertToSeconds ? qPerCapitaNum / 86400.0 : qPerCapitaNum;
      const flowUnits = convertToSeconds ? "L/s" : "L/day";

      const results = popArray.map(pop => {
        const eff = calculateEFF(pop, coefficients);
        const effCapped = Math.min(eff, cutoffNum);
        const designFlow = effCapped * pop * qPerCapitaPerSec;

        return {
          population: pop,
          eff: eff,
          effCapped: effCapped,
          designFlow: designFlow,
          flowUnits: flowUnits
        };
      });

      const params = {
        formula: formulas[formulaType as keyof typeof formulas].name,
        qPerCapita: qPerCapitaNum,
        cutoff: cutoffNum,
        convertToSeconds,
        coefficients
      };

      onCalculate(results, params);
      toast.success(`Calculated peakable flows for ${results.length} population values`);

    } catch (error: any) {
      toast.error(error.message || "Calculation error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Peakable Flow Calculator
          </CardTitle>
          <CardDescription className="text-base">
            Calculate peakable flows using standard or custom peaking factor formulas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="formula">Formula Preset</Label>
              <Select value={formulaType} onValueChange={handleFormulaChange}>
                <SelectTrigger id="formula">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harmon">Harmon Formula</SelectItem>
                  <SelectItem value="modified">Modified Harmon</SelectItem>
                  <SelectItem value="babbitt">Babbitt Formula</SelectItem>
                  <SelectItem value="custom">Custom Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-center text-lg font-mono font-semibold text-primary">
                {formulas[formulaType as keyof typeof formulas].name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qPerCapita">Flow per Capita (L/person/day)</Label>
                <Input
                  id="qPerCapita"
                  type="number"
                  value={qPerCapita}
                  onChange={(e) => setQPerCapita(e.target.value)}
                  step="1"
                />
              </div>

              <div>
                <Label htmlFor="cutoff">Maximum EFF Cutoff</Label>
                <Input
                  id="cutoff"
                  type="number"
                  value={cutoff}
                  onChange={(e) => setCutoff(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <Label htmlFor="convert" className="cursor-pointer">
                Convert to flow per second (L/s)?
              </Label>
              <Switch
                id="convert"
                checked={convertToSeconds}
                onCheckedChange={setConvertToSeconds}
              />
            </div>

            <div>
              <Label htmlFor="populations">Population Values (comma-separated)</Label>
              <Input
                id="populations"
                value={populations}
                onChange={(e) => setPopulations(e.target.value)}
                placeholder="100, 500, 1000, 5000, 10000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter multiple population values to compare results
              </p>
            </div>
          </div>

          {formulaType === 'custom' && (
            <Card className="bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Custom Formula Coefficients
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(coefficients).filter(([key]) => key !== 'name').map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key} className="text-xs">{key}</Label>
                    <Input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(e) => setCoefficients({
                        ...coefficients,
                        [key]: parseFloat(e.target.value) || 0
                      })}
                      step="0.1"
                      className="h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleCalculate} 
            size="lg" 
            className="w-full"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Peakable Flows
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignFlowCalculator;

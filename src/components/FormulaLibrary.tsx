import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formulas = [
  {
    name: "Harmon Formula",
    category: "Traditional US",
    formula: "EFF = 1 + (14 / √P)",
    description: "Classic peaking factor formula widely used in the United States. Developed by Harmon in the early 1900s based on empirical observations of flow variation.",
    coefficients: { c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0 },
    range: "Best for P = 100 - 10,000 people",
    applications: [
      "Municipal sanitary sewer design",
      "Residential drainage systems",
      "Standard practice in many US states"
    ],
    notes: "Tends to give conservative (higher) peaking factors for small populations."
  },
  {
    name: "Modified Harmon",
    category: "Ten States Standards",
    formula: "EFF = 1 + (18 / (4 + √P))",
    description: "Modified version recommended by the Ten States Standards (now Great Lakes Upper Mississippi River Board standards). Provides slightly different results than the original.",
    coefficients: { c1: 1.0, c2: 18.0, c3: 4.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0 },
    range: "Applicable for P > 1,000 people",
    applications: [
      "Wastewater treatment facility design",
      "Interceptor sewer sizing",
      "Regional system planning"
    ],
    notes: "Generally produces lower peaking factors than the original Harmon formula."
  },
  {
    name: "Babbitt Formula",
    category: "Small Communities",
    formula: "EFF = 5 / P^0.2",
    description: "Developed by Babbitt and Baumann, this formula is particularly suited for smaller communities and produces higher peaking factors for low populations.",
    coefficients: { c1: 0.0, c2: 5.0, c3: 0.0, e1: 0.0, e2: 0.2, m1: 0.0, m2: 1.0 },
    range: "Best for P < 1,000 people",
    applications: [
      "Small town sewer systems",
      "Rural community designs",
      "Individual subdivisions"
    ],
    notes: "More conservative for very small populations. Not recommended for large systems."
  },
  {
    name: "Custom Formula",
    category: "User-Defined",
    formula: "EFF = c1 + ((c2 + m1·P^e1) / (c3 + m2·P^e2))",
    description: "Flexible formula structure that allows you to define your own coefficients and exponents to match local standards or create specialized variations.",
    coefficients: { c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0 },
    range: "User-defined",
    applications: [
      "Local regulatory requirements",
      "Special research applications",
      "Calibration to measured data"
    ],
    notes: "Ensure your custom formula produces realistic values across your expected population range."
  }
];

const FormulaLibrary = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl">Peaking Factor Formulas</CardTitle>
          <CardDescription className="text-base">
            Mathematical approaches to calculating peak flow factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-foreground/80">
            <p className="text-lg leading-relaxed">
              The general form of the peaking factor formula used in this calculator is:
            </p>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 p-6 rounded-lg">
              <p className="text-center text-2xl font-mono font-bold text-primary mb-4">
                EFF = c1 + ((c2 + m1·P^e1) / (c3 + m2·P^e2))
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4">
                <div className="bg-card p-2 rounded text-center">
                  <span className="font-bold text-primary">EFF</span>
                  <div className="text-xs text-muted-foreground">Peaking Factor</div>
                </div>
                <div className="bg-card p-2 rounded text-center">
                  <span className="font-bold text-primary">P</span>
                  <div className="text-xs text-muted-foreground">Population</div>
                </div>
                <div className="bg-card p-2 rounded text-center">
                  <span className="font-bold text-primary">c1, c2, c3</span>
                  <div className="text-xs text-muted-foreground">Constants</div>
                </div>
                <div className="bg-card p-2 rounded text-center">
                  <span className="font-bold text-primary">m1, m2, e1, e2</span>
                  <div className="text-xs text-muted-foreground">Coefficients</div>
                </div>
              </div>
            </div>
            <p className="leading-relaxed">
              Where <strong>P</strong> is the contributing population (in thousands for most formulas). 
              By adjusting these coefficients, different standard formulas can be represented, or custom 
              formulas can be created to match specific requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {formulas.map((formula, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-2xl">{formula.name}</CardTitle>
                  <CardDescription className="text-base mt-1">{formula.category}</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {formula.range}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-center text-xl font-mono font-semibold text-primary">
                  {formula.formula}
                </p>
              </div>
              
              <p className="text-foreground/80 leading-relaxed">
                {formula.description}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">COEFFICIENTS</h4>
                  <div className="bg-card border border-border p-3 rounded-lg space-y-1 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">c1:</span>
                      <span className="font-semibold">{formula.coefficients.c1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">c2:</span>
                      <span className="font-semibold">{formula.coefficients.c2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">c3:</span>
                      <span className="font-semibold">{formula.coefficients.c3}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">m1:</span>
                      <span className="font-semibold">{formula.coefficients.m1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">m2:</span>
                      <span className="font-semibold">{formula.coefficients.m2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">e1:</span>
                      <span className="font-semibold">{formula.coefficients.e1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">e2:</span>
                      <span className="font-semibold">{formula.coefficients.e2}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">TYPICAL APPLICATIONS</h4>
                  <ul className="space-y-2">
                    {formula.applications.map((app, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">→</span>
                        <span className="text-foreground/80">{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {formula.notes && (
                <div className="bg-accent/5 border-l-4 border-accent p-3 rounded">
                  <p className="text-sm text-foreground/80">
                    <strong className="text-accent">Note:</strong> {formula.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormulaLibrary;

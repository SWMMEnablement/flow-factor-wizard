import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, TrendingUp, Database, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">What is ICM InfoSewer?</CardTitle>
          <CardDescription className="text-base">
            Professional sanitary sewer modeling and analysis software
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80">
          <p className="text-lg leading-relaxed">
            <strong className="text-foreground">ICM InfoSewer</strong> is a comprehensive hydraulic modeling 
            software developed by Innovyze (now part of Autodesk). It's used worldwide by water utilities, 
            consulting engineers, and municipalities for designing and analyzing sanitary sewer systems 
            and wastewater collection networks.
          </p>
          <p className="leading-relaxed">
            The software enables engineers to model complex sanitary sewer networks, perform peakable flow analysis, 
            assess system capacity, and optimize infrastructure design. This calculator focuses on the 
            <strong className="text-foreground"> peakable flow calculations</strong>—determining design flows 
            based on contributing population and peaking factors, similar to InfoSewer's methodology but adaptable 
            to various modeling environments.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Peaking Factors</CardTitle>
                <CardDescription>Understanding flow variation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              <strong className="text-foreground">Peaking factors</strong> (also called peaking coefficients or peak flow factors) 
              represent the ratio of maximum flow to average flow in a sewer system. They account for 
              the variability in wastewater flow throughout the day.
            </p>
            <p>
              Smaller populations tend to have higher peaking factors due to less flow averaging, 
              while larger populations show more consistent flows with lower peaking factors.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Database className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Design Flows</CardTitle>
                <CardDescription>Critical for system sizing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              <strong className="text-foreground">Design flows</strong> are calculated by multiplying the average 
              wastewater flow by the peaking factor:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              Q<sub>design</sub> = EFF × Population × Q<sub>per capita</sub>
            </div>
            <p>
              These design flows are used to size pipes, pumps, and treatment facilities to handle 
              peak loading conditions.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Network className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Network Analysis</CardTitle>
                <CardDescription>Upstream population tracing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              This calculator traces upstream through the sewer network to determine the 
              <strong className="text-foreground"> contributing population</strong> for each conduit (pipe segment).
            </p>
            <p>
              It accounts for flow splits at junctions by proportioning population based on 
              downstream pipe cross-sectional areas, providing accurate design flows throughout 
              the entire network.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-xl">Why This Tool?</CardTitle>
                <CardDescription>Automated peakable flow calculations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              This web-based calculator provides peakable flow calculation functionality similar to 
              ICM InfoSewer's design flow analysis, making it easier to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Understand different peaking factor formulas</li>
              <li>Compare formula results for sanitary sewers</li>
              <li>Visualize the impact of parameters on design flows</li>
              <li>Export results for documentation and reporting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutSection;

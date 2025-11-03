import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Droplets, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ResultsVisualizationProps {
  results: any[];
  params: any;
}

const ResultsVisualization = ({ results, params }: ResultsVisualizationProps) => {
  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = ["Population", "EFF (Calculated)", "EFF (Capped)", `Design Flow (${results[0].flowUnits})`];
    const rows = results.map(r => [
      r.population,
      r.eff.toFixed(4),
      r.effCapped.toFixed(4),
      r.designFlow.toFixed(6)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design_flows_${new Date().getTime()}.csv`;
    a.click();
  };

  if (results.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-16">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No results yet</p>
            <p className="text-sm">Go to the Calculator tab to generate results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFlow = results.reduce((sum, r) => sum + r.designFlow, 0);
  const avgEff = results.reduce((sum, r) => sum + r.effCapped, 0) / results.length;
  const maxEff = Math.max(...results.map(r => r.effCapped));
  const minEff = Math.min(...results.map(r => r.effCapped));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Total Design Flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalFlow.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">{results[0].flowUnits}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Average EFF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold">{avgEff.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>EFF Range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {minEff.toFixed(2)} - {maxEff.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardDescription>Total Population</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">
                {results.reduce((sum, r) => sum + r.population, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {params && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Calculation Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Formula:</span>
                <span className="font-semibold">{params.formula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flow per capita:</span>
                <span className="font-semibold">{params.qPerCapita} L/person/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Converted to seconds:</span>
                <span className="font-semibold">{params.convertToSeconds ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maximum EFF cutoff:</span>
                <span className="font-semibold">{params.cutoff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Results count:</span>
                <span className="font-semibold">{results.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Peaking Factor vs Population</CardTitle>
          <CardDescription>How EFF varies with contributing population</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="population" 
                label={{ value: 'Population', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Peaking Factor (EFF)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="eff" 
                stroke="hsl(var(--primary))" 
                name="EFF (Calculated)"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="effCapped" 
                stroke="hsl(var(--secondary))" 
                name="EFF (Capped)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Design Flow Distribution</CardTitle>
          <CardDescription>Calculated design flows for each population</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="population" 
                label={{ value: 'Population', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: `Design Flow (${results[0].flowUnits})`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Bar 
                dataKey="designFlow" 
                fill="hsl(var(--accent))" 
                name="Design Flow"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Results Table</CardTitle>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Population</th>
                  <th className="text-right py-3 px-4">EFF (Calc)</th>
                  <th className="text-right py-3 px-4">EFF (Capped)</th>
                  <th className="text-right py-3 px-4">Design Flow ({results[0].flowUnits})</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold">{result.population.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono">{result.eff.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-mono">{result.effCapped.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right font-mono">{result.designFlow.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsVisualization;

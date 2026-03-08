import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GitCompareArrows } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const FORMULAS = {
  harmon: {
    name: "Harmon",
    color: "hsl(var(--primary))",
    calc: (P: number) => 1 + 14 / Math.sqrt(P / 1000),
  },
  modified: {
    name: "Modified Harmon",
    color: "hsl(var(--secondary))",
    calc: (P: number) => 1 + 18 / (4 + Math.sqrt(P / 1000)),
  },
  babbitt: {
    name: "Babbitt",
    color: "hsl(var(--accent))",
    calc: (P: number) => 5 / Math.pow(P / 1000, 0.2),
  },
};

type FormulaKey = keyof typeof FORMULAS;

const FormulaComparison = () => {
  const [selected, setSelected] = useState<FormulaKey[]>(["harmon", "modified", "babbitt"]);
  const [minPop, setMinPop] = useState("100");
  const [maxPop, setMaxPop] = useState("50000");
  const [steps, setSteps] = useState("20");

  const toggle = (key: FormulaKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const min = Math.max(1, parseInt(minPop) || 100);
  const max = Math.max(min + 1, parseInt(maxPop) || 50000);
  const numSteps = Math.max(2, Math.min(100, parseInt(steps) || 20));

  const data = Array.from({ length: numSteps }, (_, i) => {
    const pop = min + (i * (max - min)) / (numSteps - 1);
    const point: Record<string, number> = { population: Math.round(pop) };
    for (const key of selected) {
      point[key] = parseFloat(FORMULAS[key].calc(pop).toFixed(4));
    }
    return point;
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <GitCompareArrows className="h-8 w-8 text-primary" />
            Formula Comparison
          </CardTitle>
          <CardDescription className="text-base">
            Compare peaking factor curves across formulas on the same chart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-6">
            {(Object.keys(FORMULAS) as FormulaKey[]).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`cmp-${key}`}
                  checked={selected.includes(key)}
                  onCheckedChange={() => toggle(key)}
                />
                <Label htmlFor={`cmp-${key}`} className="cursor-pointer flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: FORMULAS[key].color }}
                  />
                  {FORMULAS[key].name}
                </Label>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Min Population</Label>
              <Input type="number" value={minPop} onChange={(e) => setMinPop(e.target.value)} />
            </div>
            <div>
              <Label>Max Population</Label>
              <Input type="number" value={maxPop} onChange={(e) => setMaxPop(e.target.value)} />
            </div>
            <div>
              <Label>Data Points</Label>
              <Input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {selected.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">EFF vs Population</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="population"
                  label={{ value: "Population", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Peaking Factor (EFF)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip />
                <Legend />
                {selected.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={FORMULAS[key].color}
                    name={FORMULAS[key].name}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {selected.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">EFF Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Population</TableHead>
                    {selected.map((key) => (
                      <TableHead key={key}>{FORMULAS[key].name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.population.toLocaleString()}</TableCell>
                      {selected.map((key) => (
                        <TableCell key={key}>{row[key]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormulaComparison;

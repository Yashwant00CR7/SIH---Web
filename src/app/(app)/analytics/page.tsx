"use client";

import { StockTrendQuery } from "@/components/stock-trend-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyticsData } from "@/lib/data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Analytics & Reports
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Marine Sustainability Index</CardTitle>
            <CardDescription>Overall ecosystem health score.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div
              className="relative h-32 w-32 rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${
                  analyticsData.marineSustainabilityIndex * 3.6
                }deg, hsl(var(--muted)) 0deg)`,
              }}
            >
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {analyticsData.marineSustainabilityIndex}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Good Standing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Habitat Health</CardTitle>
            <CardDescription>Based on water quality and coral reef data.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Health Score</span>
                    <span>{analyticsData.habitatHealth}%</span>
                </div>
                <Progress value={analyticsData.habitatHealth} />
                <p className="text-xs text-muted-foreground">8% higher than last month</p>
             </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-1">
          <StockTrendQuery />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Abundance</CardTitle>
            <CardDescription>
              Relative abundance of key commercial species.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.stockAbundance}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Biodiversity Index</CardTitle>
            <CardDescription>
              Number of unique species observed over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.biodiversity}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="species"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

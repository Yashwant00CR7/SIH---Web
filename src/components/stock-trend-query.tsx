"use client";

import { getFishStockTrend } from "@/ai/flows/voice-assistant-stock-trends";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fishSpecies, regions } from "@/lib/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  fishName: z.string().min(1, "Please select a fish."),
  region: z.string().min(1, "Please select a region."),
});

export function StockTrendQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    stockTrend: string;
    confidence: number;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fishName: "",
      region: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getFishStockTrend(values);
      setResult(response);
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get stock trend data.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Fish Stock Trends</CardTitle>
        <CardDescription>
          Use our AI assistant to get the latest stock trends for specific
          regions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fishName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fish Species</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fish" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fishSpecies.map((fish) => (
                        <SelectItem key={fish.id} value={fish.name}>
                          {fish.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Get Trend
            </Button>
          </form>
        </Form>
        {result && (
          <div className="mt-6 rounded-md border bg-muted/50 p-4">
            <h4 className="font-semibold text-primary">AI Analysis Result:</h4>
            <div className="mt-2 space-y-2 text-sm">
              <p>
                <strong>Stock Trend:</strong>{" "}
                <span className="capitalize">{result.stockTrend}</span>
              </p>
              <p>
                <strong>Confidence:</strong>{" "}
                {(result.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

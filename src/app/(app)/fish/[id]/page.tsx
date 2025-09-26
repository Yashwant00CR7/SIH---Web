"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getImageUrl } from "@/lib/data";
import Image from "next/image";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Waves,
  AlignVerticalSpaceAround,
  Fish,
  MapPin,
  Calendar,
  Users,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState, use } from "react";
import MapboxMap, { MapPoint } from "@/components/MapboxMap";

interface SpeciesDetail {
  id: string;
  scientificName: string;
  name: string;
  occurrenceCount: number;
  totalIndividuals: number;
  avgIndividualsPerOccurrence: number;
  habitats: string[];
  localities: string[];
  waterBodies: string[];
  countries: string[];
  depthRange: {
    min: number;
    max: number;
    avg: number;
  };
  dateRange: {
    first: string;
    last: string;
  };
  coordinates: Array<{
    lat: number;
    lng: number;
    locality: string;
    date: string;
  }>;
  identifiedBy: string[];
  samplingProtocols: string[];
  lifeStages: string[];
  sexes: string[];
  recentOccurrences: Array<{
    id: string;
    date: string;
    locality: string;
    habitat: string;
    depth: string;
    individualCount: number;
    identifiedBy: string;
  }>;
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-primary">
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function FishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [species, setSpecies] = useState<SpeciesDetail | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mapImage = PlaceHolderImages.find((img) => img.id === "map");
  const scientificName = decodeURIComponent(resolvedParams.id);

  useEffect(() => {
    const fetchSpeciesDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fish/${encodeURIComponent(scientificName)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Species not found');
          } else {
            setError('Failed to fetch species details');
          }
          return;
        }
        
        const data: SpeciesDetail = await response.json();
        setSpecies(data);
      } catch (err) {
        setError('Failed to fetch species details');
        console.error('Error fetching species detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeciesDetail();
  }, [scientificName]);

  useEffect(() => {
    const fetchMapData = async () => {
      if (!species) return;
      
      try {
        setMapLoading(true);
        const response = await fetch(`/api/fish/coordinates?scientificName=${encodeURIComponent(species.scientificName)}&limit=50`);
        const data = await response.json();
        
        if (data.coordinates) {
          setMapPoints(data.coordinates);
        }
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapData();
  }, [species]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading species details...</span>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Species Not Found</h1>
        <p className="text-muted-foreground mb-4">{error || 'The requested species could not be found.'}</p>
        <Button asChild>
          <Link href="/fish">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Species List
          </Link>
        </Button>
      </div>
    );
  }

  const additionalImages = [
    "fish_detail1",
    "fish_detail2",
    "fish_detail3",
  ].map((id) => PlaceHolderImages.find((img) => img.id === id));

  // Create chart data from recent occurrences
  const chartData = species.recentOccurrences
    .filter(occ => occ.date)
    .map(occ => ({
      date: occ.date,
      occurrences: 1,
      individuals: occ.individualCount || 1
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.date === curr.date);
      if (existing) {
        existing.occurrences += curr.occurrences;
        existing.individuals += curr.individuals;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as Array<{date: string, occurrences: number, individuals: number}>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Last 10 data points

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/fish">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Species
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{species.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {species.scientificName}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary">
              {species.occurrenceCount} occurrences
            </Badge>
            <Badge variant="outline">
              {species.totalIndividuals} individuals recorded
            </Badge>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Occurrence Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Occurrence Timeline</CardTitle>
              <CardDescription>
                Recent sightings and individual counts over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="occurrences"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Occurrences"
                    />
                    <Line
                      type="monotone"
                      dataKey="individuals"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      name="Individuals"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Occurrences */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Occurrences</CardTitle>
              <CardDescription>
                Latest recorded sightings of {species.scientificName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {species.recentOccurrences.slice(0, 5).map((occurrence) => (
                  <div key={occurrence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{occurrence.locality}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {occurrence.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Waves className="h-3 w-3" />
                          {occurrence.habitat}
                        </div>
                        <div className="flex items-center gap-1">
                          <AlignVerticalSpaceAround className="h-3 w-3" />
                          {occurrence.depth}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{occurrence.individualCount || 1} individuals</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {occurrence.identifiedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full">
                <CarouselContent>
                  <CarouselItem>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl("fish1")}
                        alt={species.name}
                        fill
                        style={{ objectFit: "cover" }}
                        data-ai-hint={`${species.name} fish`}
                      />
                    </div>
                  </CarouselItem>
                  {additionalImages.map((img, index) => img && (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                        <Image
                          src={img.imageUrl}
                          alt={img.description}
                          fill
                          style={{ objectFit: "cover" }}
                          data-ai-hint={img.imageHint}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>

          {/* Species Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Species Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem 
                icon={<Fish />} 
                label="Total Occurrences" 
                value={species.occurrenceCount.toLocaleString()} 
              />
              <DetailItem 
                icon={<Users />} 
                label="Total Individuals" 
                value={species.totalIndividuals.toLocaleString()} 
              />
              <DetailItem 
                icon={<AlignVerticalSpaceAround />} 
                label="Depth Range" 
                value={`${species.depthRange.min}m - ${species.depthRange.max}m`} 
              />
              <DetailItem 
                icon={<Calendar />} 
                label="First Recorded" 
                value={species.dateRange.first || 'Unknown'} 
              />
              <DetailItem 
                icon={<Calendar />} 
                label="Last Seen" 
                value={species.dateRange.last || 'Unknown'} 
              />
              <DetailItem 
                icon={<MapPin />} 
                label="Locations" 
                value={`${species.localities.length} unique locations`} 
              />
            </CardContent>
          </Card>

          {/* Habitat Information */}
          <Card>
            <CardHeader>
              <CardTitle>Habitat & Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Habitats</h4>
                <div className="flex flex-wrap gap-2">
                  {species.habitats.map((habitat) => (
                    <Badge key={habitat} variant="secondary">
                      {habitat}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Water Bodies</h4>
                <div className="flex flex-wrap gap-2">
                  {species.waterBodies.map((waterBody) => (
                    <Badge key={waterBody} variant="outline">
                      {waterBody}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Countries</h4>
                <div className="flex flex-wrap gap-2">
                  {species.countries.map((country) => (
                    <Badge key={country} variant="default">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribution Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Distribution Map
          </CardTitle>
          <CardDescription>
            Known habitats and distribution of {species.scientificName}.
            {mapLoading && <span className="ml-2">Loading map data...</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{mapPoints.length} locations plotted</span>
              <span>{species.coordinates.length} total recorded coordinates</span>
            </div>
            
            <MapboxMap
              points={mapPoints}
              height="500px"
              clustered={true}
              style="mapbox://styles/mapbox/satellite-streets-v12"
              onPointClick={(point) => {
                console.log('Clicked point:', point);
              }}
            />
            
            {mapPoints.length === 0 && !mapLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No coordinate data available for mapping</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
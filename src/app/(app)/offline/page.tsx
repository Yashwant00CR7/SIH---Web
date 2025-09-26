import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Download, Waypoints } from "lucide-react";
import Image from "next/image";

export default function OfflinePage() {
  const mapImage = PlaceHolderImages.find((img) => img.id === "map");
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Offline Navigation
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waypoints className="w-6 h-6 text-primary" />
            Access Maps Anywhere
          </CardTitle>
          <CardDescription>
            Download maps for offline use to access critical information even
            without an internet connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border">
            {mapImage && (
              <Image
                src={mapImage.imageUrl}
                alt={mapImage.description}
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                data-ai-hint={mapImage.imageHint}
                className="opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="text-center p-4">
                <h3 className="text-xl font-bold">Offline Mode</h3>
                <p className="text-muted-foreground mt-2">
                  Last known fish hotspots and restricted zones are available.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Features available offline:</h3>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 text-sm">
              <li>Last known fish hotspot locations.</li>
              <li>Marked safe routes and restricted areas.</li>
              <li>Saved alerts and notifications.</li>
              <li>Personal catch log.</li>
            </ul>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Map for Your Region
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

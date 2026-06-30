import Link from "next/link";
import { ArrowRight, Camera, QrCode, Users, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "Scan & Join",
    description: "Guests scan a unique QR code to instantly join your event gallery — no app download required.",
  },
  {
    icon: Camera,
    title: "Share Moments",
    description: "Upload photos from any device. Drag, drop, or tap to share your perspective of the celebration.",
  },
  {
    icon: Users,
    title: "Virtual Folders",
    description: "Photos are organized by uploader, making it easy to find everyone's contributions.",
  },
  {
    icon: ImageIcon,
    title: "Live Gallery",
    description: "A beautiful masonry gallery updates in real-time as guests upload throughout the event.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-secondary">
              Sweet Basil Catering
            </p>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Capture Every Moment of Your Celebration
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              EventConnect brings your guests together through shared photo galleries.
              Scan, upload, and relive your special day — beautifully.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/events">
                <Button size="lg" className="gap-2">
                  Browse Events <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary">How It Works</h2>
          <p className="mt-3 text-muted-foreground">Simple, elegant, and designed for celebrations</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold">Ready to Connect Your Event?</h2>
          <p className="mt-4 opacity-90">
            Whether you&apos;re a guest with a QR code or an organizer managing celebrations,
            EventConnect makes photo sharing effortless.
          </p>
          <Link href="/contact" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">Contact Sweet Basil</Button>
          </Link>
        </div>
      </section>
    </>
  );
}

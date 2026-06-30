"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll be in touch soon.");
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-primary">Contact Us</h1>
      <p className="mt-4 text-muted-foreground">
        Interested in EventConnect for your next celebration? Get in touch with Sweet Basil Catering.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={5} className="mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">events@sweetbasilcatering.com</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <Phone className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">0967 294 8848</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted-foreground">Serving celebrations nationwide</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

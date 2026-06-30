import Link from "next/link";
import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Camera className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-semibold text-primary">Sweet Basil EventConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium event photo sharing for unforgettable celebrations.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/events" className="hover:text-primary">Events</Link></li>
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Sweet Basil Catering</h4>
            <p className="text-sm text-muted-foreground">
              Crafting memorable culinary experiences for weddings, corporate events, and private celebrations.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sweet Basil Catering. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

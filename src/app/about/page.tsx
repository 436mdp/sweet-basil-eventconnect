import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-primary">About EventConnect</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Sweet Basil EventConnect is a premium photo-sharing platform designed exclusively for
        Sweet Basil Catering events.
      </p>

      <div className="mt-12 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Every celebration tells a story through countless perspectives. EventConnect ensures
              that no moment goes uncaptured by giving every guest an easy way to contribute
              their photos to a shared, beautifully organized gallery.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Event Organizers</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Create events in minutes, generate QR codes automatically, and manage your
              gallery from a powerful admin dashboard. Track uploads, monitor participation,
              and download all photos when the celebration ends.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Guests</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              No account required. Simply scan the QR code at your table, enter your name,
              and start sharing. Browse photos from other guests organized in virtual folders
              by uploader name.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

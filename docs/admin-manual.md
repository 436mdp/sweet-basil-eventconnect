# Admin Manual

## Accessing the Admin Dashboard

1. Register an account at `/register`
2. Have your role set to admin (see Installation Guide)
3. Navigate to `/admin`

## Dashboard Overview

The admin dashboard shows:
- **Statistics cards** — Total events, active events, users, guests, photos
- **Upload Activity chart** — Daily upload counts (30 days)
- **Participation chart** — Daily join counts (30 days)
- **Recent Events** — Latest 5 events
- **Recent Uploads** — Latest 5 photo uploads

## Managing Events

Navigate to **Admin → Events** (`/admin/events`).

### Creating an Event

1. Fill in the **Create Event** form:
   - **Event Name** — Display name
   - **Description** — Optional details
   - **Event Date** — Date and time
   - **Venue** — Location
   - **Cover Image URL** — Optional hero image
   - **Status** — Upcoming, Active, or Closed
2. Click **Create Event**
3. A unique QR code is generated automatically
4. Download the QR code and print/display at the venue

### Event Statuses

| Status | Meaning |
|--------|---------|
| Upcoming | Event not yet started; guests cannot join |
| Active | Event is live; guests can join and upload |
| Closed | Event ended; no new uploads |

**Important:** Set events to **Active** before guests arrive so QR codes work.

### QR Codes

Each event gets a unique QR code linking to `/join/{slug}`.

- **Download QR Code** — Save as PNG for printing
- Share the join URL directly if needed

### Editing Events

Update any field in the event form (future enhancement: inline edit per event).

### Closing an Event

Click **Close Event** to stop new uploads. Existing photos remain viewable.

### Deleting an Event

Click **Delete Event** — this permanently removes the event and all associated photos. This cannot be undone.

## Managing Users

Navigate to **Admin → Users** (`/admin/users`).

- View all registered users with email, name, join date, and role
- Toggle between **Admin** and **User** roles
- Use "Make Admin" / "Make User" buttons

## Managing Uploads

Navigate to **Admin → Uploads** (`/admin/uploads`).

- View the 50 most recent uploads across all events
- See uploader name, event, timestamp, and file size
- Download individual photos

## Best Practices

### Before the Event
1. Create the event with status **Upcoming**
2. Add cover image and venue details
3. Test the QR code with your phone
4. Print QR codes for tables/entrance

### During the Event
1. Change status to **Active** when guests arrive
2. Monitor uploads on the dashboard
3. Check participation chart for engagement

### After the Event
1. Change status to **Closed**
2. Download photos from the Uploads page
3. Review analytics for post-event reporting

## Analytics API

Admins can also fetch analytics programmatically:

```
GET /api/analytics
```

Returns stats, upload activity, and participation data.

## Security Notes

- Never share your admin credentials
- Limit admin role to trusted staff only
- Service role key should never be exposed
- Review user list periodically

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access /admin | Verify your profile role is `admin` in Supabase |
| QR code shows error | Check event status is `active` |
| No uploads appearing | Verify storage bucket exists and event is active |
| Google login fails | Check OAuth redirect URLs in Supabase |

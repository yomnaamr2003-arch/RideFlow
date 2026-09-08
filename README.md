# RideFlow — Ride Booking UI

A modern, responsive ride-booking interface built for the **Ride Booking UI** internship task.

The project focuses on an interactive map, pickup/drop-off selection, distance-based fare estimates, geolocation, and a simulated real-time ride state — all in vanilla HTML, CSS, and JavaScript.

## ✨ Features

- Interactive **Leaflet + OpenStreetMap** map
- Click the map to select pickup and drop-off points
- Search locations using the **Nominatim** geocoding API through `fetch()`
- Browser geolocation button for current-location pickup
- Haversine distance calculation between two coordinates
- Estimated ride duration based on trip distance
- Three ride types:
  - Go
  - Comfort
  - XL
- Dynamic fare calculation
- Simulated ride lifecycle:
  - Requested
  - Driver en route
  - Driver arrived
- Responsive desktop/tablet/mobile layout
- Clear route and cancel-demo controls
- No backend or payment processing required

## 🗂️ Files

```text
ride-booking-ui/
├── index.html
├── styles.css
├── app.js
├── README.md
├── TASK-REPORT.md
└── linkedin-post.md
```

## 🚀 Run locally

Because the project uses browser geolocation and external map/geocoding services, the easiest option is to run it through a local server.

### Option 1 — VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Option 2 — Python

From the project directory:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## 🗺️ How to use

1. Click anywhere on the map to set **Pickup**.
2. Click again to set **Drop-off**.
3. Or search for locations in the two input fields.
4. Choose Go, Comfort, or XL.
5. Review the estimated distance, duration, and fare.
6. Click **Request ride**.
7. Watch the simulated status transition from requested → en route → arrived.

## 💰 Fare logic

The fare is intentionally approximate for the internship task.

```text
fare = base fare + (distance × per-km rate) + (duration × per-minute rate)
```

Distance is calculated with the **Haversine formula**, which estimates the great-circle distance between two latitude/longitude points.

## 🌐 External services

- **Leaflet** — interactive map library
- **OpenStreetMap** — map tiles
- **Nominatim** — location search/geocoding

No API key is required for this demo.

> For production use, review the usage policies and rate limits of OpenStreetMap/Nominatim and use a dedicated routing/geocoding provider where appropriate.

## 🎯 Internship brief coverage

| Requirement | Implementation |
|---|---|
| Map with pickup/drop-off selection | Leaflet map click interaction |
| Fare estimate based on distance | Haversine + fare formula |
| Simulated driver assignment and ETA | Timed JavaScript state machine |
| Ride status updates | Requested → En route → Arrived |
| Mapping library | Leaflet |
| Fetch API | Nominatim geocoding |
| Geolocation | Browser Geolocation API |
| Responsive UI | CSS media queries |

## ⚠️ Notes

This is a front-end simulation. It does not:
- process payments,
- create real ride requests,
- assign an actual driver,
- calculate turn-by-turn road distance,
- provide production-grade routing.

For a production application, replace the straight-line distance calculation with a routing API and move ride/driver state to a backend or real-time service.

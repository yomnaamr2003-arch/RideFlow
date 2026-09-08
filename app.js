const state = {
  pickup: null,
  dropoff: null,
  selectedRide: "Go",
  distanceKm: 0,
  durationMin: 0,
  statusTimer: null,
  statusIndex: -1
};

const rides = {
  Go: { base: 2.2, km: 0.92, minute: 0.18 },
  Comfort: { base: 3.4, km: 1.28, minute: 0.22 },
  XL: { base: 4.8, km: 1.65, minute: 0.27 }
};

const map = L.map("map", { zoomControl: false }).setView([31.2001, 29.9187], 12);
L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let pickupMarker = null;
let dropoffMarker = null;
let routeLine = null;

const pickupInput = document.getElementById("pickupInput");
const dropoffInput = document.getElementById("dropoffInput");
const bookBtn = document.getElementById("bookBtn");
const toast = document.getElementById("toast");

function markerIcon(type) {
  const color = type === "pickup" ? "#ff6b35" : "#18263d";
  return L.divIcon({
    className: "custom-pin",
    html: `<span style="display:block;width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 6px 15px rgba(0,0,0,.2);transform:rotate(-45deg);"><i style="display:block;width:6px;height:6px;border-radius:50%;background:#fff;margin:6px auto;"></i></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function prettyLocation(lat, lng) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function calculateTrip() {
  if (!state.pickup || !state.dropoff) {
    state.distanceKm = 0;
    state.durationMin = 0;
    return;
  }

  // Straight-line distance is intentionally used for this lightweight demo.
  state.distanceKm = haversineKm(state.pickup, state.dropoff);
  state.durationMin = Math.max(4, Math.round((state.distanceKm / 27) * 60 + 3));
}

function calculateFare(ride) {
  if (!state.pickup || !state.dropoff) return null;
  const trip = rides[ride];
  const subtotal = trip.base + state.distanceKm * trip.km + state.durationMin * trip.minute;
  return Math.max(subtotal, trip.base + 1);
}

function updateUI() {
  calculateTrip();

  document.getElementById("distanceValue").textContent = state.distanceKm ? state.distanceKm.toFixed(1) : "—";
  document.getElementById("durationValue").textContent = state.durationMin || "—";

  Object.keys(rides).forEach(type => {
    const fare = calculateFare(type);
    document.getElementById(`price-${type}`).textContent = fare ? `$${fare.toFixed(2)}` : "$—";
  });

  const selectedFare = calculateFare(state.selectedRide);
  document.getElementById("fareAmount").textContent = selectedFare ? `$${selectedFare.toFixed(2)}` : "$—";
  bookBtn.disabled = !(state.pickup && state.dropoff);
}

function setPoint(type, latlng, label = null) {
  state[type] = { lat: latlng.lat, lng: latlng.lng };

  const isPickup = type === "pickup";
  const marker = isPickup ? pickupMarker : dropoffMarker;
  const newMarker = marker || L.marker(latlng, { icon: markerIcon(type) }).addTo(map);

  if (isPickup) pickupMarker = newMarker;
  else dropoffMarker = newMarker;

  newMarker.setLatLng(latlng);
  newMarker.bindTooltip(isPickup ? "Pickup" : "Drop-off", { direction: "top", offset: [0, -12] });

  const input = isPickup ? pickupInput : dropoffInput;
  input.value = label || prettyLocation(latlng.lat, latlng.lng);

  document.getElementById(isPickup ? "pickupMini" : "dropoffMini").textContent = input.value;
  drawRoute();
  updateUI();
}

function drawRoute() {
  if (routeLine) map.removeLayer(routeLine);
  if (!state.pickup || !state.dropoff) return;

  routeLine = L.polyline(
    [[state.pickup.lat, state.pickup.lng], [state.dropoff.lat, state.dropoff.lng]],
    { color: "#ff6b35", weight: 4, opacity: .8, dashArray: "9 8" }
  ).addTo(map);

  const bounds = L.latLngBounds(
    [state.pickup.lat, state.pickup.lng],
    [state.dropoff.lat, state.dropoff.lng]
  );
  map.fitBounds(bounds.pad(.25), { animate: true, duration: .5 });
}

map.on("click", (event) => {
  if (!state.pickup || (state.pickup && state.dropoff)) {
    setPoint("pickup", event.latlng);
    if (state.dropoff) clearPoint("dropoff", false);
    showToast("Pickup selected. Now choose your destination.");
  } else {
    setPoint("dropoff", event.latlng);
    showToast("Drop-off selected. Your fare is ready.");
  }
});

function clearPoint(type, resetInput = true) {
  if (type === "pickup" && pickupMarker) {
    map.removeLayer(pickupMarker);
    pickupMarker = null;
    state.pickup = null;
    if (resetInput) pickupInput.value = "";
    document.getElementById("pickupMini").textContent = "Choose a point";
  }

  if (type === "dropoff" && dropoffMarker) {
    map.removeLayer(dropoffMarker);
    dropoffMarker = null;
    state.dropoff = null;
    if (resetInput) dropoffInput.value = "";
    document.getElementById("dropoffMini").textContent = "Choose a point";
  }

  drawRoute();
  updateUI();
}

document.getElementById("clearBtn").addEventListener("click", () => {
  clearPoint("pickup");
  clearPoint("dropoff");
  showToast("Route cleared.");
});

document.querySelectorAll(".ride-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".ride-option").forEach(item => item.classList.remove("active"));
    option.classList.add("active");
    state.selectedRide = option.dataset.type;
    updateUI();
  });
});

async function geocode(query, target) {
  const status = document.getElementById("searchStatus");
  if (!query.trim()) return;

  status.textContent = "Searching location…";
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) throw new Error("Search unavailable");
    const results = await response.json();

    if (!results.length) {
      status.textContent = "No matching location found. Try a nearby landmark or area.";
      return;
    }

    const result = results[0];
    const point = { lat: Number(result.lat), lng: Number(result.lon) };
    setPoint(target, point, result.display_name.split(",").slice(0, 2).join(","));
    map.setView(point, 14);
    status.textContent = "";
  } catch (error) {
    status.textContent = "Location search is unavailable. You can still click directly on the map.";
  }
}

document.getElementById("pickupSearchBtn").addEventListener("click", () => geocode(pickupInput.value, "pickup"));
document.getElementById("dropoffSearchBtn").addEventListener("click", () => geocode(dropoffInput.value, "dropoff"));

pickupInput.addEventListener("keydown", e => {
  if (e.key === "Enter") geocode(pickupInput.value, "pickup");
});
dropoffInput.addEventListener("keydown", e => {
  if (e.key === "Enter") geocode(dropoffInput.value, "dropoff");
});

document.getElementById("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by this browser.");
    return;
  }

  showToast("Requesting your location…");
  navigator.geolocation.getCurrentPosition(
    position => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      map.setView(point, 15);
      setPoint("pickup", point, "Current location");
      showToast("Current location set as pickup.");
    },
    () => showToast("Location permission was denied or unavailable.")
  );
});

const statusData = [
  { title: "Finding your driver…", progress: 12, eta: "3 min", index: 0 },
  { title: "Driver is on the way", progress: 58, eta: "2 min", index: 1 },
  { title: "Driver has arrived", progress: 100, eta: "Now", index: 2 }
];

function updateStatus(step) {
  const data = statusData[step];
  document.getElementById("statusTitle").textContent = data.title;
  document.getElementById("progressBar").style.width = `${data.progress}%`;
  document.getElementById("eta").textContent = data.eta;

  ["statusStep1", "statusStep2", "statusStep3"].forEach((id, i) => {
    document.getElementById(id).classList.toggle("current", i <= step);
  });
}

function startRideSimulation() {
  clearInterval(state.statusTimer);
  state.statusIndex = 0;
  document.getElementById("statusCard").classList.remove("hidden");
  updateStatus(0);
  showToast("Ride requested. Finding a nearby driver…");

  const driverNames = ["Jordan D.", "Sam K.", "Alex M."];
  const cars = ["Toyota Prius · A 4821", "Kia K5 · B 1934", "Hyundai Elantra · C 7620"];
  const pick = Math.floor(Math.random() * driverNames.length);
  document.getElementById("driverName").textContent = driverNames[pick];
  document.getElementById("driverCar").textContent = cars[pick];
  document.getElementById("driverAvatar").textContent = driverNames[pick].split(" ").map(x => x[0]).join("");

  state.statusTimer = setInterval(() => {
    state.statusIndex += 1;
    updateStatus(state.statusIndex);
    if (state.statusIndex >= statusData.length - 1) {
      clearInterval(state.statusTimer);
      showToast("Your driver has arrived.");
    } else {
      showToast(statusData[state.statusIndex].title);
    }
  }, 5000);
}

bookBtn.addEventListener("click", startRideSimulation);

document.getElementById("cancelBtn").addEventListener("click", () => {
  clearInterval(state.statusTimer);
  document.getElementById("statusCard").classList.add("hidden");
  showToast("Demo ride cancelled.");
});

updateUI();

const API_KEY = "at_SFgGuZf3sVDMu1sJ8vwAQl46HbNjA";
const API_URL = "https://geo.ipify.org/api/v2/country,city";

const initialPosition = {
  lat: 40.7128,
  lng: -74.006,
};

const mapElement = document.querySelector("#map");
const searchForm = document.querySelector(".search");
const searchInput = document.querySelector("#search-query");
const searchStatus = document.querySelector("#search-status");

const details = {
  ipAddress: document.querySelector("#ip-address"),
  location: document.querySelector("#location"),
  timezone: document.querySelector("#timezone"),
  isp: document.querySelector("#isp"),
};

const locationIcon = L.icon({
  iconUrl: "./images/icon-location.svg",
  iconSize: [46, 56],
  iconAnchor: [23, 56],
});

const map = L.map(mapElement, {
  zoomControl: true,
  scrollWheelZoom: false,
}).setView([initialPosition.lat, initialPosition.lng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const marker = L.marker([initialPosition.lat, initialPosition.lng], {
  icon: locationIcon,
}).addTo(map);

function updateMapPosition({ lat, lng }) {
  map.setView([lat, lng], 13);
  marker.setLatLng([lat, lng]);
}

function buildApiUrl(query = "") {
  const url = new URL(API_URL);

  url.searchParams.set("apiKey", API_KEY);

  if (!query) {
    return url;
  }

  const searchType = /[a-z]/i.test(query) ? "domain" : "ipAddress";
  url.searchParams.set(searchType, query);

  return url;
}

function formatLocation({ city, region, postalCode }) {
  return [city, region, postalCode].filter(Boolean).join(", ");
}

function updateDetails(data) {
  details.ipAddress.textContent = data.ip;
  details.location.textContent = formatLocation(data.location) || "Not available";
  details.timezone.textContent = `UTC ${data.location.timezone}`;
  details.isp.textContent = data.isp;
}

function showErrorDetails() {
  details.ipAddress.textContent = "Not found";
  details.location.textContent = "Not available";
  details.timezone.textContent = "Not available";
  details.isp.textContent = "Not available";
}

async function getIpDetails(query) {
  searchStatus.textContent = "Searching for IP address details";

  try {
    const response = await fetch(buildApiUrl(query));

    if (!response.ok) {
      throw new Error("Could not find location data for that search.");
    }

    const data = await response.json();

    updateDetails(data);
    updateMapPosition({
      lat: data.location.lat,
      lng: data.location.lng,
    });

    searchStatus.textContent = `Showing location details for ${data.ip}`;
  } catch (error) {
    showErrorDetails();
    searchStatus.textContent = error.message;
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  getIpDetails(searchInput.value.trim());
});

getIpDetails();

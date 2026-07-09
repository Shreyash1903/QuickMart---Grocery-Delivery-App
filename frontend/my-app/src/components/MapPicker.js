import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import { toast } from "react-toastify";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom location icon
const locationIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function reverseGeocode(lat, lng) {
  try {
    console.log("🔍 Reverse geocoding:", lat, lng);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuickCart-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📍 Reverse geocode response:", data);
    
    return data;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw error;
  }
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("📍 Location obtained:", position.coords.latitude, position.coords.longitude);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please allow location access in your browser settings";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = error.message;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

function LocationMarker({ onLocationSelect, initialPosition, currentLocation, setCurrentLocation }) {
  const [position, setPosition] = useState(
    initialPosition || [18.5204, 73.8567]
  );

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      console.log("🗺️ Map clicked:", lat, lng);

      setPosition([lat, lng]);
      setCurrentLocation && setCurrentLocation({ lat, lng });

      try {
        const data = await reverseGeocode(lat, lng);
        
        if (data && data.address) {
          console.log("✅ Address found:", data.address);
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: data.address || {},
            displayName: data.display_name || "",
          });
        } else {
          // Fallback: send coordinates only
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: {},
            displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
        }
      } catch (error) {
        console.error("Error getting address:", error);
        // Send coordinates even if reverse geocoding fails
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: {},
          displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      }
    },
  });

  // Update position when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      setPosition([currentLocation.lat, currentLocation.lng]);
    }
  }, [currentLocation]);

  return <Marker position={position} icon={locationIcon} />;
}

export default function MapPicker({ 
  onLocationSelect, 
  initialPosition,
  showLocationButton = true 
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialPosition || [18.5204, 73.8567]);
  const [mapKey, setMapKey] = useState(0);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const location = await getCurrentLocation();
      console.log("📍 Current location:", location);
      
      setCurrentLocation({ lat: location.lat, lng: location.lng });
      setMapCenter([location.lat, location.lng]);
      setMapKey(prev => prev + 1);

      // Reverse geocode to get address
      try {
        const data = await reverseGeocode(location.lat, location.lng);
        console.log("✅ Geocode response:", data);
        
        if (data && data.address) {
          onLocationSelect({
            latitude: location.lat,
            longitude: location.lng,
            address: data.address || {},
            displayName: data.display_name || "",
          });
          toast.success("📍 Location detected successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // Fallback: send coordinates only
          onLocationSelect({
            latitude: location.lat,
            longitude: location.lng,
            address: {},
            displayName: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          });
          toast.info("📍 Location coordinates detected", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (geocodeError) {
        console.error("Geocode error:", geocodeError);
        // Send coordinates only
        onLocationSelect({
          latitude: location.lat,
          longitude: location.lng,
          address: {},
          displayName: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
        });
        toast.info("📍 Location coordinates detected", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Location error:", error);
      toast.error(`❌ ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="map-picker-wrapper">
      <div className="map-container">
        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={15}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            onLocationSelect={onLocationSelect}
            initialPosition={initialPosition}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
          />
        </MapContainer>

        {/* Location Button */}
        {showLocationButton && (
          <button
            className="location-btn"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <span className="location-spinner"></span>
                Detecting...
              </>
            ) : (
              <>
                <i className="bi bi-geo-alt-fill"></i>
                Use My Current Location
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
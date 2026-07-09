export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          resolve({
            latitude,
            longitude,
            address: data.address,
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(error.message);
      },
      {
        enableHighAccuracy: true,
      }
    );
  });
};
import { useEffect } from 'react';

export default function Map() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.initMap = function () {
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: -25.2744, lng: 133.7751 }
      });

      fetch('/api/properties')
        .then(r => r.json())
        .then(rows => {
          rows.forEach(row => {
            if (!row.Coordinates) return;
            const [lat, lng] = row.Coordinates.split(',').map(Number);
            new google.maps.Marker({ position: { lat, lng }, map });
          });
        });
    };
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <h2>Property Map</h2>
      <div id='map' style={{ height: '90vh' }}></div>
      <script async src={'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + '&callback=initMap'}></script>
    </div>
  );
}

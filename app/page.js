export default function Home() {
  const properties = [
    {
      "Site Name": "Rockdale Depot",
      "Entity": "NSW State Transit",
      "Suburb / Town": "Rockdale",
      "Coordinates": "-33.9500,151.1380"
    },
    {
      "Site Name": "Melbourne HQ",
      "Entity": "VIC Transport",
      "Suburb / Town": "Melbourne",
      "Coordinates": "-37.8136,144.9631"
    },
    {
      "Site Name": "Adelaide Hub",
      "Entity": "SA Transport",
      "Suburb / Town": "Adelaide",
      "Coordinates": "-34.9285,138.6007"
    }
  ];

  return (
    <html lang="en">
      <head>
        <script
          async
          src={
            "https://maps.googleapis.com/maps/api/js?key=" +
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY +
            "&callback=initMap"
          }
        ></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.initMap = function () {
                const map = new google.maps.Map(document.getElementById("map"), {
                  zoom: 4,
                  center: { lat: -27, lng: 135 }
                });

                const properties = [{"Site Name":"Rockdale Depot","Entity":"NSW State Transit","Suburb / Town":"Rockdale","Coordinates":"-33.9500,151.1380"},{"Site Name":"Melbourne HQ","Entity":"VIC Transport","Suburb / Town":"Melbourne","Coordinates":"-37.8136,144.9631"},{"Site Name":"Adelaide Hub","Entity":"SA Transport","Suburb / Town":"Adelaide","Coordinates":"-34.9285,138.6007"}];

                properties.forEach(p => {
                  if (!p.Coordinates) return;
                  const [lat, lng] = p.Coordinates.split(",").map(Number);

                  new google.maps.Marker({
                    position: { lat, lng },
                    map,
                    title: p["Site Name"]
                  });
                });
              };
            `
          }}
        />
      </head>

      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <div style={{ padding: "30px" }}>
          <h1 style={{ marginBottom: "10px" }}>Sheets2Maps Mockup</h1>
          <p>This is a static demo using mock property data.</p>
        </div>

        <div
          id="map"
          style={{
            width: "100%",
            height: "75vh",
            borderTop: "3px solid #eee"
          }}
        ></div>
      </body>
    </html>
  );
}
import { Wrapper } from '@googlemaps/react-wrapper';
import { useEffect, useState, useRef } from 'react';

// set coordinates for the first loading of the map
const START_LOCATION = {
  lat: 53.7473,
  lng: -3.0327
};

// function to convert degrees to compass points
function formatBearing(degrees) {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(normalizedDegrees / 22.5) % 16;
  return `${directions[index]} (${normalizedDegrees.toFixed(1)}°)`;
}

// function to draw the map
function Map({ google }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchValue, setSearchValue] = useState('');

// check if user is on a mobile, or a larger screen, and recheck if the screen is resized
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

// set up the map
  useEffect(() => {
    if (mapRef.current && google) {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: START_LOCATION,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
      });
      setMap(mapInstance);
    }
  }, [google]);

// listen for clicks on the map and make a note of their location
  useEffect(() => {
    if (map && google) {
      const clickListener = map.addListener('click', (event) => {
        const clickedPoint = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        console.log('Clicked point:', clickedPoint);
        
        setPoints(prev => {
          const newPoints = prev.length === 0 ? [clickedPoint] : 
                           prev.length === 1 ? [prev[0], clickedPoint] : 
                           [clickedPoint];
          console.log('New points array:', newPoints);
          return newPoints;
        });
      });

      return () => google.maps.event.removeListener(clickListener);
    }
  }, [map, google]);

// when there are two points, draw a line between them
  useEffect(() => {
    if (map && google && points.length > 0) {
      // delete the old line, if there is one
      if (polyline) {
        polyline.setMap(null);
      }

      // create a new line, where there are two points to draw between
      if (points.length === 2) {
    
        const newPolyline = new google.maps.Polyline({
          path: points,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });

        newPolyline.setMap(map);
        setPolyline(newPolyline);
      }
    }
  }, [points, map, google]);

    // calculate the measurements between the two points
    useEffect(() => {
    if (points.length === 2 && google) {
        const point1 = new google.maps.LatLng(points[0].lat, points[0].lng);
        const point2 = new google.maps.LatLng(points[1].lat, points[1].lng);
        
        // calculate distance
        const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
        setDistance(distanceInMeters);
        
        // calculate the bearing
        const bearingInDegrees = google.maps.geometry.spherical.computeHeading(point1, point2);
        setBearing(bearingInDegrees);
        
        console.log('Distance:', distanceInMeters, 'meters');
        console.log('Bearing:', bearingInDegrees, 'degrees');
    } else {
        setDistance(null);
        setBearing(null);
    }
    }, [points, google]);

    // add google's markers, which are now out of date but work better than the new ones
    useEffect(() => {
    if (map && google && points.length > 0) {
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers = points.map((point, index) => {
        return new google.maps.Marker({
            position: point,
            map: map,
            title: index === 0 ? 'Start Point' : 'End Point',
            label: index === 0 ? 'A' : 'B'
        });
        });
        
        setMarkers(newMarkers);
    }
    }, [points, map, google]);

// search tool
    const handleSearch = () => {
            if (!searchValue.trim() || !google || !map) return;

            // check if places library is loaded
            if (!google.maps.places) {
                alert('Places library not loaded yet. Please try again in a moment.');
                return;
            }

            const service = new google.maps.places.PlacesService(map);
            
            // handle the search query
            service.textSearch({
            query: searchValue
            }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                const place = results[0];
                const location = place.geometry.location;
                
                // find the location and zoom in
                map.setCenter(location);
                map.setZoom(12);
                
            } else {
                // error if the search didn't return a location
                alert('Location not found. Try searching for a town, city, or landmark.');
            }
            });
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
            handleSearch();
            }
        };

// get the user's current location
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // center map on user's location
            map.setCenter(userLocation);
            map.setZoom(14);
            
            console.log('User location:', userLocation);
            },
            (error) => {
            console.error('Error getting location:', error);
            alert('Unable to get your location. Please check your browser permissions.');
            }
        );
        };

// clear the points, line, markers and calculations
    const handleClearPoints = () => {
    // delete the points
    setPoints([]);
    
    // remove line if there is one
    if (polyline) {
        polyline.setMap(null);
        setPolyline(null);
    }
    
    // remove A and B markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    // reset distance and bearing
    setDistance(null);
    setBearing(null);
    
    console.log('Points cleared');
    };

// put it all together.... 

    return (
    <div>

    {/* draw the search box */}
        <div className="search-container">
            <div className="search-input">
            <input
                type="text"
                placeholder="Search map"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input-text"
            />
            <button 
                onClick={handleSearch}
                className="search-input-button"
            >
                Search
            </button>

            <button 
                onClick={handleGetLocation}
                className="search-input-button"
            >
                Find me
            </button>
            </div>
        </div>

    {/* draw the map */}
      <div ref={mapRef} className="map-container" />
    
    {/* write the instructions */}
        {points.length === 0 && (
            <div className="instructions-container">
                <p>Choose a start point on the map</p>
            </div>
        )}

        {points.length === 1 && (
            <div className="instructions-container">
                <p>Choose an end point</p>
            </div>
        )}

    {/* write the instructions, on one line on desktop or on two if mobile */}

        {distance && bearing !== null && (
        <div className="results-container">
            <p><strong>Distance:</strong> {distance.toFixed(0)} metres 
            {!isMobile && " | " } 
            {isMobile &&  <br /> }
            <strong>Direction:</strong> {formatBearing(bearing)}</p>
            <p><button 
                onClick={handleClearPoints}
                className="clear-button"
                >
                Clear
                </button></p>
        </div>
        )}

    </div>
    );
}

function MapComponent() {
  const render = (status) => {
    if (status === 'LOADING') return <div className="error-box">Loading map...</div>;
    if (status === 'FAILURE') return <div className="error-box">Couldn't load the map</div>;
    if (status === 'SUCCESS') {
      return <Map google={window.google} />;
    }
    return <h3>Map not ready</h3>;
  };

    return (
    <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={['places', 'geometry']} 
        render={render}
    />
    );
}

export default MapComponent;
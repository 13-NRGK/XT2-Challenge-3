// Set api token
	mapboxgl.accessToken = 'pk.eyJ1Ijoibm9ydmllbm5lIiwiYSI6ImNrbXdrNmYwODBlOTgycHBmMnZyZDI1ZTIifQ.KjEe4eMX_vnaBu3nah_4ig';

// Api token for openWeatherMap
	var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather';
	var openWeatherMapUrlApiKey = 'c23442db12d854ef4c35a3fb7f4fdf4c';

// Initialate map
	var map = new mapboxgl.Map({
	  container: 'map',
	  style: 'mapbox://styles/mapbox/dark-v10',
	  center:[-96, 37.8], 
	  zoom: 3
	});

	
// Get weather data and plot on map
	map.on('load', function () {
  		cities.forEach(function(city) {
  			var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&lon=' + city.coordinates[0] + '&lat=' + city.coordinates[1];
  			
  			fetch(request)
  			.then(function(response){
  				if(!response.ok) throw Error(response.statusText);
			      return response.json();
			    })

			    .then(function(response) {
			      // plot de weather response + icoon op de map (verwijst naar functie plotImageOnMap)
			      plotImageOnMap(response.weather[0].icon, city)
			    })

			    .catch(function (error) {
			      console.log('ERROR:', error);
			    });

		});

	});

	function plotImageOnMap(icon, city) {
		map.loadImage(
    		'http://openweathermap.org/img/w/' + icon + '.png',
    		function (error, image) {
		      	if (error) throw error;
		      	map.addImage("weatherIcon_" + city.name, image);
		      	map.addSource("point_" + city.name, {
			        type: "geojson",
			        data: {
			         	type: "FeatureCollection",
			         		features: [{
				            type: "Feature",
				            geometry: {
			              		type: "Point",
			              		coordinates: city.coordinates
		            		}
		         	 	}]
		        	}
		      	});

		      	map.addLayer({
			        id: "points_" + city.name,
			        type: "symbol",
			        source: "point_" + city.name,
			        layout: {
			          "icon-image": "weatherIcon_" + city.name,
			          "icon-size": 1.7
			        }
		     	});
		    }
		);
	}

map.on('load', function () {
  map.addSource('city', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': location
    }
  });

  // Add a layer showing the city.
  map.addLayer({
    'id': 'city',
    'type': 'symbol',
    'source': 'city',
    'layout': {
      'icon-image': '{icon}-15',
      'icon-allow-overlap': true
    }
  });

// Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'city', function (e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Populate the popup and set its coordinates based on the feature found.
    popup.setLngLat(coordinates)
         .setHTML(description)
         .addTo(map);
  });

  map.on('mouseleave', 'city', function () {
    popup.remove();
  });
});

var nav = new mapboxgl.NavigationControl();
	map.addControl(nav, 'top-right');
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


// Add directions to the map
	map.addControl(
		new MapboxDirections ({
			accessToken: mapboxgl.accessToken
		}),
		'top-left'
	);

// Add searchbar to the map
	map.addControl(
		new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			mapboxgl: mapboxgl
		}),
		'top-right'
	);

	
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
    		'https://openweathermap.org/img/w/' + icon + '.png',
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
			          "icon-size": 1.3
			        }
		     	});
		    }
		);
	}

function popupTekstMelding(){

  	map.on('load', function () {
 	map.addSource('places', {
	    'type': 'geojson',
	    'data': {
	      'type': 'FeatureCollection',
	      'features': popupText
	    }
  	});

	// Add a layer showing the places.
	map.addLayer({
	    'id': 'places',
	    'type': 'symbol',
	    'source': 'places',
	    'layout': {
	      'icon-image': '{icon}-15',
	      "icon-size": 1.7,
	      'icon-allow-overlap': true
	    }
	});

	var popup = new mapboxgl.Popup({
    closeButton: false, 
    closeOnClick: false 
  	});

  	map.on('mouseenter', 'places', function (e) {    //als je op de kaart over een van de places gaat, dan kom je bij deze functie terecht 
    //'e' = dataattribuut van de locatie waar je overheen hovert)
    var coordinates = e.features[0].geometry.coordinates.slice();   //haalt coordinator op van locatie 
    var description = e.features[0].properties.description; // haalt beschrijving van bij behorende locatie op

    
    popup     
      .setLngLat(coordinates) 
      .setHTML(description) 
      .addTo(map);  
  	});

	// haal popup weg als je weggaat met je muis   
	map.on('mouseleave', 'places', function () {
	    popup.remove();
	  });
  });
};

// zoom controls
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right')

popupTekstMelding();
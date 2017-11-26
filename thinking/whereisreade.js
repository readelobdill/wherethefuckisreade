let index = 0,
	allMarkers = [],
	backgroundMap,
	geocoder = new google.maps.Geocoder(),
	timer,
	currentMarker;

$.getJSON(
  'https://api.instagram.com/v1/users/7385787/media/recent?callback=?',
  {
    access_token:'7385787.1677ed0.ba90b88940024065ac5f1deab415f4c1',
    count: '33'
  },
  function(json){
    let data = _.filter(json.data, item => item.location);
    buildMap(data);
    panMap(allMarkers[index]);
  }
);


function buildMap(data) {
	let map_background = $('.fucking-map-background').get(0);

	let layer = "watercolor";
	let mapOptions = {
		zoom: 3,
		// disableDefaultUI: true,
		mapTypeId: layer,
		mapTypeControlOptions: {
		    mapTypeIds: [layer]
		},
		mapTypeControl: false,
    fullscreenControl: false
	}

	backgroundMap = new google.maps.Map(map_background, mapOptions);
  backgroundMap.addListener('dragstart', resetImage)
  backgroundMap.addListener('zoom_changed', resetImage)
	backgroundMap.mapTypes.set(layer, new google.maps.StamenMapType(layer));

	_.each(data, function(location, index){
		let coordinates = location.location;

		let marker = new google.maps.Marker({
			location: coordinates,
			imgUrl: location.images.standard_resolution.url,
			link: location.link,
			caption: location.caption ? location.caption.text : null,
			position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
			icon: 'photos/olivia-was-here.png'
		});

		google.maps.event.addListener(marker, "click", function() {
			buildImage(this);
		});

    if (marker.imgUrl) allMarkers.push(marker);
	});
  new MarkerClusterer(backgroundMap, allMarkers, {imagePath: 'photos/m'});
}

function resetImage(){
  $('.fucking-image').attr('src', '');
  $('.fucking-at').text('');
  $('.fucking-saying').text('');
}

function buildImage(marker) {
	let imgUrl = marker.imgUrl;
	let instagramLink = marker.link;
	currentMarker = marker;

	// marker.setIcon('photos/olivia-was-here.png');
  panMap(marker);
	// // Clear timer if it exists aka if we have hit query limit
	if (timer) clearTimeout(timer);
	setLocationText(marker.position);

	$('.fucking-image').attr('src', imgUrl);
	$('.fucking-instagram-link').attr('href', instagramLink);
	$('.fucking-saying').text(marker.caption).linkify();
}

function panMap(marker) {
  backgroundMap.panTo(new google.maps.LatLng(marker.location.latitude, marker.location.longitude));
}

function setLocationText(position){
	geocoder.geocode({'latLng': position}, function(results, status) {
	    if ( status === google.maps.GeocoderStatus.OK ) {
      		$('.fucking-at').text("At " + results[1] ? results[1].formatted_address : results[0].formatted_address);
      	// Must wait and try again if we have made too many requests
      	} else if ( status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT ) {
      		timer = setTimeout(() => {
      			setLocationText(position);
      		}, 1000);
      	} else {
      		throw new Error(status);
      	}
    });
}

let index = 0,
	allMarkers = [],
	backgroundMap,
	geocoder = new google.maps.Geocoder(),
	timer,
	currentMarker;

$.getJSON(
	'https://api.instagram.com/v1/users/490773256/media/recent?callback=?',
	{
		access_token:'490773256.1677ed0.1fad774a97e04b3a9dee64b541de87c3',
		count: '33'
	},
	function(json){
		let data = _.filter(json.data, item => item.location);
		buildMap(data);
		buildImage(allMarkers[index]);
	}
);

$('.go-fucking-left').on('vclick', function(){
	nextLocation();
});

$('.go-fucking-right').on('vclick', function(){
	previousLocation();
});

$(window).on('keydown', function(event){
	if(event.which === 37){
		nextLocation();
	} else if(event.which === 39){
		previousLocation();
	}
});

function previousLocation(){
	if(index < _.size(allMarkers) - 1 ){
		showLoadingImg();

		index++;
		buildImage(allMarkers[index]);
	}

	handleArrowStates();
}

function nextLocation(){
	if(index > 0){
		showLoadingImg();

		index--;
		buildImage(allMarkers[index]);
	}

	handleArrowStates();
}

function buildMap(data) {
	let map_canvas = $('.fucking-map-container').get(0);
	let map_background = $('.fucking-map-background').get(0);

	let layer = "watercolor";
	let mapOptions = {
		zoom: 5,
		disableDefaultUI: true,
		mapTypeId: layer,
		mapTypeControlOptions: {
		    mapTypeIds: [layer]
		},
		mapTypeControl: false,
		// must set to false for keydown location changes
		// when clicking on a location pin the map steals focus and keyboard events from the window
		keyboardShortcuts: false,
		// stop map zoom when scrolling over map
		scrollwheel: false
	}

	backgroundMap = new google.maps.Map(map_background, mapOptions);
	backgroundMap.mapTypes.set(layer, new google.maps.StamenMapType(layer));

	_.each(data, function(location, index){
		let coordinates = location.location;

		let marker = new google.maps.Marker({
			location: coordinates,
			imgUrl: location.images.standard_resolution.url,
			videoUrl: location.videos ? location.videos.standard_resolution.url : null,
			link: location.link,
			caption: location.caption ? location.caption.text : null,
			position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
			map: backgroundMap,
			icon: 'photos/transparent.png'
		});

		google.maps.event.addListener(marker, "click", function() {
			showLoadingImg();

			buildImage(this);
		});

		allMarkers.push(marker);
	});
}

function buildImage(marker) {
	let imgUrl = marker.imgUrl;
	let instagramLink = marker.link;
	currentMarker = marker;

	// build caption
	let captionStart = marker.caption;
	let captionEnd = index === 0 ? 'is what he is fucking saying.': 'is what he was fucking saying.';
	let caption = captionStart ? "'" + captionStart + "' " + captionEnd: "He wasn't saying anything.";

	marker.setIcon('photos/location-pin.png');
	backgroundMap.panTo(new google.maps.LatLng(marker.location.latitude - 7, marker.location.longitude));

	// Clear timer if it exists aka if we have hit query limit
	if (timer) clearTimeout(timer);
	setLocationText(marker.position);

	if (marker.videoUrl) {
		$('.fucking-video').attr('src', marker.videoUrl);
	} else {
		$('.fucking-image').attr('src', imgUrl);
	}
	$('.fucking-instagram-link').attr('href', instagramLink);
	$('.fucking-saying').text(caption).linkify();
}

function handleArrowStates(){
	let $rightArrow = $('.go-fucking-right');
	let $leftArrow = $('.go-fucking-left');

	$rightArrow.prop('disabled', false);
	$leftArrow.prop('disabled', false);

	if(index === 0){
		$leftArrow.prop('disabled', true);
	} else if(index >= _.size(allMarkers) - 1 ){
		$rightArrow.prop('disabled', true);
	}
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

function showLoadingImg(){
	$('.fucking-image').attr('src', '');
	$('.fucking-video').attr('src', '');
	$('.fucking-at').text('');
	currentMarker.setIcon('photos/transparent.png');
}

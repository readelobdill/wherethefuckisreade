let index = 0,
	data,
	allMarkers = [],
	map,
	backgroundMap,
	geocoder = new google.maps.Geocoder(),
	timer,
	currentMarker,
	gulo,
	brit;

$.when(
  // Get the HTML
  $.getJSON(
  	'https://api.instagram.com/v1/users/368603040/media/recent?callback=?',
  	{
  		access_token:'368603040.1677ed0.6518c9a316824703a8e74b41de8b9b01',
  		count: '33'
  	},
  	function(json){
		gulo = _.filter(json.data, item => item.location);
  	}
  ),

  $.getJSON(
  	'https://api.instagram.com/v1/users/258538248/media/recent?callback=?',
  	{
  		access_token:'258538248.1677ed0.dd79933fd1d44eb09da12ebfb7e67539',
  		count: '33'
  	},
  	function(json){
  		brit = _.filter(json.data, item => item.location);
  	}
  )

).then(function() {
	data = brit.concat(gulo);
	data.sort((a, b) => b.created_time - a.created_time);
	buildMap();
	buildImage(allMarkers[index]);
});

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

		changeText()
	}

	handleArrowStates();
}

function nextLocation(){
	if(index > 0){
		showLoadingImg();

		index--;
		buildImage(allMarkers[index]);

		changeText()
	}

	handleArrowStates();
}

function buildMap() {
	let map_canvas = $('.fucking-map-container').get(0);
	let map_background = $('.fucking-map-background').get(0);

	let layer = "watercolor";
	let mapOptions = {
		zoom: 11,
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

	map = new google.maps.Map(map_canvas, mapOptions);
	map.mapTypes.set(layer, new google.maps.StamenMapType(layer));

	let backgroundMapOptions = _.extend(mapOptions, {disableDefaultUI: true, zoom: 4})
	backgroundMap = new google.maps.Map(map_background, backgroundMapOptions);
	backgroundMap.mapTypes.set(layer, new google.maps.StamenMapType(layer));

	_.each(data, function(location, index){
		let coordinates = location.location;

		let marker = new google.maps.Marker({
			location: coordinates,
			imgUrl: location.images.standard_resolution.url,
			link: location.link,
			caption: location.caption ? location.caption.text: null,
			position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
			map: map
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
	let captionEnd = 'is what they were saying.';
	let caption = captionStart ? "'" + captionStart + "' " + captionEnd : "They weren't saying anything.";

	// marker.setIcon('photos/location-pin.png');
	map.panTo(new google.maps.LatLng(marker.location.latitude, marker.location.longitude));
	backgroundMap.panTo(new google.maps.LatLng(marker.location.latitude, marker.location.longitude));
	// marker.setAnimation(google.maps.Animation.DROP);

	// Clear timer if it exists aka if we have hit query limit
	if (timer) clearTimeout(timer);
	setLocationText(marker.position);

	$('.fucking-image').attr('src', imgUrl);
	$('.fucking-instagram-link').attr('href', instagramLink);
	$('.fucking-saying').text(caption).linkify();
}

function changeText(){
	if(index === 0){
		$('.right-fucking-here').text('brit and gulo are right here.');
		$('.fucking-looking-at').text('they are looking at this.');
	} else {
		$('.right-fucking-here').text('brit and gulo were right here.');
		$('.fucking-looking-at').text('they were looking at.');
	}
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
	$('.fucking-at').text('');
	// currentMarker.setIcon('photos/location-dot.png');
}
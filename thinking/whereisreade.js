(function(){

	var index = 0,
		data,
		allMarkers = [],
		map;


	var initialize = function() {
		$.getJSON(
			'https://api.instagram.com/v1/users/490773256/media/recent/?client_id=fc3bba8db3dd42b7bfda1e3aa92b3a86&count=-1&callback=?',
			{access_token:'490773256.fc3bba8.0bb01a7762694dc081b239114063af32'},
			function(json){
				data = json.data;

				buildMap();
				buildImage(allMarkers[index]);
			}
		);

		$('.go-fucking-left').on('click', function(){
			previousLocation();
		});

		$('.go-fucking-right').on('click', function(){
			nextLocation();
		});

		$(window).on('keydown', function(event){
			if(event.which === 37){
				previousLocation();
			} else if(event.which === 39){	
				nextLocation();
			}
		});
	}

	var previousLocation = function(){
		if(index < _.size(allMarkers) - 1 ){
			showLoadingImg();

			index++;
			buildImage(allMarkers[index]);

			changeText()
		}

		handleArrowStates();
	}

	var nextLocation = function(){
		if(index > 0){
			showLoadingImg();

			index--;
			buildImage(allMarkers[index]);

			changeText()
		}

		handleArrowStates();
	}

	var buildMap = function() {
		var map_canvas = $('.fucking-map-container').get(0);
		var mapOptions = {
			zoom: 11,
			mapTypeId: google.maps.MapTypeId.TERRAIN,
			// must set to false for keydown location changes
			// when clicking on a location pin the map steals focus and keyboard events from the window
			keyboardShortcuts: false,
			// stop map zoom when scrolling over map
			scrollwheel: false
		}
		map = new google.maps.Map(map_canvas, mapOptions);

		_.each(data, function(location, index){
			var coordinates = location.location;

			// weed out locations without coordinates
			if (!coordinates) return;

			var marker = new google.maps.Marker({
				location: coordinates,
				imgUrl: location.images.standard_resolution.url,
				link: location.link,
				caption: location.caption ? location.caption.text: "Nothing",
				position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
				map: map,
				icon: 'photos/location-dot.png'
			});

			google.maps.event.addListener(marker, "click", function() {
				showLoadingImg();

				buildImage(this);
			});

			allMarkers.push(marker);
		});
	}

	var buildImage = function(marker) {
		var imgUrl = marker.imgUrl;
		var caption = marker.caption;
		var instagramLink = marker.link;
		var captionEnd = index === 0 ? 'is what he is fucking saying.': 'is what he was fucking saying.';

		marker.setIcon('photos/location-pin.png');
		map.panTo(new google.maps.LatLng(marker.location.latitude, marker.location.longitude));
		// marker.setAnimation(google.maps.Animation.DROP);

		$('.fucking-image').attr('src', imgUrl);
		$('.fucking-instagram-link').attr('href', instagramLink);
		$('.fucking-saying').text("'" + caption + "' " + captionEnd).linkify();
	}

	var changeText = function(){
		if(index === 0){
			$('.right-fucking-here').text('reade is right fucking here.');
			$('.fucking-looking-at').text('he is fucking looking at this.');
		} else {
			$('.right-fucking-here').text('reade was right fucking here.');
			$('.fucking-looking-at').text('he was fucking looking at.');
		}
	}

	var handleArrowStates = function(){
		var $rightArrow = $('.go-fucking-right');
		var $leftArrow = $('.go-fucking-left');

		$rightArrow.prop('disabled', false);
		$leftArrow.prop('disabled', false);

		if(index === 0){
			$rightArrow.prop('disabled', true);
		} else if(index >= _.size(allMarkers) - 1 ){
			$leftArrow.prop('disabled', true);
		}
	}

	var showLoadingImg = function(){
		$('.fucking-image').attr('src', '');
		$('.fucking-image').attr('src', 'photos/loading.gif');

		// TODO - find a better way to do this
		_.each(allMarkers, function(marker){
			marker.setIcon('photos/location-dot.png');
		});
	}

	google.maps.event.addDomListener(window, 'load', initialize);

})();
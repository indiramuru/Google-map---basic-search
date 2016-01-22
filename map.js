/* map.js file has the functional logic behind the index.html page */

var mapObj = {	
    map:'',
	infowindow: '',
	getMarker: [],
	place: '',
    autocomplete: '',
	
	//callback function on loading the library script
	initMap: function () {
	  this.map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 38.09024, lng: -100.71289100000001},
	    zoom: 5,
	    mapTypeControl: true,
        mapTypeControlOptions: {
	      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		   position: google.maps.ControlPosition.RIGHT_TOP
	    }
	  });	
	  document.getElementById('search-box').value = '';
	  var input = document.getElementById('search-box');	  
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);	
	  this.autocomplete = new google.maps.places.Autocomplete(input);
	  this.infowindow = new google.maps.InfoWindow();
	  google.maps.event.addDomListener(window, "resize", this.centerMapOnResize.bind(mapObj.map));	
	  this.autocomplete.addListener('place_changed', this.autoCompleteListener.bind(mapObj));
	},
	
	//callback function on resizing the window
	centerMapOnResize: function() {
	  var center = this.getCenter();
	  google.maps.event.trigger(this, "resize");
	  this.setCenter(center);
	},
	
	//callback function on autocomplete search
	autoCompleteListener: function() {	  
	  processingStarted();
	  removeMarkers.call(this);
	  this.place = this.autocomplete.getPlace();	  
	  if (this.place.geometry === undefined) {
	    currentPosition();		
	    return;
	  } else { 
	    createMarker.call(this);
	    setCenter.call(this);
	    processingDone();
	  }
	}
}

//Positions the map at center on displaying search results
function setCenter() {
	this.map.setCenter(this.place.geometry.location);
	this.map.setZoom(10);
}

//Remove/delete the already existing markers, if any
function removeMarkers () {		
	for(i=0; i<this.getMarker.length; i++){
	 this.getMarker[i].setMap(null);
	}
	this.getMarker = [];
}

//Method to find out current position and search for the location near the users location
function currentPosition() {  
  if (navigator.geolocation) {			
	navigator.geolocation.getCurrentPosition(function(position) {          		
	  var pos = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	  }		  
	  var searchText = document.getElementById('search-box').value;	  
	  var service = new google.maps.places.PlacesService(mapObj.map);
	  service.textSearch({
		location: pos,
		radius: 1000,
		query: searchText	
	  }, callback);
	}, function() {
	   alert('Geo location failed. Please try again');
	},{timeout:5000}); //timeout for 5 secs to retrieve the data
  }
  else {
	  alert('Browser doesnt support Geolocation');
  }
}

//Process the search result
function callback(results, status) {    
  if (status === google.maps.places.PlacesServiceStatus.OK) {
	mapObj.place = results[0];
	setCenter.call(mapObj);	
	for (var i = 0; i < results.length; i++) {
	  mapObj.place = results[i];
	  createMarker.call(mapObj);
	}		
	processingDone();			
  }
}

//Create Marker for each places
function createMarker() {   
   var self = this;  
   var marker = new google.maps.Marker({
	 map: self.map,
	 position: self.place.geometry.location,
	 anchorPoint: new google.maps.Point(0, -29)
   });   
   self.getMarker.push(marker);	   
   marker.setVisible(true); 
   var address = setAddress(self.place); 
   
   //Adding marker click event listener   
   google.maps.event.addListener(marker, 'click', function(){     
     self.infowindow.setContent('<div><strong>' + self.place.name + '</strong><br>' + address);	  
     self.infowindow.open(self.map, this);  
   });
}

//sets the address of each place
function setAddress(place) {
  var address = '';
  if(place.formatted_address) {
	address = place.formatted_address;
  }
  else if (place.address_components) {
   address = [
	(place.address_components[0] && place.address_components[0].short_name || ''),
	(place.address_components[1] && place.address_components[1].short_name || ''),
	(place.address_components[2] && place.address_components[2].short_name || '')
   ].join(' ');
  }	  
  return address;	  
}

//Hide spinner
function processingDone() {
  document.getElementsByClassName('pac-container')[0].style.display = 'none';
  document.getElementById('spinner-img').style.display = 'none';
  document.getElementById('container').className = '';
}

//Show spinner
function processingStarted () {
  document.getElementsByClassName('pac-container')[0].style.display = 'none';
  document.getElementById('spinner-img').style.display = 'block';
  document.getElementById('container').setAttribute('class','transparency');
}

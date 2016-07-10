/**
 * Created by Nicholas on 7/10/2016.
 */
$(document).ready(function() {

    var startPos;
    var geoSuccess = function(position) {
        startPos = position;
        alert("Your Latitude is " + startPos.coords.latitude + " and your longitude is " + startPos.coords.longitude);
        };
    navigator.geolocation.getCurrentPosition(geoSuccess);


});
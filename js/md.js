
//platform specific - defaults
var whoson = "www.m.mydestination.com";
var cdnurl = "http://cdnstatic-2.mydestination.com/";




//initialise
var startpage = "welcome";
var weather = "c"; //default celsius
var weathercode = "";
var weathertitle = "";
var weathermulti = false;
var destination;
var destination_id;
var cache_timeout = 86400;
var flight_cache_timeout = 130; //2 min, 10s
var apiurl = "http://api.mydestination.com/index.cfm/";

//json storage
var json_events = "";
var json_offers = "";
var json_categories = "";
var json_destination = "";
var json_destinations = "";
var json_arrivals = "";
var json_departures = "";


//flags for processing locations services after getting location
var getnearest = false;
var getnearmenow = false;
var getdirections = false;
var latitude;
var longitude;
var dlatitude;
var dlongitude;
var current_flighttype = "departures";
var current_airport;
var current_airportcode;

var IDACC = "";
var IDREST = "";
var IDTHING = "";
			

//search
var current_category_txt = ""; //holds current parent category
var current_category_id = ""; //holds current parent category
var current_category_location = ""; //holds current parent category
var current_category_type = ""; //holds current parent category
var current_category_sort = "Default"; //holds current parent category
var current_category_offset = 0;
var current_nearme_categoryid = "";
var current_category_offset_flag = false;
var current_searchstring = ""; //search for company pages






function init() {	
	window.scrollTo(0, 1);

	showsplash = false;
 	if (showsplash == true) $.mobile.changePage("#splash");
	
	//localStorage.clear(); //DELETE THIS
	
	//disable animations if less than Android 2.2
	var uagent = navigator.userAgent.toLowerCase();

	if (uagent.search("android 2.2.1") > -1){	
		$.mobile.scrollview.prototype.options.scrollMethod = "scroll";
		$.mobile.defaultPageTransition = 'none';
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.useFastClick = true;
	}
	
	$.mobile.loadingMessage = "Initialising...";
	$.mobile.showPageLoadingMsg();
			
	$('#whatson').live('pageshow',function(event){getEvents(false)});	
	$('#offers').live('pageshow',function(event){getOffers(false)});	
	$('#weather').live('pageshow',function(event){getWeather()});	
	$('#flights-sub').live('pageshow',function(event){showDepartures();});
	
	$('#destinations-top').live('pagebeforeshow',function(event){
		getDestinations();
 		$('#div-dsearch .ui-input-text').val("");
		$("#dsearch-listview").listview("refresh");
		$("#dsearch-listview").attr("style", "display:none");
		$("#div-destinations-listview").attr("style", "display:block");
	});
		
	$('#destinations-sub').live('pagebeforeshow',function(event){
		$("div#div-search ul").listview('refresh');
	});
	
	$('#filter-location').live('pagebeforeshow',function(event){
		$("div#div-dfilter ul").listview();
	});
	
	
	$('#filter-type').live('pagebeforeshow',function(event){
		$("div#div-tfilter ul").listview('refresh');
	});
	
	$('#nearme-selectcategory').live('pagebeforeshow',function(event){
		$("div#div-cfilter ul").listview('refresh');
	});
	
	
	
	$('#weather-location').live('pagebeforeshow',function(event){
		$("ul#weather-location-listview").listview('refresh');
	});
	
	$('#search').live('pagebeforeshow',function(event){
		$("#ftype").html("Type (All)");
		$("#flocation").html("Location (All)");
		$("#fsortby").html("Sort By (Default)");
		$(".filter_location_region").removeClass("hidden");
		
		current_category_type = "";
		current_category_location = "";
		current_category_sort = "";
		
		$('#search .ui-input-text').val("");
		$('#results .ui-input-text').val("");
		$("#categories-listview").listview(); //creates widget
	});
	
	$("#welcome_image").attr("src", "welcome/" + Math.floor(Math.random()*9) + ".jpg");
	
	//control destination search
	$('#div-dsearch .ui-input-text').live('keyup', function(){	
		if($('#result:visible').length != 0 || $('#div-dsearch .ui-input-text').val() == "") {
			document.getElementById('dsearch-listview').style.display = 'none';
			document.getElementById('div-destinations-listview').style.display = 'block';
		}
		else
		{
		   document.getElementById('dsearch-listview').style.display = 'block';
		   document.getElementById('div-destinations-listview').style.display = 'none';
		}
	 });
	 
	 $('#div-dsearch .ui-input-clear').live('click', function(){
		document.getElementById('dsearch-listview').style.display = 'none';
	 });	

	 //control company search
	 $('#search .ui-input-text').live('keyup', function(e){													 
		if(e.keyCode == 13) {
			getCategoryId("",false,$('#search .ui-input-text').val());
      	}
	 });
	 $('#search .ui-input-clear').live('click', function(){
		$('#results .ui-input-text').val("");
	 });
	 
	 $('#results .ui-input-text').live('keyup', function(e){													 
		if(e.keyCode == 13) {
			getCategoryId("",false,$('#results .ui-input-text').val());
      	}
	 });
	 $('#results .ui-input-clear').live('click', function(){
		$('#search .ui-input-text').val("");
	 });


	
	//check which unit to show weather
	if (typeof(localStorage) != 'undefined' && localStorage.getItem("weather") != null){
		weather = localStorage.getItem("weather");
	}
	

	//check if we already have a destination, if so go straight to it
	if (hashid != "")
	{
		startpage = "home";
		destination = hashid;
		getDestination(hashid,"redirect")
	}
	else if (typeof(localStorage) != 'undefined' && localStorage.getItem("destination_id") != null && localStorage.getItem("destination") != null ){
		startpage = "home";
		json_destination = jQuery.parseJSON(localStorage.getItem("destination"));	
		json_destination.NEAREST = "0"; //make sure it loads properly
		destination = json_destination.N;	
		destination_id = localStorage.getItem("destination_id");
		
		updateDestination(json_destination);
	}
	else
	{
		//if ($("#ndestination").html() == "Locate Nearest Destination") {getnearest = true; get_location();}
		startpage = "welcome";
	}
				
								   
	$('[data-role=page]').live('pageshow', function (event, ui) {
	try {
		if (event.target.id != "" && event.target.id != "splash"){
			var pageTracker = _gat._getTracker("UA-22737678-15");
			pageTracker._trackPageview(destination + "/" + event.target.id);
			
			var pageTracker2 = _gat._getTracker("UA-16151366-5");
			pageTracker2._trackPageview(destination + "/" + event.target.id);
			
			sWOUrl = "http://gateway9.whoson.com/stat.gif?d=" + whoson + "&p='" + destination + "/" + event.target.id + "'&r=''&sWOUser=test";
			$("#whoson").attr("src", sWOUrl);
			
			//tracker.addVisitorProperty('name','Mark Wallis - Marbella');
    		
			var e={url:destination + "/" + event.target.id,title:'MobileWeb'};
			woopraTracker.addVisitorProperty('name',destination + "/" + event.target.id);
    		woopraTracker.trackPageview(e);
		}
	} catch(err) {
	
	}
	});
	

	//startpage = "offervoucher";
	//showsplash = false;
	
	
	if (showsplash == true)
	{
		setTimeout('closeSplash()',3000);
	}
	else
	{
		$.mobile.changePage("#" + startpage, { transition: "fade"});
		startpage = "";
	}
}



//getLocation
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function get_location() {
	$.mobile.loadingMessage = "trying to locate you ...";
	$.mobile.showPageLoadingMsg();
	if (!navigator.geolocation) {
		$.mobile.hidePageLoadingMsg();
		alert("Error getting your location. Please make sure your GPS is enabled in settings.");
	}
	else {
		navigator.geolocation.getCurrentPosition(get_location_result, function (error) { alert("We are having problems identifying your current location - please try again."); $.mobile.hidePageLoadingMsg(); }, { enableHighAccuracy: true });
	}
}

function get_location_result(position) {
	$.mobile.hidePageLoadingMsg();
	
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	
	//check if nearmenow was hit ?
	if (getnearmenow == true) get_nearmenow();
	if (getnearest == true) getDestination("nearest","");
	if (getdirections == true) getDirections();
}



//getDestinations
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function getDestinations(){
	//get from local storage	
	if (typeof(localStorage) != 'undefined' && localStorage.getItem("destinations") != null){
		json_destinations = jQuery.parseJSON(localStorage.getItem("destinations"));		
	}

	//timestamp
	var json_destinations_timestamp = 0;
	if (json_destinations != "") json_destinations_timestamp = json_destinations.T; 
	
	//needs an update ?
	if (gettimestamp() > json_destinations_timestamp + cache_timeout)
	{
		getAjax(apiurl + 'app/destinations.js',"getDestinationsCallback");
	}
	else
	{
		if ($("#dsearch-listview").html() == "") updateDestinations(json_destinations);
	}
}

function getDestinationsCallback(data)
{
	//cache data
	if (typeof(localStorage) != 'undefined'){
		json_destinations = data;
		localStorage.removeItem("destinations");
		localStorage.setItem("destinations",JSON.stringify(data));
	}
	
	updateDestinations(data);
}

function updateDestinations(data)
{
	//reset
	$("#dsearch-listview").empty();
	$('#destinations-listview li').attr("style", "display:none");


	$.each(data.DEST, function(i, dest) {
		var listview = i.toLowerCase().replace(/_/g, "-").replace(/ /g, "-");
	
		var myhtml = "";					   
		$.each(dest, function(i, destinations) {			  
			destinations.CDNURL = cdnurl;
			myhtml += Mustache.to_html($('#template_dsearch').html(), destinations);	
		});
		
		$("#" + listview + "-listview").html(myhtml);
		$("#" + listview).attr("style", "display:block");
		$("#dsearch-listview").append(myhtml);
	})
	$("#dsearch-listview").listview("refresh");
	
	$.mobile.hidePageLoadingMsg();
}



//getNearMeNow
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function get_nearmenow() {
	
	//reset flag
	getnearmenow = false;
	
	$.mobile.changePage("#nearme");
  	$.mobile.loadingMessage = "loading near me now";
	$.mobile.showPageLoadingMsg();

	var myurl = apiurl + "app/nearmenow/" + destination_id + ".js?lat=" + latitude + "&lon=" + longitude + "&categoryid=" + current_nearme_categoryid;
	
	//make request to server
	getAjax(myurl,"getNearmenowCallback");
}



function getNearmenowCallback(data)
{	
	//store json
	json_nearmenow = data;	
	
	var myhtml1 = "";
	var myhtml2 = "";
	var myhtml3 = "";
	
	$.each(data, function(i, v) {				  
		if(v.ITEMS.length != 0)
		{
			//convert distance
			v.distance = function () {  
				return function (dist, render) {
					dist = render(dist);  
					if (dist < 1){ dist = ((Math.round(dist*100) /100) * 1000) + 'm';}
					else {dist = (Math.round(dist*100)/100) + 'km';}
					return dist;
				}  
			}
			
		
			if (v.LABEL == "What's on")
			{
				v.CHANGE = "hidden";
				v.THUMBPATH = cdnurl + destination.toLowerCase().replace(/ /g, "") + '/Events/Photos/';
				v.FUNCTION = "getEvent";
				myhtml2 += Mustache.to_html($('#template_companies').html(), v);
			}
			else if (v.LABEL == "Special Offers")
			{
				v.CHANGE = "hidden";
				v.THUMBPATH = cdnurl + destination.toLowerCase().replace(/ /g, "");
				v.FUNCTION = "getOffer";
				myhtml3 += Mustache.to_html($('#template_companies').html(), v);
			}
			else
			{
				v.CHANGE = "";
				v.THUMBPATH = "";
				v.FUNCTION = "getCompany";
				myhtml1 += Mustache.to_html($('#template_companies').html(), v);
			}
		
			//myhtml += Mustache.to_html($('#template_companies').html(), v);
		}
	});
	
	var myhtml = myhtml1 + myhtml2 + myhtml3;

	$("#nearmenow").html(myhtml);
	
	scrollx();
	
	$.mobile.hidePageLoadingMsg();
}



function nearmeChangeCategory(){
	$("#nearmeChangeCategory").attr("style", "display:block");
}

//getEvents
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getEvents(more) {	
	//check if we need to get this
	if ($("#whatson-listview").html() == "" || more == true)
	{
		$.mobile.loadingMessage = "updating events";
		$.mobile.showPageLoadingMsg();
		
		var myurl = apiurl + "events/" + destination_id + ".js";
		
		//offset
		if (more == true){
			current_category_offset_flag = true;
			current_category_offset = current_category_offset + 10;
			myurl += "?offset=" + current_category_offset;
		}
		else
		{
			$("#whatson-listview").empty();
			current_category_offset_flag = false;
			current_category_offset = 0;	
		}
		
		if (more == false){
			$("#whatson-listview").empty();
			$("#whatson-listview-featured").empty();
			//make request to server for featured events
			getAjax(myurl + "?onlyfeatured=true","getEventsFeaturedCallback");
		}
		
		//make request to server for non featured events
		getAjax(myurl,"getEventsCallback");
	}
	else
	{
		$("#back-event").attr("href",location.hash);
		$.mobile.changePage("#whatson");
	}
}

function getEventsFeaturedCallback(data)
{
	updateEvents(data);
}

function getEventsCallback(data)
{
	updateEvents(data);
}

function updateEvents(data)
{

	//store json
	json_events = data;
	$.mobile.changePage("#whatson");
	
	//top level
	var myhtml = '';
	var myclass = "odd";
	var featured = false;
	
	featured = true;
	
	$.each(data, function(i, v) {			
		if (v.FEATURED == "0") featured = false;
		
		//date
		var startdate = dateFormat(rsttodate(v.DATESTART), "mmmm dS"); 
		var datestr = startdate;
		if (v.DATEEND != ""){
				var enddate = dateFormat(rsttodate(v.DATEEND), "mmmm dS");
			if (enddate != startdate) datestr += " - " + enddate;
		}

		
	
				
		myhtml += '<li data-theme="m" name="result" class="' + myclass + '"><a href="javascript:getEvent(\'' + v.ID + '\')"><div class="roundedCornersDiv">';
		
		
		if (v.THUMBNAIL == "")
		{
			myhtml += '<img src="' + cdnurl + 'Images/DefaultEventLogo.gif">';
		}
		else
		{
			myhtml += '<img src="' + cdnurl;
			myhtml += destination.toLowerCase().replace(/ /g, "") + '/Events/Photos/' + v.THUMBNAIL + '">';
		}
		
		myhtml += '</div><h2>' + v.LABEL + '</h2><h3>Type: ' + v.TYPELABEL + '</h3><h3>' + datestr + '</h3><p>' + v.TEXT.substring(0, 100) + '...</p></a></li> '; 
		
		if (myclass == "odd") myclass = "even"; else myclass = "odd";
	})
	
	
	
	if (featured == true){
		if (myhtml != "")
		{
			myhtml = '<li data-role="list-divider" data-theme="m">Featured Events</li>' + myhtml;
			$("#whatson-listview-featured").append(myhtml);
			$("ul#whatson-listview-featured").listview('refresh');
		}
	}
	else
	{
		if (current_category_offset_flag == false)	myhtml = '<li data-role="list-divider" data-theme="m">Upcoming Events</li>' + myhtml;
		
		$("#whatson-listview").append(myhtml);
		$("ul#whatson-listview").listview('refresh');
		
		if (data.length == 10) $("#whatson_more").removeClass("hidden"); else $("#whatson_more").addClass("hidden");
	}
	

	
	$.mobile.hidePageLoadingMsg();
}


//getEvent
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function getEvent(id) {	
	
	$("#back-event").attr("href",location.hash);
	
	var found = false;
	
	//$.mobile.loadingMessage = "My custom message!";
	$.mobile.loadingMessage = "loading";
	$.mobile.showPageLoadingMsg();
	
	if (json_events != "")
	{
		$.each(json_events, function(i, v) {
			
			if (v.ID == id) {	
				found = true;
				eventHTML(v);
				return;				
			}
		});
	}
	
	if (found == false){
	
		var myurl = apiurl + "events/" + destination_id + ".js?id=" + id;
	
		//make request to server
		getAjax(myurl,"getEventCallback");
	}
}


function eventHTML(v){

	var startdate = dateFormat(rsttodate(v.DATESTART), "mmmm dS"); 
	var datestr = startdate;
	if (v.DATEEND != ""){
			var enddate = dateFormat(rsttodate(v.DATEEND), "mmmm dS");
		if (enddate != startdate) datestr += " - " + enddate;
	}
	
	
	//var datestr = "";
	var myhtml = "";
	
	myhtml = '<div class="eventbar"><h1>' +  v.LABEL + '</h1></div><div class="contentbody">';
	
	if (v.THUMBNAIL == "")
	{
		myhtml += '<img src="' + cdnurl + 'Images/DefaultEventLogo.gif">';
	}
	else
	{
		myhtml += '<img src="' + cdnurl;
		myhtml += destination.toLowerCase().replace(/ /g, "") + '/Events/Photos/' + v.THUMBNAIL + '">';
	}

	
	myhtml += '<div class="contentinfo">';
	
	if (v.TYPELABEL != "" && v.TYPELABEL !== undefined) myhtml += '<h2>Type: ' + v.TYPELABEL + '</h2>';
	if (datestr != "") myhtml += '<h2>Date: ' + datestr + '</h2>';
	if (v.TIMESTART != "") myhtml += '<h2>Time: ' + v.TIMESTART + '</h2>';
	if (v.TELEPHONE != "") myhtml += '<h2>Tel: <a href="tel:' + v.TELEPHONE + '">' + v.TELEPHONE + '</a></h2>';
	
	myhtml += '</div><br clear="all"></div><div class="contentdetail">';
	if (v.LABEL != "") myhtml += '<h2>' + v.LABEL;
	if (v.LOCATION_1 != "") myhtml += ' at ' + v.LOCATION_1;
	myhtml += '</h2>'; 

	if (v.TEXT != "") myhtml += '<p>' + v.TEXT.replace(/\n/g, '<br>') + '</p>';
	myhtml += '</div>';
	
	//myhtml += '<h2>TESTING SHARE</h2><br><h2><a href="mailto:?subject=' + v.LABEL + '&body=Message for the body">Share by Email</a></h2>';
	
	$("#eventbody").html(myhtml);
					  

	$.mobile.changePage("#event");
	$.mobile.hidePageLoadingMsg();
}


function getEventCallback(data)
{
	$.each(data, function(i, v) {			  
		eventHTML(v);
	});
}

//getOffers
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function getOffers(more) {	

	if ($("#offers-listview").html() == "" || more == true)
	{
		$.mobile.loadingMessage = "updating offers";
		$.mobile.showPageLoadingMsg();
	
		var myurl = apiurl + "offers/" + destination_id + ".js";
		
		//offset
		if (more == true){
			current_category_offset_flag = true;
			current_category_offset = current_category_offset + 10;
			myurl += "?offset=" + current_category_offset;
		}
		else
		{
			$("#offers-listview").empty();
			$("#offers_more").addClass("hidden");
			current_category_offset_flag = false;
			current_category_offset = 0;	
		}
		
		//make request to server
		getAjax(myurl,"getOffersCallback");
	}
	else
	{
		$.mobile.changePage("#offers");
	}
}

function getOffersCallback(data)
{
	updateOffers(data);
}

function updateOffers(data)
{
	//store data
	json_offers = data;

	var myhtml = '';
	var now = new Date();

	$.mobile.changePage("#offers");
	
	var myclass = "odd";
	
	if (data.length == 0)
	{
		myhtml = '<li data-theme="m" name="result" class="' + myclass + '"><br><br><h2 class="center">Sorry no results found.</h2><br><br></li>';
		$("#offers-listview").append(myhtml);
	}
	else
	{
		$.each(data, function(i, v) {			
			v.THUMBNAIL = cdnurl + destination.toLowerCase().replace(/ /g, "") + v.THUMBNAIL;
				
			v.VALIDTO = rsttodate(v.VALIDTO);	
				
			var datestr = (Date.parse(v.VALIDTO) - now.getTime())/1000/60/60/24; 

			v.DAYS = Math.round(datestr*10)/10;
		
			if (i%2 == 0) v.CLASS = "odd"; else v.CLASS = "even";
			$("#offers-listview").append(Mustache.to_html($('#template_offers').html(), v));
			if (myclass == "odd") myclass = "even"; else myclass = "odd";
		})
	}
	
	$("ul#offers-listview").listview('refresh');
	
	//if data length < 10 then hide more (end)
	if (data.length == 10) $("#offers_more").removeClass("hidden"); else $("#offers_more").addClass("hidden");
	$.mobile.hidePageLoadingMsg();
}


// parse a date in yyyy-mm-dd format
function parseDate(input) {
  var parts = input.match(/(\d+)/g);
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
}


//getOffer
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getOffer(id) {	
	var found = false;
	
	$.mobile.loadingMessage = "loading offer";
	$.mobile.showPageLoadingMsg();
	
	if (json_offers != "")
	{
		$.each(json_offers, function(i, v) {
			
			if (v.ID == id) {		
				found = true;
				
				v.VALID = $.format.date(rsttodate(v.VALIDFROM),"dd MMM yyyy") + " to " + $.format.date(rsttodate(v.VALIDTO),"dd MMM yyyy");
				
				//console.log(v);
				if (v.RESTRICTIONS == "") v.RESTRICTIONS = "None";
				offerHTML(v);
				
				
				
				$("#voucherdetails").html(Mustache.to_html($('#template_offervoucher').html(), v));
				return;				
			}
		});
	}
	
	if (found == false){
	
		var myurl = apiurl + "offers/" + destination_id + ".js?id=" + id;
	
		//make request to server
		getAjax(myurl,"getOfferCallback");
	}
}

function offerHTML(v){
		
	var myhtml = "";

	myhtml = '<div class="offerbar"><h1>Valid: ' +   v.VALID + '</h1></div><div class="contentbody"><img src="' + v.THUMBNAIL + '"><div class="offerinfo">';

	if (v.MAINCATEGORY != "") myhtml += '<h2>Type: ' + v.MAINCATEGORY + '</h2>';
	if (v.TELEPHONE != "") myhtml += '<h2>Tel: <a href="tel:' + v.TELEPHONE + '">' + v.TELEPHONE + '</a></h2>';
	myhtml += '</div><br clear="all"></div>';
	if (v.LABEL != "") myhtml += '<h2>' + v.LABEL + '</h2>'; 
	if (v.COMPANYNAME != "") myhtml += '<p><b>' + v.COMPANYNAME + '</b></p>';
	if (v.ADDRESSLINE1 != "") myhtml += '<p>' + v.ADDRESSLINE1 + '</p>';
	if (v.ADDRESSLINE2 != "") myhtml += '<p>' + v.ADDRESSLINE2 + '</p>';
	if (v.TEXT != "") myhtml += '<p><b>Details:</b><br>' + v.TEXT.replace(/\n/g, '<br>') + '</p>';
	if (v.RESTRICTIONS != "None") myhtml += '<p><br><b>Restrictons</b><br>' + v.RESTRICTIONS + '</p>';	
	
	$(".offertitle").html(v.LABEL);
	$("#offerbody").html(myhtml);
	
	$.mobile.changePage("#offer");
	$.mobile.hidePageLoadingMsg();
}

function getOfferCallback(data)
{
	$.each(data, function(i, v) {		  
	  	v.VALID = $.format.date(rsttodate(v.VALIDFROM),"dd MMM yyyy") + " to " + $.format.date(rsttodate(v.VALIDTO),"dd MMM yyyy");
		if (v.RESTRICTIONS == "") v.RESTRICTIONS = "None";
		offerHTML(v);
		$("#voucherdetails").html(Mustache.to_html($('#template_offervoucher').html(), v));
	});
}

//getDestination
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getDestination(id,dest_str) {	
	
	if (typeof(localStorage) != 'undefined' && localStorage.getItem(destination != null)){
		json_destination = jQuery.parseJSON(localStorage.getItem(destination) );	
		
		if (json_destination.ID != id) json_destination = "";
	}

		
	if (id == "nearest")
	{
		getnearest = false;
		var myurl = apiurl + "app/destination.js?lat=" + latitude + "&lon=" + longitude;
		$.mobile.loadingMessage = "locating you ...";
	}
	else
	{
		$.mobile.loadingMessage = "loading travel guide";
		var myurl = apiurl + "app/destination.js?id=" + id;
		
	}
	$.mobile.showPageLoadingMsg();
	
	
	//timestamp
	var json_destination_timestamp = 0;
	if (json_destination != "") json_destination_timestamp = json_destination.T; 
	
	//needs an update ?
	if (gettimestamp() > json_destination_timestamp + cache_timeout || id == "nearest" || id != destination_id)	
	{
		//make request to server
		getAjax(myurl,"getDestinationCallback");
	}
	else
	{
		updateDestination(json_destination);
	}
}

function getDestinationCallback(data)
{	

	//clear weather stored
	if (typeof(localStorage) != 'undefined'){
		localStorage.removeItem("weathercode");
		localStorage.removeItem("weathertitle");
	}

	//store data
	if (typeof(localStorage) != 'undefined'){
		json_destination = data;
		localStorage.removeItem("destination_id");
		localStorage.removeItem("destination");
		localStorage.setItem("destination_id",data.ID);
		localStorage.setItem("destination",JSON.stringify(data));
	}
	
	
	updateDestination(data);
}





function updateDestination(data)
{
	
	//var dest = data.N;
	var nearest = data.NEAREST;
	
	//check if there is a weathercode stored
	//setWeather(title,code)
	
	//weathertitle = data.N;
	
	
	//nearest
	if (nearest == "1"){
		$("#ndestination").html("Nearest: " + data.N);
		$("a:#nearest").attr("href","javascript:getDestination('" + data.ID + "','" + data.N  + "')");
		$("a:#nearest span .ui-icon").removeClass("ui-icon-refresh").addClass("ui-icon-arrow-r");
	}
	else
	{
		$("#whatson-listview").empty();
		$("#whatson-listview-featured").empty();
		$("#offers-listview").empty();
		$("#results-listview").empty();
		$("#airports-listview").empty();
		$("#arrivals-listview").empty();
		$("#departures-listview").empty();
		$("#weather-listview").empty();
		$("#weather-location-listview").empty();
		$("#tfilter-listview").empty();
		current_category_offset_flag = false;
		current_category_offset = 0;
		weathercode = "";
		weathertitle = "";
		weathermulti = false;
		var weatherarray = new Array( );
		
		$("#weatherlink").attr("href","#weather");
		
		$("#destination").html(data.N);
		//$("#destination_id").val(data.ID);
		destination = data.N;
		destination_id = data.ID;
			
		//add functions to data returned
		data.url = function () {  
			return function (text, render) {  
				text = render(text);  
				var url = text.trim().toLowerCase();  
				return cdnurl + url;  
			}  
		}  
		
		//build data array for this template
		//myhtml = Mustache.to_html($('#template_dimages').html(), data);
		
		//destination image
		var url = cdnurl + data.N.replace(/ /g,"").toLowerCase() + "/Pictures/HomePageSlideShow/" + data.P[0].P;
		$("#destination_image").html('<img src="' + url + '">');
		//$("#destination_image").css("background-image", "url(" + url + ")"); 
		
		
		//filter-location
		var myhtml = '<ul id="dfilter-listview" data-theme="m" data-role="listview" data-filter="true" data-inset="false">';
		myhtml += '<li data-theme="m" data-icon="check" role="heading"><a href="javascript:void(0)" onclick="setfilter(\'location\',\'All\',\'\')">Reset</a></li>';
		
	
			
		$.each(data.R, function(i, region) {		
								
			if (data.R.length > 1 )
			{
				myhtml += '<li data-theme="m" data-icon="arrow-d" role="heading" data-role="list-divider" class="filter_location_region">' + region.L + '</li>';
				$.each(region.R, function(i2, subregion) {	
					myhtml += '<li data-theme="m" data-icon="check" name="result" class="filter_location ' + region.L.toLowerCase().replace(/[^a-zA-Z]+/g,'')  + ' ' + subregion.L.toLowerCase().replace(/[^a-zA-Z]+/g,'') + ' hidden"><a href="javascript:void(0)" onclick="setfilter(\'location\',\'' + addslashes(subregion.L) + '\',\'\')">&nbsp;&rsaquo;&nbsp;&nbsp;' + subregion.L + ' <span id="count_' + subregion.L.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '"></span></a></li>'; 
					
					//check if there are weather subregions
					if (subregion.WCODE != "")
					{
						weathermulti = true;
						weatherarray[weatherarray.length] = {code:subregion.WCODE, title:subregion.L,titleslash:addslashes(subregion.L)};
					}
				});
				
				
			}
			else
			{
				//myhtml += '<li data-theme="m" data-icon="arrow-d" role="heading" data-role="list-divider"><a href="javascript:void(0)" onclick="set_filter_location(\'' + region.L.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '\')">' + region.L + '</a></li>';
				$.each(region.R, function(i2, subregion) {	
					myhtml += '<li data-theme="m" data-icon="check" name="result" class="filter_location ' + region.L.toLowerCase().replace(/[^a-zA-Z]+/g,'')  + ' ' + subregion.L.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '"><a href="javascript:void(0)" onclick="setfilter(\'location\',\'' + addslashes(subregion.L) + '\',\'\')">&nbsp;&rsaquo;&nbsp;&nbsp;' + subregion.L + ' <span id="count_' + subregion.L.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '"></span></a></li>'; 
					
					//check if there are weather subregions
					if (subregion.WCODE != "")
					{ 
						weathermulti = true;
						weatherarray[weatherarray.length] = {code:subregion.WCODE, title:subregion.L,titleslash:addslashes(subregion.L)};
					}
				});	
			}
		})
		myhtml += "</ul>";
		$("#div-dfilter").html(myhtml);
		
		
	
		if (startpage != "" && typeof(localStorage) != 'undefined' && localStorage.getItem("weathercode") != null)
		{
			weathercode = localStorage.getItem("weathercode");
			weathertitle = localStorage.getItem("weathertitle");			
			setWeather(weathertitle,weathercode,false);
		}
		else if (weathermulti == false)
		{
			weathercode = data.WCODE;
			weathertitle = destination;
			setWeather(weathertitle,weathercode,false);
		}
		
		
		if (weathercode == "")
		{
			
			$("#weatherlink").attr("href","#weather-location")
		}
		
		//update weather locations
		if (weathermulti == true)
		{
			weatherarray.sort(weathersort);
			for (i = 0; i<weatherarray.length; i++)
			{
				$("#weather-location-listview").append(Mustache.to_html($('#template_weather-location').html(), weatherarray[i]));	
			}
		}
		
		
	
		//categories
		var placeholder = "";
		var myhtml2 = "";
		var myhtml = '<ul id="categories-listview" data-theme="m" data-role="listview" data-filter="false" data-inset="false">';
		$("#cfilter-listview").empty();
		
		$.each(data.CAT, function(i, cat) {	
			myhtml += '<li data-theme="m" name="result"><a href="javascript:resetCategory(\'' + cat.ID + '\',\'' + cat.LBL + '\', false)" onClick=""><div id="' + cat.LBL.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '" class="category_sprites"></div><h1>' + cat.LBL + '</h1></a></li>';
			
			if (cat.LBL == "Accommodation") {IDACC = cat.ID; current_nearme_categoryid = IDACC;}
			if (cat.LBL == "Things To Do" || cat.LBL == "Activities") {IDTHING = cat.ID; current_nearme_categoryid = IDTHING;}
			if (cat.LBL == "Restaurants") {IDREST = cat.ID; current_nearme_categoryid = IDREST;}
			
			if (cat.LBL != "Accommodation" && cat.LBL != "Shopping" && cat.LBL != "Nightlife" && cat.LBL != "Services" && cat.LBL != "Real Estate" && cat.LBL != "Wellness" ){
				if (placeholder != "") placeholder += ", ";
				placeholder += cat.LBL;
			}
			
			myhtml2 = '<li class="' + cat.LBL.replace(/[^a-zA-Z]+/g,'') + ' ' + cat.ID + '" data-theme="m" data-icon="check" name="result"><a href="javascript:void(0)" onclick="setcfilter(\'' + cat.ID + '\')"><div id="' + cat.LBL.toLowerCase().replace(/[^a-zA-Z]+/g,'') + '" class="category_sprites"></div><h1>' + cat.LBL + '</h1></a></li>';
					
			$("#cfilter-listview").append(myhtml2);		
		});
		myhtml += "</ul>";
			
		
	
		$("#div-categories").html(myhtml);
	
		$("#what_button").html('<a id="categories-title" href="#search" data-theme="m" data-role="button" data-icon="arrow-r" data-iconpos="right">e.g. ' + placeholder + '</a>');
		$("#categories-title").button();
		
		
		
		//dont redirect of waiting for splash to close
		if (startpage == "") $.mobile.changePage("#home");
	}
	
	$.mobile.hidePageLoadingMsg();
}

function weathersort(a, b) {
	var nameA = a.title.toLowerCase( );
	var nameB = b.title.toLowerCase( );
	if (nameA < nameB) {return -1}
	if (nameA > nameB) {return 1}
	return 0;
}

function set_filter_location(filter)
{
	if ($("." + filter).hasClass("hidden")){
		$(".filter_location").addClass("hidden");
		$(".filter_location .ui-icon").removeClass("ui-icon-arrow-u").addClass("ui-icon-arrow-d");
		
		$("." + filter).removeClass("hidden");
		$("." + filter + " .ui-icon").removeClass("ui-icon-arrow-d").addClass("ui-icon-arrow-u");
	}
	else
	{
		$(".filter_location").addClass("hidden");
		$(".filter_location .ui-icon").removeClass("ui-icon-arrow-u").addClass("ui-icon-arrow-d");
	}
}


function update_filter_location(){
	//hide all
	$(".filter_location").addClass("hidden");
}




//getCategories
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getCategories(){
	$.mobile.loadingMessage = "loading";
 	$.mobile.showPageLoadingMsg();
 
	var myurl = apiurl + 'categories/' + destination_id + '.js'

	getAjax(myurl,"getCategoriesCallback");
}


function getCategoriesCallback(data)
{
	//update all destinations, top and sub divs
	if (typeof(localStorage) != 'undefined')
	{
		localStorage.removeItem("categories");
		localStorage.setItem("categories",JSON.stringify(data));
	}
	
	json_categories = data;
	
	updateCategories(data);
}



function updateCategories(data)
{	
	$("#tfilter-listview").empty();
	
	//category types
	var myhtml = '';
	
	$.each(data, function(i, category) {	  
		myhtml = '<li class="tfilter ' + category.LABEL.replace(/[^a-zA-Z]+/g,'') + ' all" data-icon="check" data-theme="m" role="heading"><a href="javascript:void(0)" onclick="setfilter(\'type\',\'All\',\'' + category.ID + '\')">Reset</a></li>';
		$("#tfilter-listview").append(myhtml);
		
		//load sub search page
		$.each(category.SUBCATEGORIES, function(i2, subcategory) {
				myhtml = '<li class="tfilter ' + subcategory.LABEL.replace(/[^a-zA-Z]+/g,'') + ' ' + subcategory.ID + '" data-theme="m" data-icon="check" name="result"><a href="javascript:void(0)" onclick="setfilter(\'type\',\'' + addslashes(subcategory.LABEL) + '\',\'' + subcategory.ID + '\')">' + subcategory.LABEL + ' <span id="count_' + subcategory.ID + '"></span></a></li>';
	 
			$("#tfilter-listview").append(myhtml);		
		});
	});	
	
	$.mobile.hidePageLoadingMsg();
}


//getCategoryId
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function resetCategory(id,label,more)
{
	current_category_txt = label;
	$(".results-title-txt").html(label);
	
	getCategoryId(id,more,"");	
}

function getCategoryId(id,more,searchstring)
{	
	$.mobile.changePage("#results");
	$.mobile.loadingMessage = "loading";
	$.mobile.showPageLoadingMsg();

	//if categories are blank then load them
	if ($("#tfilter-listview").html() == "") getCategories();

	//if subid is available
	var ftype_id = current_category_id;
	var ftype = $("#ftype").html().replace("Type (","").replace(")","");
	if (id != "") ftype_id = id;
	current_category_id = ftype_id;

	//url
	if (searchstring != "")
	{
		current_category_txt = "Search: '" + searchstring + "'";
		$(".results-title-txt").html("Search: '" + searchstring + "'");
		current_searchstring = searchstring;
		$('#search .ui-input-text').val(searchstring);
		$('#results .ui-input-text').val(searchstring);
		//var myurl = apiurl + 'app/companies/' + destination_id + '.js?noBronze=true&qCoName=' + searchstring;
		var myurl = apiurl + 'app/companies/' + destination_id + '.js?qCoName=' + searchstring;
		//show all categories in filter {TODO}
	}
	else
	{
		current_searchstring = "";
		//var myurl = apiurl + 'app/companies/' + destination_id + '.js?noBronze=true&categoryId=' + ftype_id;
		var myurl = apiurl + 'app/companies/' + destination_id + '.js?categoryId=' + ftype_id;
	}
	
	//sortby
	if (current_category_sort != "") myurl += '&sortBy=' + current_category_sort;
	
	//region\subregion
	var flocation = current_category_location;
	if (flocation != "" && flocation != "All") myurl += "&areaname=" + encodeURIComponent(flocation);
	
	//offset
	if (more == true){
		$(".bronze").removeClass("hidden");
		current_category_offset_flag = true;
		current_category_offset = current_category_offset + 10;
		myurl += "&offset=" + current_category_offset;
	}
	else
	{
		$("#results-listview").empty();
		$("#results_more").addClass("hidden");
		current_category_offset_flag = false;
		current_category_offset = 0;	
	}

	getAjax(myurl,"getCategoryIDCallback");
}

function getCategoryIDCallback(data)
{
	var myhtml = "";
	var title = "";
	var myclass = "odd";
	
	
	if (data.ITEMS.length == 0 && $("#results-listview").html() == "")
	{
		myhtml += '<li data-theme="m" name="result" class="' + myclass + '"><br><br><h2 class="center">Sorry no results found.</h2><br><br></li>';
	}
	else
	{
		$.each(data.ITEMS, function(i, v) {		   
			//gold and silver companies only. 1=gold, 2=silver, 3=bronze
			if (v.COMPANYCLASSIFICATION < 3)
			{
				myhtml += '<li data-theme="m" name="result" class="' + myclass + '"><a href="javascript:getCompany(\'' + v.ID + '\')"><div class="roundedCornersDiv">';
				
				if (v.COMPANYCLASSIFICATION == 1) myhtml += '<div class="goldlisting"></div>';
				
				myhtml += '<img src="' + v.THUMBNAIL + '"></div><h2>' + v.LABEL + '</h2><h3>Type: ' + v.PARENTCATEGORY + '\\' + v.CATEGORY  + '</h3><h3>Region: ' + v.REGIONNAME + '</h3><p>' + v.PITCHTEXT + '</p></a></li> ';
	
				if (myclass == "odd") myclass = "even"; else myclass = "odd";	
			}
			else
			{
				myhtml += '<li data-theme="m" name="result" class="bronze ' + myclass;
				
				if ((current_category_type == "" || current_category_type == "All")  && (current_category_location == "" || current_category_location == "All")) myhtml += " hidden";
				myhtml += '"><a href="javascript:getCompany(\'' + v.ID + '\')">';
				myhtml += '<h2>' + v.LABEL + '</h2><h3>Type: ' + v.PARENTCATEGORY + '\\' + v.CATEGORY  + '</h3><h3>Region: ' + v.REGIONNAME + '</h3><p>' + v.PITCHTEXT + '</p></a></li> ';
	
				if (myclass == "odd") myclass = "even"; else myclass = "odd";	
			}
		});
	}
	$("#results-listview").append(myhtml);
	$("ul#results-listview").listview("refresh");  
	
	//update types
	$("." + current_category_txt.replace(/[^a-zA-Z]+/g,'')).addClass("hidden");
	$(".tfilter").addClass("hidden");
	
	//show
	$("." + current_category_txt.replace(/[^a-zA-Z]+/g,'') + ".all").removeClass("hidden");
	$.each(data.CC, function(i, v) {
		$("." + v.ID).removeClass("hidden");		
	
		$("#count_" + v.ID).html("(" + v.TOTAL + ")");		
	});
	
	//update locations	
	$(".filter_location").addClass("hidden");
	
	//show
	//$("." + current_category_txt.replace(/[^a-zA-Z]+/g,'') + ".all").removeClass("hidden");
	$.each(data.CR, function(i, v) {
		$(".filter_location." + v.LABEL.toLowerCase().replace(/[^a-zA-Z]+/g,'')).removeClass("hidden");		
		$("#count_" + v.LABEL.toLowerCase().replace(/[^a-zA-Z]+/g,'')).html("(" + v.TOTAL + ")");		
	});
	
	if ((data.ITEMS.length == 10 && current_searchstring == "") || $(".bronze").hasClass("hidden")) $("#results_more").removeClass("hidden"); else $("#results_more").addClass("hidden"); 
	
	$.mobile.hidePageLoadingMsg();
}


//getCompany
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getCompany(id)
{	
	$.mobile.loadingMessage = "loading";
	$.mobile.showPageLoadingMsg();
	
	var myurl = apiurl + 'company/' + id + '.js';
	getAjax(myurl,"getCompanyCallback");
}

function getCompanyCallback(data)
{
	
	var myhtml = "";
	var title = "";
	var myhtml = "<h2 class='ui-li-divider'>" + data.LABEL + "</h2>";
	
	
	//gold and silver
	if (data.COMPANYCLASSIFICATION < 3)
	{		
		//photos
		myhtml += '<div data-scroll="x" class="threeByThree">';
		var photohtml = "";
		$.each(data.PHOTOS, function(i, v) { 			  
			photohtml += '<a href="#"><img src="' + v.THUMBNAILPICTUREURL + '"></a>'; 
		})
		
		myhtml += photohtml;
		myhtml += photohtml;
		myhtml += photohtml;
		myhtml += '</div>';
	}
	
	myhtml += '<div id="companybody-indent">';
	myhtml += '<h2>' + data.LABEL + '</h2>';
	if (data.ADDRESSLINE1 != "") myhtml += '<h3>' + data.ADDRESSLINE1;
	if (data.ADDRESSLINE2 != "") myhtml += ', ' + data.ADDRESSLINE2 ;
	if (data.ADDRESSLINE1 != "") myhtml += '</h3>';
	if (data.ADDRESSLINE3 != "") myhtml += '<h3>' + data.ADDRESSLINE3 + '</h3>';
	if (data.TELEPHONE != "") myhtml += '<h3>Tel: <a href="tel:' + data.TELEPHONE + '">' + data.TELEPHONE + '</a></h3>';
	if (data.TELEPHONE2 != "") myhtml += '<h3>Tel: <a href="tel:' + data.TELEPHONE2 + '">' + data.TELEPHONE2 + '</a></h3>';
	
	//gold and silver
	if (data.COMPANYCLASSIFICATION < 3)
	{	
		if (data.WEBSITE != "") myhtml += '<h3><a href="'  + data.WEBSITE + '" target="_blank">Website</a></h3>';
	}

	//strip html
	$('#converttotext').html(data.TEXT.replace(/iframe/g, 'img').replace(/object/g, 'img'));
	//$("#converttotext a").remove();
	$("#converttotext img").remove();
	var overview = $('#converttotext').text();
	
	if (data.TEXT != "") myhtml += '<br><div id="companyoverview"><h3><b>Overview</b></h3><p>' + overview.replace(/\n/g, '<br>') + '</p>';
	
	
	//show map and directions
	if (data.LON != "" && data.LAT != "")
	{
		dlatitude = data.LAT;
		dlongitude = data.LON;
		
		myhtml += '<br><h3><b>Click map for directions</b></h3><a href="javascript:getdirections = true; get_location();"><img src="http://maps.google.com/maps/api/staticmap?center=' + data.LAT + ',' + data.LON + '&zoom=' + data.GOOGLEMAPZOOMLEVEL + '&markers=size:mid|color:blue|' + data.LAT + ',' + data.LON + '&size=260x160&sensor=true"></a>';
	}

	
	myhtml += '</div></div>';
	
	
	$("#companybody").html(myhtml);
	
	
	$("#back-company").attr("href",location.hash);
	
	$.mobile.changePage("#company");
	
	scrollx();
	
	$.mobile.hidePageLoadingMsg();
}


//getDirections
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getDirections()
{	
	getdirections = false;

	//directions
	$.mobile.changePage("#directions");
	$.mobile.loadingMessage = "loading directions";
	$.mobile.showPageLoadingMsg();
	
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var map;
	
	directionsDisplay = new google.maps.DirectionsRenderer();
	var chicago = new google.maps.LatLng(latitude, longitude);
	var myOptions = {
	zoom:15,
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	center: chicago
	}
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	directionsDisplay.setMap(map);
	$("#directionsPanel").html("");
	directionsDisplay.setPanel(document.getElementById("directionsPanel")); 
	 
	 
	var start = new google.maps.LatLng(latitude, longitude);
	var end = new google.maps.LatLng(dlatitude, dlongitude);
	var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.WALKING
	};
		directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		}
	}); 
	
	
	$.mobile.hidePageLoadingMsg(); 
}


//getAirports
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getAirports() {	
	$.mobile.changePage("#airports");
	
	if($("#airports-listview").html() == ""){	
		$.mobile.loadingMessage = "loading";
		$.mobile.showPageLoadingMsg();
		
		var radius = json_destination.RAD;
		if (radius < 150) radius = 150;
	
		var myurl = apiurl + "app/airports/" + destination_id + ".js?dist=" + radius + "&minclass=4";
		
		//check if we have a valid state
		var wcode = json_destination.WCODE.split("|");
		
		if (wcode[2].length == 2){
			myurl += "&state=" + wcode[2];
		}
	
		//make request to server
		getAjax(myurl,"getAirportsCallback");
	}
}

function getAirportsCallback(data)
{
	$("#airports-listview").empty();
	$("#airports-listview").append('<li data-role="list-divider" data-theme="m">Select Airport</li>'); 
	 
	if (data.AIRPORTS.length == 0 )
	{
		$("#airports-listview").append('<li data-theme="m" name="result" class="odd"><br><br><h2 class="center">Sorry no airports close by found.</h2><br><br></li>');
		
	}
	else
	{
		$.each(data.AIRPORTS, function(i, v) {			  
			if (i%2 == 0) v.CLASS = "odd"; else v.CLASS = "even";
			$("#airports-listview").append(Mustache.to_html($('#template_airports').html(), v));
		});
	}
	$("#airports-listview").listview("refresh");
	
	$.mobile.hidePageLoadingMsg(); 	 
}



//getFlights
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function setFlights(){
	$("#arrivals-listview").empty();
	$("#departures-listview").empty();
	
	getFlights();
}


function getFlights() {	
	$.mobile.changePage("#airport");
	$.mobile.loadingMessage = "loading flight data";
	$.mobile.showPageLoadingMsg();
	
	//airport title
	$("#flights-title").html(current_airport.replace(" Airport",""));
	

	//generate url
	var now = new Date();
	var myurl = apiurl + "app/flights.js?airportCode=" + current_airportcode + "&maxItems=40";
	
	if (current_flighttype == "departures")
	{
		var json_departures_timestamp = 0;
		if (json_departures != "") json_departures_timestamp = json_departures.TS; 
		
		//needs an update ?
		if ((gettimestamp() > (json_departures_timestamp + flight_cache_timeout)) || $("#departures-listview").html() == "")
		{
			//departures
			myurl += "&op=departures";
			myurl += "&dateMin=" + dateFormat(now.getTime() - 0.5*3600*1000,"isoDateTime"); //-1 hours
			myurl += "&dateMax=" + dateFormat(now.getTime() + 4*3600*1000,"isoDateTime"); //+4 hours
			
			//make request to server
			getAjax(myurl,"getFlightsCallback");
		}
		else
		{
			setTimeout('$.mobile.hidePageLoadingMsg();',1000);
		}
	}
	
	
	if (current_flighttype == "arrivals")
	{
		var json_arrivals_timestamp = 0;
		if (json_arrivals != "") json_arrivals_timestamp = json_arrivals.TS; 
		
		//needs an update ?
		if ((gettimestamp() > (json_arrivals_timestamp + flight_cache_timeout)) || $("#arrivals-listview").html() == "")
		{
			//arrivals
			myurl += "&op=arrivals";
			myurl += "&dateMin=" + dateFormat(now.getTime() - 1*3600*1000,"isoDateTime"); //-1 hours
			myurl += "&dateMax=" + dateFormat(now.getTime() + 2*3600*1000,"isoDateTime"); //+4 hours
			
			//make request to server
			getAjax(myurl,"getFlightsCallback");
		}
		else
		{
			setTimeout('$.mobile.hidePageLoadingMsg();',1000);
		}
	}	
}

function getFlightsCallback(data)
{
	
	if (current_flighttype == "departures")
	{
		json_departures = data;
		json_departures.TS = gettimestamp();
		
		$("#departures-listview").empty();
		

		$.each(data.FLIGHTS, function(i, v) {			  
			if (i%2 == 0) v.CLASS = "odd"; else v.CLASS = "even";
			
			v.AIRPORTCODE = v.DC;
			v.STATUSCOL = "";
			
			//check for delay departing
			v.TIME = $.format.date(v.DD.replace("T"," "), "HH:mm");
			v.AD = $.format.date(v.AD.replace("T"," "), "HH:mm");
			v.DD = $.format.date(v.DD.replace("T"," "), "HH:mm");
			
			if (v.DT != "") v.DT = " Terminal " + v.DT;
			if (v.AT != "") v.AT = " Terminal " + v.AT;
			
			//var dd = new Date(v.DD).getTime();
			//var dda = new Date(v.DDA).getTime();
			//var dd_diff = ((Math.round(dda) - Math.round(dd))/60000);
			//if (dd_diff > 15) v.STATUSCOL = "red";
					
			//flight status
			switch(v.S)
			{
				case "A": v.STATUS = "Airborne"; v.STATUSCOL = "green"; break;
				case "S": v.STATUS = "Scheduled"; break;
				case "C": v.STATUS = "Cancelled"; v.STATUSCOL = "red"; break;
				case "D": v.STATUS = "Diverted"; v.STATUSCOL = "red"; break;
				case "U": v.STATUS = "Unknown"; v.STATUSCOL = "red"; break;
				case "R": v.STATUS = "Redirected"; v.STATUSCOL = "red"; break;
				case "L": v.STATUS = "Landed"; v.STATUSCOL = "green"; break;
				case "DN": v.STATUS = "Data Needed"; break;
				case "NO": v.STATUS = "Not Operational"; break;
			}
				
			$("#departures-listview").append(Mustache.to_html($('#template_flight').html(), v));
		});
		
		$("#departures-listview").listview("refresh");
	}
	
	if (current_flighttype == "arrivals")
	{
		json_arrivals = data;
		json_arrivals.TS = gettimestamp();
	
		$("#arrivals-listview").empty();
		
		$.each(data.FLIGHTS, function(i, v) {			  
			if (i%2 == 0) v.CLASS = "odd"; else v.CLASS = "even";
			
			v.AIRPORTCODE = v.OC;
			v.STATUSCOL = "";
			
			//check for delay departing
			v.TIME = $.format.date(v.AD.replace("T"," "), "HH:mm");
			v.AD = $.format.date(v.AD.replace("T"," "), "HH:mm");
			v.DD = $.format.date(v.DD.replace("T"," "), "HH:mm");
			
			if (v.DT != "") v.DT = " Terminal " + v.DT;
			if (v.AT != "") v.AT = " Terminal " + v.AT;
			
			//flight status
			switch(v.S)
			{
				case "A": v.STATUS = "Airborne"; break;
				case "S": v.STATUS = "Scheduled"; break;
				case "C": v.STATUS = "Cancelled"; v.STATUSCOL = "red"; break;
				case "D": v.STATUS = "Diverted"; v.STATUSCOL = "red"; break;
				case "U": v.STATUS = "Unknown"; v.STATUSCOL = "red"; break;
				case "R": v.STATUS = "Redirected"; v.STATUSCOL = "red"; break;
				case "L": v.STATUS = "Landed";v.STATUSCOL = "green";  break;
				case "DN": v.STATUS = "Data Needed"; break;
				case "NO": v.STATUS = "Not Operational"; break;
			}
			
			$("#arrivals-listview").append(Mustache.to_html($('#template_flight').html(), v));
		});
		
		$("#arrivals-listview").listview("refresh");
		
	}

	$.mobile.hidePageLoadingMsg();
}


function toggleflight(flight)
{
	if( $("#li-" + flight + " .ui-icon").hasClass("ui-icon-arrow-d")){
		$("#li-" + flight + " .ui-icon").removeClass("ui-icon-arrow-d").addClass("ui-icon-arrow-u");
		$("#div-" + flight).attr("style", "display:block");
	}
	else
	{
		$("#li-" + flight + " .ui-icon").removeClass("ui-icon-arrow-u").addClass("ui-icon-arrow-d");
		$("#div-" + flight).attr("style", "display:none");
	}
}

function showDepartures()
{
	current_flighttype = "departures";

	$("#departures").attr("style", "display:block");
	$("#arrivals").attr("style", "display:none");
	$("#departures-listview").attr("style", "display:block");
	$("#arrivals-listview").attr("style", "display:none");
	getFlights();
}


function showArrivals()
{
	current_flighttype = "arrivals";
	$("#departures").attr("style", "display:none");
	$("#arrivals").attr("style", "display:block");
	$("#departures-listview").attr("style", "display:none");
	$("#arrivals-listview").attr("style", "display:block");
	getFlights();
}


//getWeather
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################

function setWeather(title,code,changepage)
{
	$("#weatherlink").attr("href","#weather");
	
	//store weather code
	if (typeof(localStorage) != 'undefined'){
		localStorage.removeItem("weathercode");
		localStorage.removeItem("weathertitle");
		localStorage.setItem("weathercode",code);
		localStorage.setItem("weathertitle",title);
	}
	

	//change page
	if (changepage == true) $.mobile.changePage("#weather");
}


function getWeather() {	
	$.mobile.loadingMessage = "updating weather";
	$.mobile.showPageLoadingMsg();
	
	//get weather code if stored
	if (typeof(localStorage) != 'undefined'){
		weathercode = localStorage.getItem("weathercode");
		weathertitle = localStorage.getItem("weathertitle");
	}
	
	var myurl = apiurl + "app/weather.js?id=" + destination_id + "&code=" + weathercode;
	//make request to server
	getAjax(myurl,"getWeatherCallback");
}

function getWeatherCallback(data)
{
	//next x days
	var myhtml = "";
	var myclass = "odd";
	$.each(data.NEXT, function(i, myweather) {	
	
		fahrenheit_min	= Math.round(((myweather.MIN * 9) / 5) + 32);	
		fahrenheit_max	= Math.round(((myweather.MAX * 9) / 5) + 32);	
		
		if (weather == "c")
		{
			myhtml += '<li><div class="ui-grid-b ' + myclass + '"><div class="ui-block-a"><h2>' + myweather.DATE + '</h2></div><div class="ui-block-b"><div id="weather' + myweather.ICON + '" class="weather_sprites displayed"></div></div><div class="ui-block-c"><div id="" class="weather_c ui-grid-a"><div class="ui-block-a"><h3><b>' + myweather.MAX + '&deg;</b></h3></div><div class="ui-block-b"><h3>' + myweather.MIN + '&deg;</h3></div></div><div id="" class="weather_f ui-grid-a weather-hidden"><div class="ui-block-a"><h3><b>' + fahrenheit_max + '&deg;</b></h3></div><div class="ui-block-b"><h3>' + fahrenheit_min + '&deg;</h3></div></div></div></div></li>';							
		}
		else
		{
			myhtml += '<li><div class="ui-grid-b ' + myclass + '"><div class="ui-block-a"><h2>' + myweather.DATE + '</h2></div><div class="ui-block-b"><div id="weather' + myweather.ICON + '" class="weather_sprites displayed"></div></div><div class="ui-block-c"><div id="" class="weather_c ui-grid-a weather-hidden"><div class="ui-block-a"><h3><b>' + myweather.MAX + '&deg;</b></h3></div><div class="ui-block-b"><h3>' + myweather.MIN + '&deg;</h3></div></div><div id="" class="weather_f ui-grid-a"><div class="ui-block-a"><h3><b>' + fahrenheit_max + '&deg;</b></h3></div><div class="ui-block-b"><h3>' + fahrenheit_min + '&deg;</h3></div></div></div></div></li>';							
		}


		if (myclass == "odd") myclass = "even"; else myclass = "odd";
	
	});
	$("#weather-listview").html(myhtml);


	//check if there are weather subregions
	

	//weather title
	fahrenheit	= Math.round(((data.CURRENT.TEMP * 9) / 5) + 32);	
	if (weather == "c")
	{
		if (weathermulti == false)
		{
			var myhtml =  '<div class="ui-block-a"><h2><b>' + weathertitle + '</b></h2>';
		}
		else
		{
			var myhtml =  '<div class="ui-block-a"><a href="#weather-location"><h2><b>' + weathertitle + '</b> (<u>location</u>)</h2></a>';
		}

		myhtml += '<h3>' + data.CURRENT.TEXT + '</h3></div><div class="ui-block-b"><div id="weather' + data.CURRENT.ICON + '" class="weather_sprites displayed"></div></div><div class="ui-block-c weather_c">' + data.CURRENT.TEMP + '&deg;</div><div class="ui-block-c weather_f weather-hidden">' +fahrenheit + '&deg;</div>';
	}
	else
	{
		//if ($("#weather-location-listview").html() == "")
		if (weathermulti == false)
		{
			var myhtml =  '<div class="ui-block-a"><h2><b>' + weathertitle + '</b></h2>';
		}
		else
		{
			var myhtml =  '<div class="ui-block-a"><a href="#weather-location"><h2><b>' + weathertitle + '</b> (change)</h2></a>';
		}
		
		myhtml += '<h3>' + data.CURRENT.TEXT + '</h3></div><div class="ui-block-b"><div id="weather' + data.CURRENT.ICON + '" class="weather_sprites displayed"></div></div><div class="ui-block-c weather_c weather-hidden">' + data.CURRENT.TEMP + '&deg;</div><div class="ui-block-c weather_f">' +fahrenheit + '&deg;</div>';
	}
	
	$("#weather_title").html(myhtml);
	
	
	
	
	
	


	$.mobile.hidePageLoadingMsg();
}


function toggle_weather()
{
	if( $(".weather_f").hasClass("weather-hidden")){
		$(".weather_f").removeClass("weather-hidden");
		$(".weather_c").addClass("weather-hidden");
		weather = "f";
	}
	else
	{
		$(".weather_c").removeClass("weather-hidden");
		$(".weather_f").addClass("weather-hidden");
		weather = "c";
	}
	
	//store data
	if (typeof(localStorage) != 'undefined'){
		localStorage.removeItem("weather");
		localStorage.setItem("weather",weather);
	}
}

//menus
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function set_destination_sub(filter)
{
	$.mobile.changePage("#destinations-sub");
	$.mobile.loadingMessage = "loading";
	$.mobile.showPageLoadingMsg();
		
	$("#destination-sub-title").html(filter);
	
	filter = filter.toLowerCase().replace(/ /g, "-") + "-listview";
	
	
	$("#div-search ul").attr("style", "display:none");
	$("#" + filter).attr("style", "display:block");
	
	//show search box for sub destination
	$("#div-search .ui-listview-filter").attr("style", "display:none");
	$("#" + filter).prev().attr("style", "display:block");
	
	$.mobile.hidePageLoadingMsg();
}

function setcfilter(id)
{
	//update
	current_nearme_categoryid = id;
	
	get_nearmenow();
}


function setfilter(type,value,id)
{
	value = stripslashes(value);

	value = value.replace(/(^[\s\xA0]+|[\s\xA0]+$)/g, '');
	if (type == "location")
	{
		current_category_location = value;
		$("#flocation").html("Location (" + value + ")");
	}
	
	if (type == "sortby")
	{
		current_category_sort = value;
		if(value == "name") value = "A-Z";
		if(value == "creation") value = "Most recent";
		
		$("#fsortby").html("Sort By (" + value + ")");
	}
	
	if (type == "type")
	{
		//current_category_txt = value;
		//current_category_id = id;
		current_category_type = value;
		
		$("#ftype").html("Type (" + value + ")");
		ftype_id = id;
	}

	//hide regions from locations if filter is set	
	if ((current_category_type == "" || current_category_type == "All")  && (current_category_location == "" || current_category_location == "All"))
	{
		$(".filter_location_region").removeClass("hidden");
	}
	else
	{
		$(".filter_location_region").addClass("hidden");	
	}
	
	getCategoryId(id,false,"");
}


function filter()
{
	//toggle div
	$("#div-filter").slideToggle();	
	
	if( $("#settings .ui-icon").hasClass("ui-icon-arrow-d"))
	{
		$("#settings .ui-icon").removeClass("ui-icon-arrow-d").addClass("ui-icon-arrow-u");
	}
	else
	{
		$("#settings .ui-icon").removeClass("ui-icon-arrow-u").addClass("ui-icon-arrow-d");
	}
	
}




//general functions
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
function getAjax(url,callback){
	//make request to server
	//console.log("getAjax: " + url);
	
	$.ajax({
		url: url,
		timeout:10000,
		type: 'GET',
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: callback,
		error: function(xhr, status, error) {
			console.log("Error: " + url);
			$.mobile.hidePageLoadingMsg();
			alert("Error connecting to the server. Please try again.");
		},
		success: function(jsonp) { 
		}
	});
}

function addslashes (str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function stripslashes (str) {
   
    return (str + '').replace(/\\(.?)/g, function (s, n1) {
        switch (n1) {
        case '\\':
            return '\\';
        case '0':
            return '\u0000';
        case '':
            return '';
        default:
            return n1;
        }
    });
}

function gettimestamp()
{
	return Math.round((new Date()).getTime() / 1000);
}


function rsttodate(sdate)
{
	var date = new Date(sdate);
	if(date.toString() == "Invalid Date")
  	{
       var spDate = sdate.replace(",", "").split(" ");
       date = new Date(spDate[2] + "/" + spDate[0]+ "/" + spDate[1]);
   	}
	return date;
}


var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


function closeSplash(){
	//check if we already have a destination, if so go straight to it
	if (startpage != ""){ 
		$.mobile.changePage("#" + startpage, { transition: "fade"});	
		startpage = "";
	}
}



function getDistance(dist){
	if (dist < 1){ dist = ((Math.round(dist*100) /100) * 1000) + 'm';}
	else {dist = (Math.round(dist*100)/100) + 'km';}
	return dist;
}

function scrollx ()
{
		//$(":jqmData(role='page')").live("pageshow", function(event) {
		//var $page = $(this);
	
		// For the demos that use this script, we want the content area of each
		// page to be scrollable in the 'y' direction.
	
		//$('#nearmenow').find(".ui-content").attr("data-"+ $.mobile.ns +"scroll", "y");
	
		// This code that looks for [data-scroll] will eventually be folded
		// into the jqm page processing code when scrollview support is "official"
		// instead of "experimental".
		
	
		$('#nearmenow').find(":jqmData(scroll):not(.ui-scrollview-clip)").each(function(){
		//$page.find(":jqmData(scroll):not(.ui-scrollview-clip)").each(function(){
			var $this = $(this);
			// XXX: Remove this check for ui-scrolllistview once we've
			//      integrated list divider support into the main scrollview class.
			if ($this.hasClass("ui-scrolllistview"))
				$this.scrolllistview();
			else
			{
				var st = $this.jqmData("scroll") + "";
				var paging = st && st.search(/^[xy]p$/) != -1;
				var dir = st && st.search(/^[xy]/) != -1 ? st.charAt(0) : null;
	
				var opts = {};
				if (dir)
					opts.direction = dir;
				if (paging)
					opts.pagingEnabled = true;
	
				var method = $this.jqmData("scroll-method");
				if (method)
					opts.scrollMethod = method;
	
				$this.scrollview(opts);
			}
		});
		
		
		$('#company').find(":jqmData(scroll):not(.ui-scrollview-clip)").each(function(){
		//$page.find(":jqmData(scroll):not(.ui-scrollview-clip)").each(function(){
			var $this = $(this);
			// XXX: Remove this check for ui-scrolllistview once we've
			//      integrated list divider support into the main scrollview class.
			if ($this.hasClass("ui-scrolllistview"))
				$this.scrolllistview();
			else
			{
				var st = $this.jqmData("scroll") + "";
				var paging = st && st.search(/^[xy]p$/) != -1;
				var dir = st && st.search(/^[xy]/) != -1 ? st.charAt(0) : null;
	
				var opts = {};
				if (dir)
					opts.direction = dir;
				if (paging)
					opts.pagingEnabled = true;
	
				var method = $this.jqmData("scroll-method");
				if (method)
					opts.scrollMethod = method;
	
				$this.scrollview(opts);
			}
		});
		//ResizePageContentHeight(event.target);
	//});
}







/*
* jQuery Mobile Framework : scrollview plugin
* Copyright (c) 2010 Adobe Systems Incorporated - Kin Blas (jblas@adobe.com)
* Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
* Note: Code is in draft form and is subject to change 
*/
(function($,window,document,undefined){

jQuery.widget( "mobile.scrollview", jQuery.mobile.widget, {
	options: {
		fps:               60,    // Frames per second in msecs.
		direction:         null,  // "x", "y", or null for both.
	
		scrollDuration:    2000,  // Duration of the scrolling animation in msecs.
		overshootDuration: 250,   // Duration of the overshoot animation in msecs.
		snapbackDuration:  500,   // Duration of the snapback animation in msecs.
	
		moveThreshold:     10,   // User must move this many pixels in any direction to trigger a scroll.
		moveIntervalThreshold:     150,   // Time between mousemoves must not exceed this threshold.
	
		scrollMethod:      "translate",  // "translate", "position", "scroll"
	
		startEventName:    "scrollstart",
		updateEventName:   "scrollupdate",
		stopEventName:     "scrollstop",
	
		eventType:         $.support.touch ? "touch" : "mouse",
	
		showScrollBars:    false,
		
		pagingEnabled:     false,
		delayedClickSelector: "a,input,textarea,select,button,.ui-btn",
		delayedClickEnabled: false
	},

	_makePositioned: function($ele)
	{
		if ($ele.css("position") == "static")
			$ele.css("position", "relative");
	},

	_create: function()
	{ 
		this._$clip = $(this.element).addClass("ui-scrollview-clip");
		var $child = this._$clip.children();
		if ($child.length > 1) {
			$child = this._$clip.wrapInner("<div></div>").children();
		}
		this._$view = $child.addClass("ui-scrollview-view");

		this._$clip.css("overflow", this.options.scrollMethod === "scroll" ? "scroll" : "hidden");
		this._makePositioned(this._$clip);

		this._$view.css("overflow", "hidden");

		// Turn off our faux scrollbars if we are using native scrolling
		// to position the view.

		this.options.showScrollBars = this.options.scrollMethod === "scroll" ? false : this.options.showScrollBars;

		// We really don't need this if we are using a translate transformation
		// for scrolling. We set it just in case the user wants to switch methods
		// on the fly.

		this._makePositioned(this._$view);
		this._$view.css({ left: 0, top: 0 });

		this._sx = 0;
		this._sy = 0;
	
		var direction = this.options.direction;
		this._hTracker = (direction !== "y")   ? new MomentumTracker(this.options) : null;
		this._vTracker = (direction !== "x") ? new MomentumTracker(this.options) : null;
	
		this._timerInterval = 1000/this.options.fps;
		this._timerID = 0;
	
		var self = this;
		this._timerCB = function(){ self._handleMomentumScroll(); };
	
		this._addBehaviors();
	},

	_startMScroll: function(speedX, speedY)
	{
		this._stopMScroll();
		this._showScrollBars();

		var keepGoing = false;
		var duration = this.options.scrollDuration;

		this._$clip.trigger(this.options.startEventName);

		var ht = this._hTracker;
		if (ht)
		{
			var c = this._$clip.width();
			var v = this._$view.width();
			ht.start(this._sx, speedX, duration, (v > c) ? -(v - c) : 0, 0);
			keepGoing = !ht.done();
		}

		var vt = this._vTracker;
		if (vt)
		{
			var c = this._$clip.height();
			var v = this._$view.height();
			vt.start(this._sy, speedY, duration, (v > c) ? -(v - c) : 0, 0);
			keepGoing = keepGoing || !vt.done();
		}

		if (keepGoing)
			this._timerID = setTimeout(this._timerCB, this._timerInterval);
		else
			this._stopMScroll();
	},

	_stopMScroll: function()
	{
		if (this._timerID)
		{
			this._$clip.trigger(this.options.stopEventName);
			clearTimeout(this._timerID);
		}
		this._timerID = 0;

		if (this._vTracker)
			this._vTracker.reset();

		if (this._hTracker)
			this._hTracker.reset();

		this._hideScrollBars();
	},

	_handleMomentumScroll: function()
	{
		var keepGoing = false;
		var v = this._$view;

		var x = 0, y = 0;

		var vt = this._vTracker;
		if (vt)
		{
			vt.update();
			y = vt.getPosition();
			keepGoing = !vt.done();
		}

		var ht = this._hTracker;
		if (ht)
		{
			ht.update();
			x = ht.getPosition();
			keepGoing = keepGoing || !ht.done();
		}

		this._setScrollPosition(x, y);
		this._$clip.trigger(this.options.updateEventName, [ { x: x, y: y } ]);

		if (keepGoing)
			this._timerID = setTimeout(this._timerCB, this._timerInterval);	
		else
			this._stopMScroll();
	},

	_setScrollPosition: function(x, y)
	{
		this._sx = x;
		this._sy = y;

		var $v = this._$view;

		var sm = this.options.scrollMethod;

		switch (sm)
		{
			case "translate":
				setElementTransform($v, x + "px", y + "px");
				break;
			case "position":
				$v.css({left: x + "px", top: y + "px"});
				break;
			case "scroll":
				var c = this._$clip[0];
				c.scrollLeft = -x;
				c.scrollTop = -y;
				break;
		}

		var $vsb = this._$vScrollBar;
		var $hsb = this._$hScrollBar;

		if ($vsb)
		{
			var $sbt = $vsb.find(".ui-scrollbar-thumb");
			if (sm === "translate")
				setElementTransform($sbt, "0px", -y/$v.height() * $sbt.parent().height() + "px");
			else
				$sbt.css("top", -y/$v.height()*100 + "%");
		}

		if ($hsb)
		{
			var $sbt = $hsb.find(".ui-scrollbar-thumb");
			if (sm === "translate")
				setElementTransform($sbt,  -x/$v.width() * $sbt.parent().width() + "px", "0px");
			else
				$sbt.css("left", -x/$v.width()*100 + "%");
		}
	},

	scrollTo: function(x, y, duration)
	{
		this._stopMScroll();
		if (!duration)
			return this._setScrollPosition(x, y);

		x = -x;
		y = -y;

		var self = this;
		var start = getCurrentTime();
		var efunc = $.easing["easeOutQuad"];
		var sx = this._sx;
		var sy = this._sy;
		var dx = x - sx;
		var dy = y - sy;
		var tfunc = function(){
			var elapsed = getCurrentTime() - start;
			if (elapsed >= duration)
			{
				self._timerID = 0;
				self._setScrollPosition(x, y);
			}
			else
			{
				var ec = efunc(elapsed/duration, elapsed, 0, 1, duration);
				self._setScrollPosition(sx + (dx * ec), sy + (dy * ec));
				self._timerID = setTimeout(tfunc, self._timerInterval);
			}
		};

		this._timerID = setTimeout(tfunc, this._timerInterval);
	},

	getScrollPosition: function()
	{
		return { x: -this._sx, y: -this._sy };
	},

	_getScrollHierarchy: function()
	{
		var svh = [];
		this._$clip.parents(".ui-scrollview-clip").each(function(){
			var d = $(this).jqmData("scrollview");
			if (d) svh.unshift(d);
		});
		return svh;
	},

	_getAncestorByDirection: function(dir)
	{
		var svh = this._getScrollHierarchy();
		var n = svh.length;
		while (0 < n--)
		{
			var sv = svh[n];
			var svdir = sv.options.direction;

			if (!svdir || svdir == dir)
				return sv;
		}
		return null;
	},

	_handleDragStart: function(e, ex, ey)
	{
		// Stop any scrolling of elements in our parent hierarcy.
		$.each(this._getScrollHierarchy(),function(i,sv){ sv._stopMScroll(); });
		this._stopMScroll();

		var c = this._$clip;
		var v = this._$view;

		if (this.options.delayedClickEnabled) {
			this._$clickEle = $(e.target).closest(this.options.delayedClickSelector);
		}
		this._lastX = ex;
		this._lastY = ey;
		this._doSnapBackX = false;
		this._doSnapBackY = false;
		this._speedX = 0;
		this._speedY = 0;
		this._directionLock = "";
		this._didDrag = false;

		if (this._hTracker)
		{
			var cw = parseInt(c.css("width"), 10);
			var vw = parseInt(v.css("width"), 10);
			this._maxX = cw - vw;
			if (this._maxX > 0) this._maxX = 0;
			if (this._$hScrollBar)
				this._$hScrollBar.find(".ui-scrollbar-thumb").css("width", (cw >= vw ? "100%" : Math.floor(cw/vw*100)+ "%"));
		}

		if (this._vTracker)
		{
			var ch = parseInt(c.css("height"), 10);
			var vh = parseInt(v.css("height"), 10);
			this._maxY = ch - vh;
			if (this._maxY > 0) this._maxY = 0;
			if (this._$vScrollBar)
				this._$vScrollBar.find(".ui-scrollbar-thumb").css("height", (ch >= vh ? "100%" : Math.floor(ch/vh*100)+ "%"));
		}

		var svdir = this.options.direction;

		this._pageDelta = 0;
		this._pageSize = 0;
		this._pagePos = 0; 

		if (this.options.pagingEnabled && (svdir === "x" || svdir === "y"))
		{
			this._pageSize = svdir === "x" ? cw : ch;
			this._pagePos = svdir === "x" ? this._sx : this._sy;
			this._pagePos -= this._pagePos % this._pageSize;
		}
		this._lastMove = 0;
		this._enableTracking();

		// If we're using mouse events, we need to prevent the default
		// behavior to suppress accidental selection of text, etc. We
		// can't do this on touch devices because it will disable the
		// generation of "click" events.
		//
		// XXX: We should test if this has an effect on links! - kin

		if (this.options.eventType == "mouse" || this.options.delayedClickEnabled)
			e.preventDefault();
		e.stopPropagation();
	},

	_propagateDragMove: function(sv, e, ex, ey, dir)
	{
		this._hideScrollBars();
		this._disableTracking();
		sv._handleDragStart(e,ex,ey);
		sv._directionLock = dir;
		sv._didDrag = this._didDrag;
	},

	_handleDragMove: function(e, ex, ey)
	{
		this._lastMove = getCurrentTime();

		var v = this._$view;

		var dx = ex - this._lastX;
		var dy = ey - this._lastY;
		var svdir = this.options.direction;

		if (!this._directionLock)
		{
			var x = Math.abs(dx);
			var y = Math.abs(dy);
			var mt = this.options.moveThreshold;

			if (x < mt && y < mt) {
				return false;
			}

			var dir = null;
			var r = 0;
			if (x < y && (x/y) < 0.5) {
				dir = "y";
			}
			else if (x > y && (y/x) < 0.5) {
				dir = "x";
			}

			if (svdir && dir && svdir != dir)
			{
				// This scrollview can't handle the direction the user
				// is attempting to scroll. Find an ancestor scrollview
				// that can handle the request.

				var sv = this._getAncestorByDirection(dir);
				if (sv)
				{
					this._propagateDragMove(sv, e, ex, ey, dir);
					return false;
				}
			}

			this._directionLock = svdir ? svdir : (dir ? dir : "none");
		}

		var newX = this._sx;
		var newY = this._sy;

		if (this._directionLock !== "y" && this._hTracker)
		{
			var x = this._sx;
			this._speedX = dx;
			newX = x + dx;

			// Simulate resistance.

			this._doSnapBackX = false;
			if (newX > 0 || newX < this._maxX)
			{
				if (this._directionLock === "x")
				{
					var sv = this._getAncestorByDirection("x");
					if (sv)
					{
						this._setScrollPosition(newX > 0 ? 0 : this._maxX, newY);
						this._propagateDragMove(sv, e, ex, ey, dir);
						return false;
					}
				}
				newX = x + (dx/2);
				this._doSnapBackX = true;
			}
		}

		if (this._directionLock !== "x" && this._vTracker)
		{
			var y = this._sy;
			this._speedY = dy;
			newY = y + dy;

			// Simulate resistance.

			this._doSnapBackY = false;
			if (newY > 0 || newY < this._maxY)
			{
				if (this._directionLock === "y")
				{
					var sv = this._getAncestorByDirection("y");
					if (sv)
					{
						this._setScrollPosition(newX, newY > 0 ? 0 : this._maxY);
						this._propagateDragMove(sv, e, ex, ey, dir);
						return false;
					}
				}

				newY = y + (dy/2);
				this._doSnapBackY = true;
			}

		}

		if (this.options.pagingEnabled && (svdir === "x" || svdir === "y"))
		{
			if (this._doSnapBackX || this._doSnapBackY)
				this._pageDelta = 0;
			else
			{
				var opos = this._pagePos;
				var cpos = svdir === "x" ? newX : newY;
				var delta = svdir === "x" ? dx : dy;

				this._pageDelta = (opos > cpos && delta < 0) ? this._pageSize : ((opos < cpos && delta > 0) ? -this._pageSize : 0);
			}
		}

		this._didDrag = true;
		this._lastX = ex;
		this._lastY = ey;

		this._setScrollPosition(newX, newY);

		this._showScrollBars();

		// Call preventDefault() to prevent touch devices from
		// scrolling the main window.

		// e.preventDefault();
		
		return false;
	},

	_handleDragStop: function(e)
	{
		var l = this._lastMove;
		var t = getCurrentTime();
		var doScroll = l && (t - l) <= this.options.moveIntervalThreshold;

		var sx = (this._hTracker && this._speedX && doScroll) ? this._speedX : (this._doSnapBackX ? 1 : 0);
		var sy = (this._vTracker && this._speedY && doScroll) ? this._speedY : (this._doSnapBackY ? 1 : 0);

		var svdir = this.options.direction;
		if (this.options.pagingEnabled && (svdir === "x" || svdir === "y") && !this._doSnapBackX && !this._doSnapBackY)
		{
			var x = this._sx;
			var y = this._sy;
			if (svdir === "x")
				x = -this._pagePos + this._pageDelta;
			else
				y = -this._pagePos + this._pageDelta;

			this.scrollTo(x, y, this.options.snapbackDuration);
		}
		else if (sx || sy)
			this._startMScroll(sx, sy);
		else
			this._hideScrollBars();

		this._disableTracking();

		if (!this._didDrag && this.options.delayedClickEnabled && this._$clickEle.length) {
			this._$clickEle
				.trigger("mousedown")
				//.trigger("focus")
				.trigger("mouseup")
				.trigger("click");
		}

		// If a view scrolled, then we need to absorb
		// the event so that links etc, underneath our
		// cursor/finger don't fire.

		return this._didDrag ? false : undefined;
	},

	_enableTracking: function()
	{
		$(document).bind(this._dragMoveEvt, this._dragMoveCB);
		$(document).bind(this._dragStopEvt, this._dragStopCB);
	},

	_disableTracking: function()
	{
		$(document).unbind(this._dragMoveEvt, this._dragMoveCB);
		$(document).unbind(this._dragStopEvt, this._dragStopCB);
	},

	_showScrollBars: function()
	{
		var vclass = "ui-scrollbar-visible";
		if (this._$vScrollBar) this._$vScrollBar.addClass(vclass);
		if (this._$hScrollBar) this._$hScrollBar.addClass(vclass);
	},

	_hideScrollBars: function()
	{
		var vclass = "ui-scrollbar-visible";
		if (this._$vScrollBar) this._$vScrollBar.removeClass(vclass);
		if (this._$hScrollBar) this._$hScrollBar.removeClass(vclass);
	},

	_addBehaviors: function()
	{
		var self = this;
		if (this.options.eventType === "mouse")
		{
			this._dragStartEvt = "mousedown";
			this._dragStartCB = function(e){ return self._handleDragStart(e, e.clientX, e.clientY); };

			this._dragMoveEvt = "mousemove";
			this._dragMoveCB = function(e){ return self._handleDragMove(e, e.clientX, e.clientY); };

			this._dragStopEvt = "mouseup";
			this._dragStopCB = function(e){ return self._handleDragStop(e); };
		}
		else // "touch"
		{
			this._dragStartEvt = "touchstart";
			this._dragStartCB = function(e)
			{
				var t = e.originalEvent.targetTouches[0];
				return self._handleDragStart(e, t.pageX, t.pageY);
			};

			this._dragMoveEvt = "touchmove";
			this._dragMoveCB = function(e)
			{
				var t = e.originalEvent.targetTouches[0];
				return self._handleDragMove(e, t.pageX, t.pageY);
			};

			this._dragStopEvt = "touchend";
			this._dragStopCB = function(e){ return self._handleDragStop(e); };
		}

		this._$view.bind(this._dragStartEvt, this._dragStartCB);

		if (this.options.showScrollBars)
		{
			var $c = this._$clip;
			var prefix = "<div class=\"ui-scrollbar ui-scrollbar-";
			var suffix = "\"><div class=\"ui-scrollbar-track\"><div class=\"ui-scrollbar-thumb\"></div></div></div>";
			if (this._vTracker)
			{
				$c.append(prefix + "y" + suffix);
				this._$vScrollBar = $c.children(".ui-scrollbar-y");
			}
			if (this._hTracker)
			{
				$c.append(prefix + "x" + suffix);
				this._$hScrollBar = $c.children(".ui-scrollbar-x");
			}
		}
	}
});

function setElementTransform($ele, x, y)
{
	var v = "translate3d(" + x + "," + y + ", 0px)";
	$ele.css({
		"-moz-transform": v,
		"-webkit-transform": v,
		"transform": v
	});
}


function MomentumTracker(options)
{
	this.options = $.extend({}, options);
	this.easing = "easeOutQuad";
	this.reset();
}

var tstates = {
	scrolling: 0,
	overshot:  1,
	snapback:  2,
	done:      3
};

function getCurrentTime() { return (new Date()).getTime(); }

$.extend(MomentumTracker.prototype, {
	start: function(pos, speed, duration, minPos, maxPos)
	{
		this.state = (speed != 0) ? ((pos < minPos || pos > maxPos) ? tstates.snapback : tstates.scrolling) : tstates.done;
		this.pos = pos;
		this.speed = speed;
		this.duration = (this.state == tstates.snapback) ? this.options.snapbackDuration : duration;
		this.minPos = minPos;
		this.maxPos = maxPos;

		this.fromPos = (this.state == tstates.snapback) ? this.pos : 0;
		this.toPos = (this.state == tstates.snapback) ? ((this.pos < this.minPos) ? this.minPos : this.maxPos) : 0;

		this.startTime = getCurrentTime();
	},

	reset: function()
	{
		this.state = tstates.done;
		this.pos = 0;
		this.speed = 0;
		this.minPos = 0;
		this.maxPos = 0;
		this.duration = 0;
	},

	update: function()
	{
		var state = this.state;
		if (state == tstates.done)
			return this.pos;

		var duration = this.duration;
		var elapsed = getCurrentTime() - this.startTime;
		elapsed = elapsed > duration ? duration : elapsed;

		if (state == tstates.scrolling || state == tstates.overshot)
		{
			var dx = this.speed * (1 - $.easing[this.easing](elapsed/duration, elapsed, 0, 1, duration));
	
			var x = this.pos + dx;
	
			var didOverShoot = (state == tstates.scrolling) && (x < this.minPos || x > this.maxPos);
			if (didOverShoot)
				x = (x < this.minPos) ? this.minPos : this.maxPos;
		
			this.pos = x;
	
			if (state == tstates.overshot)
			{
				if (elapsed >= duration)
				{
					this.state = tstates.snapback;
					this.fromPos = this.pos;
					this.toPos = (x < this.minPos) ? this.minPos : this.maxPos;
					this.duration = this.options.snapbackDuration;
					this.startTime = getCurrentTime();
					elapsed = 0;
				}
			}
			else if (state == tstates.scrolling)
			{
				if (didOverShoot)
				{
					this.state = tstates.overshot;
					this.speed = dx / 2;
					this.duration = this.options.overshootDuration;
					this.startTime = getCurrentTime();
				}
				else if (elapsed >= duration)
					this.state = tstates.done;
			}
		}
		else if (state == tstates.snapback)
		{
			if (elapsed >= duration)
			{
				this.pos = this.toPos;
				this.state = tstates.done;		
			}
			else
				this.pos = this.fromPos + ((this.toPos - this.fromPos) * $.easing[this.easing](elapsed/duration, elapsed, 0, 1, duration));
		}

		return this.pos;
	},

	done: function() { return this.state == tstates.done; },
	getPosition: function(){ return this.pos; }
});

jQuery.widget( "mobile.scrolllistview", jQuery.mobile.scrollview, {
	options: {
		direction: "y"
	},

	_create: function() {
		$.mobile.scrollview.prototype._create.call(this);
	
		// Cache the dividers so we don't have to search for them everytime the
		// view is scrolled.
		//
		// XXX: Note that we need to update this cache if we ever support lists
		//      that can dynamically update their content.
	
		this._$dividers = this._$view.find(":jqmData(role='list-divider')");
		this._lastDivider = null;
	},

	_setScrollPosition: function(x, y)
	{
		// Let the view scroll like it normally does.
	
		$.mobile.scrollview.prototype._setScrollPosition.call(this, x, y);

		y = -y;

		// Find the dividers for the list.

		var $divs = this._$dividers;
		var cnt = $divs.length;
		var d = null;
		var dy = 0;
		var nd = null;

		for (var i = 0; i < cnt; i++)
		{
			nd = $divs.get(i);
			var t = nd.offsetTop;
			if (y >= t)
			{
				d = nd;
				dy = t;
			}
			else if (d)
				break;
		}

		// If we found a divider to move position it at the top of the
		// clip view.

		if (d)
		{
			var h = d.offsetHeight;
			var mxy = (d != nd) ? nd.offsetTop : (this._$view.get(0).offsetHeight);
			if (y + h >= mxy)
				y = (mxy - h) - dy;
			else
				y = y - dy;

			// XXX: Need to convert this over to using $().css() and supporting the non-transform case.

			var ld = this._lastDivider;
			if (ld && d != ld) {
				setElementTransform($(ld), 0, 0);
			}
			setElementTransform($(d), 0, y + "px");
			this._lastDivider = d;

		}
	}
});

})(jQuery,window,document); // End Component





/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
 
 
 
 
 //date format
 (function ($) {
		
		var daysInWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var shortMonthsInYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var longMonthsInYear = ["January", "February", "March", "April", "May", "June", 
														"July", "August", "September", "October", "November", "December"];
		var shortMonthsToNumber = [];
		shortMonthsToNumber["Jan"] = "01";
		shortMonthsToNumber["Feb"] = "02";
		shortMonthsToNumber["Mar"] = "03";
		shortMonthsToNumber["Apr"] = "04";
		shortMonthsToNumber["May"] = "05";
		shortMonthsToNumber["Jun"] = "06";
		shortMonthsToNumber["Jul"] = "07";
		shortMonthsToNumber["Aug"] = "08";
		shortMonthsToNumber["Sep"] = "09";
		shortMonthsToNumber["Oct"] = "10";
		shortMonthsToNumber["Nov"] = "11";
		shortMonthsToNumber["Dec"] = "12";
	
    $.format = (function () {
        function strDay(value) {
 						return daysInWeek[parseInt(value, 10)] || value;
        }

        function strMonth(value) {
						var monthArrayIndex = parseInt(value, 10) - 1;
 						return shortMonthsInYear[monthArrayIndex] || value;
        }

        function strLongMonth(value) {
					var monthArrayIndex = parseInt(value, 10) - 1;
					return longMonthsInYear[monthArrayIndex] || value;					
        }

        var parseMonth = function (value) {
					return shortMonthsToNumber[value] || value;
        };

        var parseTime = function (value) {
                var retValue = value;
                var millis = "";
                if (retValue.indexOf(".") !== -1) {
                    var delimited = retValue.split('.');
                    retValue = delimited[0];
                    millis = delimited[1];
                }

                var values3 = retValue.split(":");

                if (values3.length === 3) {
                    hour = values3[0];
                    minute = values3[1];
                    second = values3[2];

                    return {
                        time: retValue,
                        hour: hour,
                        minute: minute,
                        second: second,
                        millis: millis
                    };
                } else {
                    return {
                        time: "",
                        hour: "",
                        minute: "",
                        second: "",
                        millis: ""
                    };
                }
            };

        return {
            date: function (value, format) {
                /* 
					value = new java.util.Date()
                 	2009-12-18 10:54:50.546 
				*/
                try {
                    var date = null;
                    var year = null;
                    var month = null;
                    var dayOfMonth = null;
                    var dayOfWeek = null;
                    var time = null;
                    if (typeof value.getFullYear === "function") {
                        year = value.getFullYear();
                        month = value.getMonth() + 1;
                        dayOfMonth = value.getDate();
                        dayOfWeek = value.getDay();
                        time = parseTime(value.toTimeString());
										} else if (value.search(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[-+]?\d{2}:\d{2}/) != -1) { /* 2009-04-19T16:11:05+02:00 */
                        var values = value.split(/[T\+-]/);
                        year = values[0];
                        month = values[1];
                        dayOfMonth = values[2];
                        time = parseTime(values[3].split(".")[0]);
                        date = new Date(year, month - 1, dayOfMonth);
                        dayOfWeek = date.getDay();
                    } else {
                        var values = value.split(" ");
                        switch (values.length) {
                        case 6:
                            /* Wed Jan 13 10:43:41 CET 2010 */
                            year = values[5];
                            month = parseMonth(values[1]);
                            dayOfMonth = values[2];
                            time = parseTime(values[3]);
                            date = new Date(year, month - 1, dayOfMonth);
                            dayOfWeek = date.getDay();
                            break;
                        case 2:
                            /* 2009-12-18 10:54:50.546 */
                            var values2 = values[0].split("-");
                            year = values2[0];
                            month = values2[1];
                            dayOfMonth = values2[2];
                            time = parseTime(values[1]);
                            date = new Date(year, month - 1, dayOfMonth);
                            dayOfWeek = date.getDay();
                            break;
                        case 7:
                            /* Tue Mar 01 2011 12:01:42 GMT-0800 (PST) */
                        case 9:
                            /*added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time) */
                        case 10:
                            /* added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time) */
                            year = values[3];
                            month = parseMonth(values[1]);
                            dayOfMonth = values[2];
                            time = parseTime(values[4]);
                            date = new Date(year, month - 1, dayOfMonth);
                            dayOfWeek = date.getDay();
                            break;
                        default:
                            return value;
                        }
                    }

                    var pattern = "";
                    var retValue = "";
                    /*
						Issue 1 - variable scope issue in format.date 
                    	Thanks jakemonO
					*/
                    for (var i = 0; i < format.length; i++) {
                        var currentPattern = format.charAt(i);
                        pattern += currentPattern;
                        switch (pattern) {
                        case "ddd":
                            retValue += strDay(dayOfWeek);
                            pattern = "";
                            break;
                        case "dd":
                            if (format.charAt(i + 1) == "d") {
                                break;
                            }
                            if (String(dayOfMonth).length === 1) {
                                dayOfMonth = '0' + dayOfMonth;
                            }
                            retValue += dayOfMonth;
                            pattern = "";
                            break;
                        case "MMMM":
                            retValue += strLongMonth(month);
                            pattern = "";
                            break;
                        case "MMM":
                            if (format.charAt(i + 1) === "M") {
                                break;
                            }
                            retValue += strMonth(month);
                            pattern = "";
                            break;
                        case "MM":
                            if (format.charAt(i + 1) == "M") {
                                break;
                            }
                            if (String(month).length === 1) {
                                month = '0' + month;
                            }
                            retValue += month;
                            pattern = "";
                            break;
                        case "yyyy":
                            retValue += year;
                            pattern = "";
                            break;
                        case "HH":
                            retValue += time.hour;
                            pattern = "";
                            break;
                        case "hh":
                            /* time.hour is "00" as string == is used instead of === */
                            retValue += (time.hour == 0 ? 12 : time.hour < 13 ? time.hour : time.hour - 12);
                            pattern = "";
                            break;
                        case "mm":
                            retValue += time.minute;
                            pattern = "";
                            break;
                        case "ss":
                            /* ensure only seconds are added to the return string */
                            retValue += time.second.substring(0, 2);
                            pattern = "";
                            break;
                        case "SSS":
                            retValue += time.millis.substring(0, 3);
                            pattern = "";
                            break;
                        case "a":
                            retValue += time.hour >= 12 ? "PM" : "AM";
                            pattern = "";
                            break;
                        case " ":
                            retValue += currentPattern;
                            pattern = "";
                            break;
                        case "/":
                            retValue += currentPattern;
                            pattern = "";
                            break;
                        case ":":
                            retValue += currentPattern;
                            pattern = "";
                            break;
                        default:
                            if (pattern.length === 2 && pattern.indexOf("y") !== 0 && pattern != "SS") {
                                retValue += pattern.substring(0, 1);
                                pattern = pattern.substring(1, 2);
                            } else if ((pattern.length === 3 && pattern.indexOf("yyy") === -1)) {
                                pattern = "";
                            }
                        }
                    }
                    return retValue;
                } catch (e) {
                    console.log(e);
                    return value;
                }
            }
        };
    }());
}(jQuery));


$(document).ready(function () {
    $(".shortDateFormat").each(function (idx, elem) {
        if ($(elem).is(":input")) {
            $(elem).val($.format.date($(elem).val(), "dd/MM/yyyy"));
        } else {
            $(elem).text($.format.date($(elem).text(), "dd/MM/yyyy"));
        }
    });
    $(".longDateFormat").each(function (idx, elem) {
        if ($(elem).is(":input")) {
            $(elem).val($.format.date($(elem).val(), "dd/MM/yyyy hh:mm:ss"));
        } else {
            $(elem).text($.format.date($(elem).text(), "dd/MM/yyyy hh:mm:ss"));
        }
    });
});




/*
  mustache.js — Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line !== "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag, "g");
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the curent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || partials[name] === undefined) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '&quot;';
        case "'": return '&#39;';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.1-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();




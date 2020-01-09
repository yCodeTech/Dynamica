/*DYNAMICA


Example settings

$(".example").dynamica({
	directory: "Images/Gallery%20Images/",
	imgWrapperClass: "wrapper",
	imgAttributes:{
		"data-example":"This is an example",
		"class":"owl-lazy",
	},			
});
*/


(function($) {
	$.fn.dynamica = function(options) {
		 
		//** Get selector **//

		// Get node name of attribute of the selector (class or id)
		var $nodeName = this["0"].attributes["0"].nodeName;
		// Get node value of attribute of the selector (the unique name of class or id)
		var $nodeValue = this["0"].attributes["0"].nodeValue;
		// If node name is class	
		if ($nodeName == "class") {
			$class = "."+$nodeValue; // Attach the prefix dot "." to the value
			$selector = $class; // Set the selector
		}
		// If node name is id
		else if ($nodeName == "id") {
			$id = "#"+$nodeValue; // Attach the prefix hash "#" to the value
			$selector = $id; // Set the selector
		}
		// Output
		// console.log($selector); 
		// eg. .example   #example
		
		
		//** Default Settings **//
		
		var settings = $.extend({
			// Directory of the images. Write it like as it would appear in the URL.
			directory: "", 
			
			// Class of the img wrapper.
			// Could be a list of space separated classes.
			imgWrapperClass: "",  
								  
			// Set img src inside a data-src attribute instead of regular src, used for lazy loading.
			dataSrc: false, 
			
			// Set image attributes.
			// Could be a list of comma separated attributes.
			// All attributes accepted except src, data-src and data-id (which are overwritten for use in the plugin).
			// For data-src attributes, please use the dataSrc setting.
			imgAttributes: {  
				// In the style of "key":"value", eg.
				
				// "alt":"This is the alt",
				// "title":"This is the title",
			},
			
			// Enables captions.
			caption: true,
			
			// Class of the caption
			captionClass: "caption", 
			
			// Customise the caption instead of filenames. Requires caption:true
			// Set true for custom captions
			// Set false for filename captions
			customCaption: false, 							  								  
								  
			// Set custom captions for each image
			// Could be a list of comma separated captions.			
			// The key in this object has to be a number and it denotes the image position. Where 1 is the first image, etc.
			// The value in the object can be any mixture of html and text.					  
			customCaption_HTML: { 
				// In the style of "key":"value", eg.
				
				// 1:"This is a custom caption for image 1",
				// 2:"Another caption for image 2",						
			},
			
			// Enable the use of thumbs.
			// Requires the thumbs to have the same name as the hi-res images. 
			thumb: false,
			// Specify the thumb directory using a relative URL path.
			thumbDirectory: "",
			// Specify the hi-res image Data-attribute to insert the url path.
			hiResDataAttr: "src",
			// Enable captions on thumbs.
			thumbCaption: false,
		}, options);
		
		var count = 0;
		var checkOnce = false;
 		var captions = {}; // Create a jQuery object to store all the captions.
		
		$.ajax({
			url: settings.directory,
			async: false,
			success: function(data) {
				$(data).find("a").attr("href", function (i, val) {
					if( val.toLowerCase().match(/\.(jpe?g|png|gif)$/)) { 
						count++; // Counting up from 0, to use for IDs and indexes.
						
						//** Filename **//
						
						$filename = $(this).attr("href").split('/').pop();; // Get file from href attribute
						$directory = settings.directory; // Get directory from settings
						$file = $directory + $filename; // Add directory infront of filename to make the src url
						// Strips the filename of any URL-encoded spaces(%20) and their extensions to make the caption
						$caption = decodeURIComponent($filename).replace(/(.jpg|.gif|.png)/i, "");
						// Make a jQuery object
						captions[count] = $caption; // Store the count value as the index and the $caption as the value.
						
						
						//** HTML Creation **//
						
						$parent = $nodeValue; // Get class or ID of the selector
						// Make the img wrapper.
						$wrapper = $("<div>");
						// Make the img.
						$img = $("<img>");
						// Make the caption wrapper.
						$captionWrapper = "<span>";
						
						// Append wrapper to the selector
						$($selector).append($wrapper);
						// Append img to the wrapper
						$wrapper.append($img);
						
						// Attributes //
						
						// Attach any attributes named to the img
						$img.attr(settings.imgAttributes);
						// Attach alt and title attributes to the img
						$img.attr({"alt": $caption, "title": $caption, "data-id": "#"+$parent+"_img"+count});
						// Attach id and class attributes to the wrapper 
						$wrapper.attr({"id": "dynamicaWrapper", "class": settings.imgWrapperClass});
						
						
						//** Setting the img src/data-src **//
						
						// Normal Src
						if(settings.dataSrc == false && settings.thumb == false) {
							$img.attr("src", $file);
						}
						// dataSrc setting with no thumbs
						else if(settings.dataSrc == true && settings.thumb == false) {
							$img.attr("data-src", $file);
						}
						// thumb setting with no dataSrc
						else if (settings.dataSrc == false && settings.thumb == true) {
							$thumb = settings.thumbDirectory + $filename;
							$hiResDataAttr = "data-" + settings.hiResDataAttr;
							$img.attr("src", $thumb).attr($hiResDataAttr, $file);
						}
						else if (!checkOnce) {
							checkOnce = true;
							
							var $alert1 = "Something is wrong with your gallery ";
							var $alertSelector = $selector;
							var $alert2 = ", please follow the docs located at "; 
							var $alertURL = "http://www.dynamica.ycodetech.co.uk";
							
							var $htmlAlert = $alert1 + 
											 "<b>" + 
											 $alertSelector + 
											 "</b>" + 
											 $alert2 + 
											 "<a href='" + 
											 $alertURL + 
											 "' target='new'>" + 
											 $alertURL;
											 
							var $alert = $alert1 +  
										 $alertSelector +  
										 $alert2 +  
										 $alertURL;
							
							$($selector).before('<div class="alert alert-danger" role="alert">' + $htmlAlert + '</div>');
							console.error($alert);
						}
						
						
				 	}	// End if .match function
				}); // End .find function
			
			
				//** Captions **//
				
				if(settings.caption == true) {
					
					//** Filename Captions **//
					if(settings.customCaption == false){
						// Get each key, value pair from caption array
						$.each(captions, function(key, value) {
							// Get the ID from the key and set a unique imgID
							var imgID = $parent+"_img"+key; 
							// This creates #imgID
							var imgHash = "#"+imgID; 
							
							// Img selector using the imgHash to find the matching imgs
							var img = $("img[data-id='"+imgHash+"']"); 
							
							// Append captionWrapper after the img
							img.after($captionWrapper);
							 // Set a data-caption attribute on the imgWrapper 
							img.parent().attr("data-caption", imgHash);
							// Set a data-captiontext attribute on the img
							img.attr("data-captiontext", value); 
							
							// Find the newly created captionWrappers and add a class.
							var imgCaption = img.siblings().addClass(settings.captionClass);  
							
							// Add the textual caption to the captionWrapper																
							$(imgCaption).html("<p>"+ value +"</p>").attr("id", imgID); 							
						}); // End captions .Each
					} // End if statement Filename Captions
					
					//** Custom Captions **//
					if(settings.customCaption == true) {
						var custCap = settings.customCaption_HTML;
						// Get each key, value pair from the array
						jQuery.each(custCap, function(key, value) {
							// Get the ID from the key and set a unique imgID
							var imgID = $parent+"_img"+key; 
							// This creates #imgID
							var imgHash = "#"+imgID; 
							
							// Img selector using the imgHash to find the matching imgs
							var img = $("img[data-id='"+imgHash+"']"); 
							// Set a data-caption attribute on the imgWrapper
							img.parent().attr("data-caption", imgHash); 
							// Set a data-captiontext attribute on the img
							img.attr("data-captiontext", value); 
							
							// Append captionWrapper after the img
							img.after($captionWrapper); 
							// Find the newly created captionWrappers
							var imgCaption = img.siblings().addClass(settings.captionClass); 
							// Add the textual caption to the captionWrapper
							// and add the imgID as an id attribute
							$(imgCaption).html(value).attr("id", imgID); 
							
						}); // End custCap .Each
					} // End if statement Custom Captions
					
					// Remove thumb captions
					if(settings.thumb == true && settings.thumbCaption == false){
						$($selector).find("." + settings.captionClass).remove();
					}
					
				} // End if statement Captions
					
			} // End success parameter of Ajax
		}); // End Ajax
		
		
	}; // End Dynamica




}(jQuery)); //End jQuery

 

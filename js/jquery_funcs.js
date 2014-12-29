/*
 * This file handles the javascript/jQuery event and styling configurations.
 *
 * Contents:
 *      - OSLC - Namespace that organizes all javascript functions.
 *
 *      - floatNavBar() - Handles configuration for allowing a side navigation
 *          bar to float and stay in view as you scroll.
 *      - highlightConfig() - Handles configuration of highlighting related
 *          input fields on focus. Currently, only handles the support form
 *          fields.
 *      - learn_yoxViewConfig() - Handles configuration of the video gallery on
 *          the Learn page, uses the yoxView jQuery files.
 *      - load_tweets() - Handles the javascript for loading the latest tweets
 *          to be displayed in a news section.
 *      - participate_dropdown() - Handles configuration for the drop down menus
 *          on the participate page.
 *      - primer_navigationConfig() - Handles configuration of primer
 *          navigation. Specifically, styling to show only the expected section.
 *      - submitSupportForm() - Handles the submission event of the
 *          support form.
 *      - support_dialogConfig() - Handles configuration of dialog popups.
 *      - support_validationConfig() - Handles configuration of validation of 
 *          fields using the validationEngine.
 *      - tutorial_navigationConfig() - Handles configuration of tutorial
 *          navigation. Specifically, styling to show only the expected section.
 *      - tutorial_toggleConfig() - Handles configuration for toggleable 
 *          elements, currently only handles toggling in the tutorial 
 *          navigation section.
 *
 *      - Tweet grabbing code.
 *      - UTIL - The variable that is used to hand firing and loading the 
 *          events to be done.
 *      - jQuery Simple Drop Down Menu (jsddm) Plugin code, currently
 *          only used on the Participate page. 
 *
 */

/*
 * Organize all javascript functions into classes to be called when needed.
 * Each page should have a div with the id: js-triggers, from there you can
 * specify which function groups and individual functions you want to call.
 * Example:
 *    <div id="js-triggers" class="js_funcgroup1[func1,func2] js_funcgroup1">
 *    </div>
 *    funcgroup1: {
 *        func1: function() { }
 *    }
 */
var OSLC =
{
    js_common:
    {
        init: function()
        {
            /* Button config for styling */
            $("input:submit, input:reset").button();
        },
        finalize: function()
        {

        }
    },
    js_highlight:
    {
        init: function()
        {
            highlightConfig();
        }
    },
    js_learn:
    {
        init: function()
        {
            learn_yoxViewConfig();
        }
    },
    js_news:
    {
        init: function()
        {
            load_tweets();
        }
    },
    js_participate:
    {
        init: function()
        {
            participate_dropdown();
        }
    },
	js_primer:
	{
		init: function()
		{
			primer_navigationConfig();
			floatNavBar();
		}
	},
	js_support:
	{
		init: function()
		{
			support_dialogConfig();
			support_validationConfig();
		},
		submission: function()
		{
			submitSupportForm();
		}
	},
	js_tutorial:
	{
		init: function()
		{
			tutorial_navigationConfig();
			tutorial_toggleConfig();
			floatNavBar();
		}
	},
	js_subtabs:
	{
		init: function()
		{
			//For the fancy route, need to figure out the tallest item
			if (Modernizr.csstransitions) {

				var subitems_height = [];
				
				//Add the heights of all the elements to an array
				$('.subitems > div').each(function() {
					subitems_height.push( $(this).height() );
					
				});
				
				//Set the container's height to the tallest
				$('.subinfo').css('min-height', Array.max( subitems_height ) + 'px' );

			}
			
			$('.sublist a').bind('click', function(e) {

				subitem = $(this).attr('href')

				//Prevent the link from doing its thing
				e.preventDefault();

				//Remove the active class
				$('.sublist .active').removeClass('active');
				
				//Add an active class
				$(this).parent().addClass('active');
				
				//Hide all others
				if (Modernizr.csstransitions) {				
					$('.subitems > div').removeClass('subitem-active');
					$(subitem).addClass('subitem-active');
					
				} else {
					$('.subitems > div').hide();
					$(subitem).show();
				}
			
			});
			
			//On load, click the first
			$('.sublist li:first-child a').click();
		}
	},
	js_tooltips:
	{
		init: function()
		{
			if (!Modernizr.touch) {
			
				$('.tooltip')
					.wrap('<span class="tooltip-wrap">')
					.append('<b class="tooltip-arrow-wrap"><b class="tooltip-arrow"><\/b><\/b>')
					.before('<a href="#" class="tooltip-link button alt">?<\/a>');
			}
		}
	}
};

$(document).ready(function()
{  
	UTIL.loadEvents();
});

/*
 * After a certain amount of time has passed, checks to see if
 * the loading icon is still visible. If so, there was a problem
 * grabbing the data, so we will display an error message instead.
 */
function checkLoadTime()
{
    var visibility = $('.loading_icon').css("display");

    if(visibility != "none")
    {
        $('.loading_icon').fadeOut(750, function() 
        {
            var err_msg = "Tweets could not be grabbed at this time.";
            $('#latest_tweets').append(err_msg).hide().fadeIn(750);
        });
    }
}

/* 
 * Handle configuration for a floating side nav bar that stays in
 * view as you scroll.
 */
function floatNavBar()
{
    // Make nav bar scroll
    var startOffset = $('#sticky').parent().offset().top;
    
    // Adjust the nav bar's maximum height if the content section is bigger
    if($('#main_content_nav').height() > $('#sticky').parent().height())
        $('#sticky').parent().height($('#main_content_nav').height());
    
    $(window).scroll(function()
    {
        var bottomPos;
        
        // get the maximum scrollTop value
        bottomPos = $('#sticky').parent().height() - $('#sticky').height() - 20;
        if(bottomPos < 0)
            bottomPos = 0;

        // check if the window was scrolled down more than the start 
        // offset declared.
        var pastStartOffset = $(document).scrollTop() > 0; 
        // check if the object is at it's top position (starting point)
        var objFartherThanTopPos = $('#sticky').offset().top > startOffset; 

        // if window scrolled down more than startOffset OR obj position is
        // greater than the top position possible
        if(pastStartOffset || objFartherThanTopPos)
        {
            var newpos = ($(document).scrollTop() - startOffset);

            if ( newpos > bottomPos )
                newpos = bottomPos;
                
            // if window scrolled < starting offset, then reset Obj position 
            // (opts.offsetY);
            if ( $(document).scrollTop() < startOffset ) 
                newpos = 0;

            $("#sticky").animate({top: newpos}, {duration: 500, queue: false});
        }
    });
}

/* Handle highlighting of related input fields. */
function highlightConfig()
{
    $(".wrapper input, .wrapper select, .wrapper textarea").focus(function()
    {
        $(this).parents(".wrapper-parent").addClass("highlight");
    }).blur(function()
    {
        $(this).parents(".wrapper-parent").removeClass("highlight");
    });
}

/* 
 * Handles configuration of video/image galleries using
 * the yoxview jQuery files.
 */
function learn_yoxViewConfig()
{
    // The video gallery on the Learn page
    $("#vid-gallery").yoxview({ skin: "top_menu" });
}

/*
 * Handles configuration of the participate page's
 * drop down menus.
 */
function participate_dropdown()
{
	var $dropMenus = $('.drop-menu > li');

    $dropMenus.bind('mouseover', jsddm_open);
    $dropMenus.bind('mouseout',  jsddm_timer);
    
    $dropMenus.find('a[href^=#]').bind('click', function(e) {
    	e.preventDefault();
    });
    
    $(document).bind('click', function(e) {
    	if (ddmenuitem && !e.isDefaultPrevented() ) {
    		jsddm_close();
    	}
    });
    
}

/* 
 * Handles configuration of primer navigation. 
 * Specifically, styling to show only the 
 * expected section.
 */
function primer_navigationConfig()
{
    var page = document.location.href;
    
    	window.all_shown = false;

    // For external links and reloads
    if(page.search("primer") > 0)
    {
        //If there's no hash value, set at the first one
        if (window.location.hash) 
        {
            var arr = page.split("#");
            var div_id = "#" + arr[1];
        } 
        else 
        {
            var div_id = "#primer_main";
        }
        
        $('#primer_content').find('div.p_container').hide();
        
		// Handle visibility for guidance sections
        if(div_id == "#guidance1")
            div_id = "#serviceprovider_startingpoint";
        else if(div_id == "#guidance2")
            div_id ="#oslc_resources";
        else if(div_id == "#guidance3")
            div_id ="#resource_shapes";   
        else if(div_id == "#guidance4")
            div_id ="#query_mechanisms";
        else if(div_id == "#guidance5")
            div_id ="#serviceprovidercatalog";
		
		$(div_id).show();

		//Add current class to nav
		$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');
    }
    // Primer Nav
    $('.primer_nav').find('a').click(function(e) {
    
    	if (!window.all_shown) {
    		var div_id;
			div_id = $(this).attr('href');
			$('#primer_content').find('div.p_container').hide();
			
			// Handle visibility for guidance sections
			if(div_id == "#guidance1")
				div_id = "#serviceprovider_startingpoint";
			else if(div_id == "#guidance2")
				div_id ="#oslc_resources";
			else if(div_id == "#guidance3")
				div_id ="#resource_shapes";   
			else if(div_id == "#guidance4")
				div_id ="#query_mechanisms";
			else if(div_id == "#guidance5")
				div_id ="#serviceprovidercatalog";
				
			$(div_id).show();
			
			//Add current classes
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');
    	} 
        
    });
    // Primer Next/Previous Buttons
   $('.p_next_prev_nav').find('a').click(function(e) {

		if (!window.all_shown) {
			
			var div_id;
			div_id = $(this).attr('href');
			
			$('#primer_content').find('div.p_container').hide();
			$(div_id).show();
			
			//Change current navigation
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');		
		
		}
        
    });
    
    // Handle Browser's Back/Forward button presses
    $(window).hashchange( function(){

		if (!window.all_shown) { 
			var div_id;
			div_id = location.hash;
			
			if (!location.hash) {
				div_id = '#primer_main';
			}
			
			$('#primer_content').find('div.p_container').hide();
			
			// Handle visibility for guidance sections
			if(div_id == "#guidance1")
				div_id = "#serviceprovider_startingpoint";
			else if(div_id == "#guidance2")
				div_id ="#oslc_resources";
			else if(div_id == "#guidance3")
				div_id ="#resource_shapes";   
			else if(div_id == "#guidance4")
				div_id ="#query_mechanisms";
			else if(div_id == "#guidance5")
				div_id ="#serviceprovidercatalog";
			
			
			$(div_id).show();
	
			//Change current navigation
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');
		}
		
    });
    
    $(window).hashchange();
    
   //Need a 'Show all' button for people coming from search engines
   $('#tut-show-all').click( function(e){
    	
    	//Show all sections
    	$('#primer_content').find('div.p_container').show();
    	//Remove any "current" highlight
    	$('#main_nav li').removeClass('current');
    	//Remove prev/next navigation buttons
    	$('.prev, .next').hide();
    	//Hide the button
    	$(this).hide();
    	
    	//Set "all_shown" to true
    	window.all_shown = true;
    	
    	e.preventDefault();
    	
    });
}

/* Handle submission of the support form. */
function submitSupportForm()
{
    // Support Form
    $("#supportSubmit").click(function() 
    {
        // Validate before submitting the form
        var valid = $("#supportForm").validationEngine('validate');
    
        // if the form is valid, go ahead and submit it
        if(valid)
        {
            $.ajax(
            {
                url: "includes/support.php", 
                type: "post",
                data: 
                {
                    fname: $("#fname").val(), 
                    mi: $("#mi").val(), 
                    lname: $("#lname").val(), 
                    company: $("#company").val(), 
                    email: $("#email").val(), 
                    role: $("#role").val() 
                }, 
                complete: function(data) 
                {
                   $('#supportDialog').html(
                        '<p>Thank you for your interest. Care to share with others?<\/p>' +
                        '<div><a href="http://twitter.com/oslcNews" class="twitter-follow-button">Follow @oslcNews<\/a>' +
                        '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"><\/script>' +
                        '<\/div>' +
                        '<div><iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fopen-services.net&amp;send=true&amp;layout=standard&amp;width=300&amp;show_faces=true&amp;action=like&amp;colorscheme=light&amp;font&amp;height=80" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:300px; height:80px;" allowTransparency="true">' +
                        '<\/iframe>' +
                        '<\/div>'
                    );
                } 
            });
        }
    });
}

/* Handle dialog popup configuration for the Support dialog. */
function support_dialogConfig()
{
    // The Support Dialog, appears when the Support button in the footer
    // is clicked.
    $("#supportDialog" ).dialog({ autoOpen: false, width: 520 });
    $("#supportButton").click(function () 
    {
        $("#supportDialog").dialog('open');
    }); 
}

/* 
 * Handle configuration for validation using the
 * validationEngine jQuery files. 
 */
function support_validationConfig()
{
    // validation for the support form in support dialog
    $("#supportForm").validationEngine({
        isOverflown: true,
        overflownDIV: "#support-oslc"
    });
    $("#supportForm").validationEngine('attach');
}

/* 
 * Handles configuration of tutorial navigation. 
 * Specifically, styling to show only the 
 * expected section.
 */
function tutorial_navigationConfig()
{
    var page = document.location.href;
    
    window.all_shown = false;

    // For external links and reloads
    if(page.search("tutorial") > 0)
    {
		//If there's no hash value, set at the first one
		if (window.location.hash) {
			var arr = page.split("#");
			var div_id = "#" + arr[1];
		} else {
			var div_id = "#tutorial_main";
		}
    
        $('#tutorial_content').find('div.t_container').hide();
        $(div_id).show();
		
		//Change current navigation
		$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');
    }
	
    // Tutorial Nav
    $('.tutorial_nav').find('a').click(function(e) {
    
    	if (!window.all_shown) { 
			var div_id;
			div_id = $(this).attr('href');
			
			$('#tutorial_content').find('div.t_container').hide();
			$(div_id).show();
			
			//Change current navigation
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');    	
    	}
    });
	
    // Tutorial Interal Links (plan_partial_implementation.php)
    $('.tut_internal_links').find('a').click(function(e) {
    
		if (!window.all_shown) { 
		
			var div_id;
			div_id = $(this).attr('href');
			
			$('#tutorial_content').find('div.t_container').hide();
			$(div_id).show();
			
			//Change current navigation
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');
		
		}
        

    });
	
    // Tutorial Next/Previous Buttons
    $('.t_next_prev_nav').find('a').click(function(e) {

		if (!window.all_shown) { 
			
			var div_id;
			div_id = $(this).attr('href');
			
			$('#tutorial_content').find('div.t_container').hide();
			$(div_id).show();
			
			//Change current navigation
			$('#main_nav li').removeClass('current');
			$('#main_nav a[href$="' + div_id + '"]').parent().addClass('current');

		}
	});
	
	//Show all button for search engines
	$('#tut-show-all').click( function(e){
	
		//Show all sections
		$('#tutorial_content').find('div.t_container').show();
		//Remove any "current" highlight
		$('#main_nav li').removeClass('current');
		//Remove prev/next navigation buttons
		$('.prev, .next').hide();
		//Hide the button
		$(this).hide();
		
		//Set "all_shown" to true
		window.all_shown = true;
		
		e.preventDefault();
	
	});
	
	
}

/* Handles configuration of toggleable elements. */
function tutorial_toggleConfig()
{
    // Parts 1 and 2 of the Tutorial
    $("#pt1_tut_toggle_button").click(function () {
        if($("#pt1_tut_toggle_button").hasClass("ui-icon-triangle-1-s"))
        {
            $("#pt1_tut_toggle_button").removeClass("ui-icon-triangle-1-s");
            $("#pt1_tut_toggle_button").addClass("ui-icon-triangle-1-e");
        }
        else
        {
            $("#pt1_tut_toggle_button").addClass("ui-icon-triangle-1-s");
            $("#pt1_tut_toggle_button").removeClass("ui-icon-triangle-1-e");
        }
        $("#pt1_tut_toggle_div").toggle();
    }); 
    $("#pt2_tut_toggle_button").click(function () {
        if($("#pt2_tut_toggle_button").hasClass("ui-icon-triangle-1-s"))
        {
            $("#pt2_tut_toggle_button").removeClass("ui-icon-triangle-1-s");
            $("#pt2_tut_toggle_button").addClass("ui-icon-triangle-1-e");
        }
        else
        {
            $("#pt2_tut_toggle_button").addClass("ui-icon-triangle-1-s");
            $("#pt2_tut_toggle_button").removeClass("ui-icon-triangle-1-e");
        }
        $("#pt2_tut_toggle_div").toggle();
    }); 
}

Array.max = function( array ){ return Math.max.apply( Math, array );
};

/*****************************************************
 * Twitter feed functions
 *****************************************************/
function twitterCallback2(twitters) 
{
    var statusHTML = [];

    for(var i = 0; i < twitters.length; i++)
    {
        var username = twitters[i].user.screen_name;
        var status = twitters[i].text.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, 
            function(url) 
            {
                return '<a href="' + url + '">' + url + '</a>';
            }).replace(/\B@([_a-z0-9]+)/ig, 
            function(reply) 
            {
                return reply.charAt(0) + 
                    '<a href="http://twitter.com/' + reply.substring(1) + '">' +
                    reply.substring(1) + '</a>';
            });
            
        statusHTML.push('<li>"' + status + '" - <small>' + 
            relative_time(twitters[i].created_at) + '</small></li><br />');
    }
    
    $('.loading_icon').fadeOut(750, function() {
        $('#latest_tweets').append($(statusHTML.join('')).hide().fadeIn(750));
    });
}

function relative_time(time_value) 
{
    var values = time_value.split(" ");
    time_value = values[1] + " " + values[2] + ", " + values[5] + " " + 
        values[3];
    
    var parsed_date = Date.parse(time_value);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
    
    var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
    delta = delta + (relative_to.getTimezoneOffset() * 60);

    if (delta < 60) 
    {
        return 'less than a minute ago';
    } 
    else if(delta < 120) 
    {
        return 'about a minute ago';
    } 
    else if(delta < (60*60)) 
    {
        return (parseInt(delta / 60)).toString() + ' minutes ago';
    } 
    else if(delta < (120*60)) 
    {
        return 'about an hour ago';
    } 
    else if(delta < (24*60*60)) 
    {
        return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
    } 
    else if(delta < (48*60*60))
    {
        return '1 day ago';
    } 
    else 
    {
        return (parseInt(delta / 86400)).toString() + ' days ago';
    }
}

Array.min = function( array ){
return Math.min.apply( Math, array );
};

/*
 * This is for triggering the correct javascript functions when needed.
 */
var UTIL =
{
	// execute a function
	fire: function(func, funcname, args)
	{
		var namespace = OSLC; //object literal namespace
		
		// if the function to call isn't specified, just call init
		funcname = (funcname === undefined) ? 'init' : funcname;
		
		// check if the function exists in the namespace, and make sure the thing we are 
		// going to try to call is actually a function
		if(func !== namespace[func] && typeof namespace[func][funcname] == 'function')
		{
			namespace[func][funcname](args);
		}
	},
	// get the functions to execute
	loadEvents: function()
	{
		// this is the id of the div responsible for specifying the js functions we'll need
		var js_id = $("#js-triggers"); 

		UTIL.fire('js_common'); // do common js

		// do specified classes
		$.each(js_id.attr('class').split(/\s+/), function(i, class_name)
		{			
			// Only continue firing events if the classname isn't blank
			if(class_name != "")
			{
				var arr = class_name.split("[");
				var func_group = arr[0]; // the function group who's functions to execute
				
				UTIL.fire(func_group); // fire init function
				
				if(arr.length == 2)  // syntax indicates other functions should be called
				{		
					arr[1] = arr[1].substring(0, arr[1].length - 1); // chop off ending ']'
					var func_names = arr[1].split(",");
	
					// fire specific functions
					for(var j = 0; j < func_names.length; j++)
					{
						UTIL.fire(func_group, func_names[j]);
					}	
				}
			}
		});
		
		UTIL.fire('js_common', 'finalize'); // do the js that should be last
	}
};


/*******************************************************************************
 * jQuery Simple Drop-Down Menu Plugin (jsddm)
 *  - http://javascript-array.com/scripts/jquery_simple_drop_down_menu
 ******************************************************************************/
var timeout     = 500;
var closetimer  = 0;
var ddmenuitem  = 0;

function jsddm_open()
{    
    jsddm_canceltimer();
    jsddm_close();
    ddmenuitem = $(this)
    	.find('.pill-last').addClass('active').end()
    	.find('ul').eq(0).css('visibility', 'visible');
}

function jsddm_close()
{   
    if(ddmenuitem) {
	    ddmenuitem.css('visibility', 'hidden');
	    $('.pill-last.active').removeClass('active');
	    
	    ddmenuitem = null;
    }
    
}

function jsddm_timer()
{    
    closetimer = window.setTimeout(jsddm_close, timeout);
}

function jsddm_canceltimer()
{   
    if(closetimer)
    {    
        window.clearTimeout(closetimer);
        closetimer = null;
    }
}
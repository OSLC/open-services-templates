/* Catch console.log errors */
if (typeof console == "undefined") {
    window.console = {
        log: function () {}
    };
}


/*
	DOM-Ready JavaScript events 
 */
var OSLC =
{
    common:
    {
        init: function()
        {
        	// Modernizr placeholder test
			Modernizr.addTest('input-placeholder', function () { return Modernizr.input.placeholder });
			
			//Function to equalize heights of targeted children
			//Inspired by https://github.com/filamentgroup/jQuery-Equal-Heights/blob/master/jQuery.equalHeights.js
			//Added the ability to clarify what descendants to equalize with a class of "equalize"
			$('div').filter('.equalHeight').each(function(){
				var $childrenToEqualize = $(this).find('.equalize'),
					theTallest = 0;
				
				// If it can't find any 'equalize' descendants, just use the immediate children
				if ( !$childrenToEqualize[0] ) { $childrenToEqualize = $(this).children(); }
				
				$childrenToEqualize.each( function() {
					if ( $(this).height() > theTallest ) { theTallest = $(this).height(); }
				});
				
				//if ($.browser.msie && $.browser.version == 6.0) { $childrenToEqualize.css({'height': theTallest}); }
				$childrenToEqualize.css({'min-height': theTallest}); 
			});

			// Somewhat generic form section toggler function
			$('[data-toggle="reveal"]').each(function(){
				var $this = $(this)
					, $hide_on_init = $( $this.data('hide-on-init') ).hide().attr('data-hidden','true')
					, $hide = $( $this.data('hide-selector') )
					, $show = $( $this.data('show-selector') )
					, toggle_class = $this.data('toggle-class')
					, check_anything = $this.data('check-selector')
					, prevent_default = $this.data('prevent-default') === 'y'
					, hide_and_clear = function() {
						$hide
							.find('[data-hidden="true"]') // find anything buried in there that's hidden
							.show() // show them
							.end() // back to $hide
							.hide()
							.attr('data-hidden','true')
							.find('input, textarea')
							.not(':checkbox,:radio,[type="hidden"],[name^="snap"],[readonly]') // only text areas
							.val('') // set to empty
							.end() // reset selector to all input/textareas
							.filter(':checkbox,:radio') // only checkboxes and radios
							.prop('checked',false) // Set to not checked
							.end() // back to all inputs
							.removeClass('valid error') // This and the following undo jQuery validation
							.closest('.control-group') 
							.removeClass('control-error control-valid')
							.find('label[generated]').remove();
					}
					, show_stuff = function() {
						$show
							.show()
							.attr('data-hidden','false');
					}
				
				// Click handler
				$this.on('click', function(e){
					if ( toggle_class ) 
					{
						$show.toggleClass(toggle_class);
						
					} else 
					{
						hide_and_clear();
						show_stuff();	
					}
					
					if ( check_anything )
					{
						$( check_anything ).prop('checked',true);
					}
					
					if ( prevent_default ) 
					{
						e.preventDefault();
					}
					
					
				})
				
				// And for checked inputs on load
				if ( $this.prop('checked') )
				{
					hide_and_clear();
					show_stuff();
				}
			});
			


        },
        finalize: function()
        {

        }
    },
    js_details_polyfill:
    {
    	init: function() 
    	{
    		// Load my <details>-<summary> polyfill. Inits on all <details> elements on load.
    		// Mimics Google Chrome's native implementation.
			Modernizr.load([{
				test: Modernizr.details,
				nope: '/js/plugins/ljr-details.js', 
				complete: function()
				{
		    		//
		    		// ADDITIONAL BIT OF LOGIC REQUIRED WHETHER DETAILS IS SUPPORTED OR NOT: 
		    		// If an internal href="#anchor" link points to a <details> element, open it up when you click to it
		    		// Mainly for FAQ pages
		    		// See work item #239182
		    		//
		    		
		    		// delegate this to the body to limit the (possibly quite high) number of event handlers
					$('body').on('click','a',function(e){
					  // Cache the clicked link
					  var theLink = this;
					    
					  // only internal links
					  if (window.location.pathname === theLink.pathname && theLink.hash)
					  {
					    // find the appropriate element and if it's a <details> then open it (if necessary)
					    $(theLink.hash).filter('details').each(function(){
					      
					      var $details = $(this);
					      var isClosed = !(typeof $details.attr('open') === 'string');
					      
					      // let either the browser or your polyfill handle this
					      // meaning just click the <summary> (just the first; just in case) and let the chips fall where they may
					      if (isClosed) 
					      {
					        $details.find('summary').first().trigger('click');
					      }
					    });
					  }
					});
					
					// On load, check for a hash
					if (window.location.hash) {
						$( window.location.hash.toString() ).filter('details').each(function(){
							var $details = $(this);
							var isClosed = !(typeof $details.attr('open') === 'string');
							
							if (isClosed)
							{
							  $details.find('summary').first().trigger('click');	
							}
						});
					}
				}
			}]);
    		
    	}
    },
    js_dropdowns:
    {
        init: function()
        {
        	// Load my custom drop-down plugin. It will init on all elements with data-toggle="dropdown" on load (defined in the plugin)
        	Modernizr.load([{
        		load: '/js/plugins/ljr-dropdown.js'
        	}]);
        }
    },
    forms_typeahead: {
    	init: function()
    	{
			// Test for datalist (input[list]) support
			// Hack for Safari, which false-positives on this. Only safari has stupid big browser numbers that we can test for
			//    isSafari = parseInt($.browser.version) > 400;
			//
			// UPDATE 01 Aug 2012: Of course this hack stopped working. Chrome somewhere b/w 18-20 started self-IDing as "Safari v536". Chrome adds the chrome object to the window, so we can test for that.
			//    isSafari = parseInt($.browser.version) > 400 && !window.chrome
			// Update 03 March 2014: jQuery 1.10 deprecated $.browser, so we're trying something else.
			//    isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			if (!Modernizr.input.list || ( Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 ) ) {
				// Load my customized typeahead plugin. It will init on all elements with input[list] or attr data-provide="typeahead" on load (this is defined in the plugin)
				Modernizr.load([{
					load: '/js/plugins/ljr-typeahead.js'
				}]);
			}
			
    	}
    },
    toc_generator: {
    	init: function() 
    	{
			Modernizr.load([{
				load: '/js/plugins/ljr-toc.js'
			}]);
    	}
    },
	video_lightbox:
	{
		init: function()
		{
			//Async loading of YoxView assets for the lightbox
			Modernizr.load([
				{
					load: ['/js/yoxview/yoxview.css','/js/yoxview/jquery.yoxview-2.21.min.js'],
					complete: function(){
						
						$("#vid-gallery").yoxview({ skin: "top_menu" });	
						
					}
				}
			]);
			
			
		}
	},
	feature:
	{
		init: function()
		{
			
		}
	},
	js_tabs: {
		init: function(){
			Modernizr.load([{ 
				load: '/js/plugins/ljr-tabs.js',
				complete: function() {
					
					// On load, check for a hash
					if (window.location.hash) {
						$('a[role="tab"][href="' + window.location.hash +'"]')
							.first()
							.trigger('click');
					}
				}
			}])
		}
	},
	js_popovers: {
		init: function(){
			Modernizr.load([{ 
				load: '/js/plugins/ljr-popover.js'
			}])		
		}
	},
	js_about: 
	{
		init: function(){
		
			Modernizr.load([{	
				test: Modernizr.svg,
				yep: ['/js/raphael-min.js', '/js/plugins/oslc-jquery-raphael-sequence.js'],
				callback: {
					'/js/plugins/oslc-jquery-raphael-sequence.js': function(){						
					  // You add a class so that the blocks aren't completely hidden until AFTER Raphael loads and the papers get the right width
					  // Un-do that now
					  $('.delayHide').removeClass('delayHide');
					
					  $('a[role="tab"]').on('show', function(e){
						
						  var $newTab = $(e.target),
							  newSelector =  ( '#' + $newTab.attr('aria-controls') ) || $newTab.data('target') || $newTab.attr('href'),
							  $newSVG = $(newSelector).find('.raph-wrap'),
							  newAnim = $newSVG.data('oslc_animation'),
							  newWatchingForRestart = newAnim && newAnim.watchingForRestart;
							
						  if (e.relatedTarget) {
							  var $oldTab = $(e.relatedTarget),
								  oldSelector = ( '#' + $oldTab.attr('aria-controls') ) || $oldTab.data('target') || $oldTab.attr('href'),
								  $oldSVG = $(oldSelector).find('.raph-wrap'),
								  oldAnim = $oldSVG.data('oslc_animation'),
								  oldWatchingForRestart = oldAnim && oldAnim.watchingForRestart;
						  }
							
						  if (newAnim) {
						
							  if (e.relatedTarget && !oldWatchingForRestart) {
								  oldAnim.stopAnimation();
								  oldAnim.prepareRestart();
							  }
							
							  if (!newWatchingForRestart) {
								  newAnim.prepareRestart();
							  }
						
						  }
													
					  });
					
					  // On load, trigger the first one to kick off the animation
					  $( 'li.active' ).find('a[role="tab"]').first().trigger('show');
				  }
				}
			}]);
			
		}
	},
	sortableTables:
	{
		init: function() {
			
			/* Tablesorter plugin options here: http://tablesorter.com/docs/#Configuration */
			Modernizr.load([
				{
					load: '/js/jquery.tablesorter.min.js',
					complete: function(){
						
						// Use this selector combination (tables, then filter by class) as it's the most flexible while remaining fast in older browsers
						$('table').filter('.sortable-headers').each(function(){
							$(this).addClass('s-sortable');
								
							/* 	I pass the configuration variables in the markup as JSON.
								Unfortunately, the markup is very particular! Remember to "quote" property names
								jQuery's JSON parser will do the rest: http://api.jquery.com/jQuery.parseJSON/								
							 */
							var tablesorterOptions = $(this).attr('data-tablesorterOptions');
							
							if ( typeof tablesorterOptions !== "undefined" ) {
								$(this).tablesorter( $.parseJSON(tablesorterOptions) );
							} else {
								$(this).tablesorter();
							}
							
						});
						
					}
				}
			]);
			
		}
	},
	tooltips: 
	{
		init: function()
		{
			// Only do this if there are not touch events.			
			if (!Modernizr.touch) {
			
				$('.tooltip')
					.wrap('<span class="tooltip-wrap"></span>') //For old IE, definitely have a closing tag. Not sure if that's a bug; it works otherwise in all other browsers
					.append('<b class="tooltip-arrow-wrap"><b class="tooltip-arrow"><\/b><\/b>')
					.before('<span class="tooltip-link button alt">?<\/span>');
			}
			
		}
	},
	resources:
	{
		init: function() 
		{
			$('a').filter('.trackDownload').click(function(e) {
				
				// http://wptheming.com/2012/01/tracking-outbound-links-with-google-analytics/
				if (window._gaq) { // If Analytics is around
					
					_gaq.push(['_trackEvent', 'Outbound from Resources', e.currentTarget.host, $(this).attr('href'), 0]);
					
					// check if it was a new tab/window click
					if (e.metaKey || e.ctrlKey) {
						var newTab = true;
					}
					
					// If not, add a little delay so GA has time to process
					if (!newTab)
					{
						e.preventDefault();
						setTimeout('document.location = "' + $(this).attr('href') + '"', 250)
					}
				}
				
			});
		}
	},
	home_tracking:
	{
		init: function()
		{
		
			$('#lyopromo a').on("click", function(e) {
				
				if (window._gaq)
				{
					var lyo_url = $(this).attr('href');
				
					if (e.currentTarget.host != window.location.host)
					{
						_gaq.push(['_trackEvent', 'Home Pg to Lyo', e.currentTarget.host, lyo_url, 0]);

						if (e.metaKey || e.ctrlKey) {
							var newTab = true;
						}
						
						if (!newTab)
						{
							e.preventDefault();
							setTimeout('document.location = "' + lyo_url + '"', 100)
						}
					} 
	
				}				
			});
			
		}	
	},
	js_404:
	{
		init: function()
		{
			// Notify GA that this is a 404 hit (even though the URL most likely won't have "404")
			// http://gaconfig.com/404-tracking/
			
			if (window._gaq) { // If Analytics is around
				// Push a virtual pageview to the suite
				// http://www.google.com/support/googleanalytics/bin/answer.py?answer=55529
				_gaq.push(['_trackPageview', '/404/?page=' + document.location.pathname + document.location.search + '&from=' + document.referrer]);
			}
		}
	},
	js_workgroups_tag_filtering: {
		init: function()
		{
			var $wgs = $('.wg'),
				$tags = $wgs.find('.wg-tag'),
				$filter_tags = $('#wgs-filter-box').find('.wg-tag'),
				major = ['administrative', 'user-group', 'common', 'specification'],
				expanded_tag = '',
				do_filter = function(tagname) {
				
					// Status quo? Bail.
					if (tagname === expanded_tag) return;
					
					$tags.addClass('is-collapsed')
					$filter_tags.removeClass('is-selected');
					$wgs.removeClass('is-filtered');
					
					if (tagname) {
						
						$tags.filter('[data-tagname="'+ tagname +'"]')
							.removeClass('is-collapsed');
							
						$filter_tags.filter('[data-tagname="'+ tagname +'"]')
							.addClass('is-selected');
						
						$wgs.not('[data-tags~="'+ tagname +'"]')
							.addClass('is-filtered');
						
					}
										
					expanded_tag = tagname;

					// Update hash without changing history
					window.location.replace( '#wgs-' + ( tagname ? tagname : 'all' ) );

				};
				
			$tags.addClass('is-collapsed');
			
			// Shift tag order to put "major" ones first
			$.each(major, function(i, val) {
				$tags.filter('[data-tagname="'+val+'"]').each(function(){
					$(this).closest('ul').prepend( $(this).parent() );
				})
			});
			
			// Event handler
			$(document).on('click', '[data-tagname]', function(e){
				
				var tagname = $(e.target).attr('data-tagname');
				
				e.preventDefault();
				
				do_filter( tagname !== expanded_tag ? tagname : '' );
				
			});
			
			// Esc (27) to clear out filters
			$(document).on('keyup', function(e){
				e.keyCode == 27 && do_filter('');
			});
			
			// Filter on load
			if ( window.location.hash ) {
				$('[data-tagname="'+ window.location.hash.toString().split('#wgs-').pop() +'"]').first().click();
			}
			
		}
	},
	js_wiki:
	{
		init: function()
		{
			// Need to shim in "verbatim" element for IE on the Wiki
			// For reference, "verbatim" was a TWiki markup element. In practice, similar to pre/code blocks
			document.createElement('verbatim');
		}	
	},
	js_shrink_wiki_tables:
	{
		// Custom scripting to try to make spec tables fit in the layout.
		init: function()
		{
			$('.check-table-size').each(function() 
			{
				var $parent = $(this);
				var parent_width = $parent.width();
				var $sidebar = $('#wiki_sidebar');
				var sidebar_total_offset = $sidebar.offset().top + $sidebar.height() + 28; // offset + height + lil extra padding
				var sidebar_width = $sidebar.width();
				var total_width = parent_width + sidebar_width;
				var table_nudged = false;
				
				$parent.find('table').each(function(){
				
					var $table = $(this); // cache the element
					var original_table_width = $table.width();
					
					
					if ( original_table_width > parent_width )
					{
						// first pass, try to reduce the size of code text only
						// this class drops the <code> font-size to 12px
						$table.addClass('table-code-shrink');
						
						// round 2
						if ($table.width() > parent_width)
						{
						
							//Try making 'representation'-> 'represen-tation' to force a line break
							$table.find('th').each(function(){								
								var $header = $(this);
								
								if ($header.text() === 'Representation')
								{
									// Hyphen will allow a line-break if needed
									$header.html( $header.html().replace('Representation','Represen-tation') );
								} 
							});
														
							// round 3
							if ($table.width() > parent_width)
							{
							
								// Can you nudge it into the sidebar?
								if ($table.offset().top > sidebar_total_offset)
								{
									$table.addClass('table-nudged');
									table_nudged = true;
								}
								
																
								// round 4
								if ( table_nudged ? $table.width() > total_width : $table.width() > parent_width )
								{
																		
									// Add this class, which shrinks all text to 12px
									$table.addClass('table-shrink');
																		
									// round 5. Absolute last resort
									if ( table_nudged ? $table.width() > total_width : $table.width() > parent_width )
									{
										// Find property names and break them at the colon
										$table.find('code:first-child').each(function(){										
											var $the_code 				= $(this);
											var is_only_one_line 		= $the_code.height() < 20; // check that it's only one line instead of a block
											var $the_cell 				= $the_code.closest('td');  // Have to use closest() because it could be inside a link
											var content_to_compare 		= $the_code[0].parentNode.tagName === "A" ? $the_code.parent()[0].outerHTML : $the_code[0].outerHTML;
											var code_is_only_content 	= $the_cell[0].innerHTML === content_to_compare;
											
											
											if ( is_only_one_line && code_is_only_content )
											{
	
												//last resort: plop a line break in there at the hyphen
												var broken_code = $the_code.text().replace(/^([a-z0-9_]+):/i,'$1\n:');
												
												// Set it
												$the_code.text(broken_code).css('white-space','pre');
												
											}
											
										});

									} // end round 5
									
								} // end round 4
								
							} // end round 3
							
						} // end round 2
						
					} // end round 1
					
				});
			})
		}	
	},
	forms_validate:
	{
		init: function()
		{
			
			Modernizr.load([
				{
					
					load: ['/js/jquery.validate.js','/js/jquery.validate.additional-methods.js'],
					complete: function(){
						
						$('.validate-me').validate({
							errorPlacement: function(error, element) {
								error.addClass('callout-box').insertAfter(element);
							}
						});
						
						// Add additional method for checking electronic signatures with / + name + / pattern
						$.validator.addMethod('signature', function(value, element, param) {
					        var target = $(param);
					        
					        return $.trim(value).replace(/\//g,'') === $.trim(target.val());
					    },
					    	'This value does not match the <b>Your name</b> field'
					    );
						
						$('.form-validate').not('.form-inline').validate({
							errorClass: "validate-error",
							errorPlacement: function(error, element) {
								element
									.closest('.controls').append(error.addClass('help-inline'))
									.closest('.control-group')
										.removeClass('control-valid').addClass('control-error');
							},
							success: function(label) {
								label
									.text('Ok!')
									.closest('.control-group')
										.removeClass('control-error').addClass('control-valid');
							},
							showErrors: function(errorMap, errorList) {
							
								if (errorList.length > 0) {
									for (var i = 0; i < errorList.length; i++) {
										$(errorList[i].element).closest('.control-group')
											.removeClass('control-valid').addClass('control-error');
									}
								} 
								
								this.defaultShowErrors(); //Default function to show error messages
							}
							// Additional rules for the Legal Agreement form. Amazingly doesn't throw errors if the fields aren't there at all
							, rules: {
								oslc_org: {
									required: '#agreement_representing:checked'
								}
								, representing_org_url: {
									required: '#agreement_representing:checked'
								}
								, independent_employer: {
									required: '#agreement_independent_employed:checked'
								}
								, independent_employer_url: {
									required: '#agreement_independent_employed:checked'
								}
								, 'signature': {
									signature: '#agree_to_charter_name'
								}
							}
							, messages: {
								'signature': {
									signature: 'This value does not match the <b>Your name</b> field'
								}
							}
						});
						
						// Annoyance: with multiple forms that share field name="" (like login forms), 
						// .validate() will try to simultaneously validate
						// all forms. Using .each fixes that.
						$('.form-inline').each(function(){
							$(this).validate({
								errorClass: "inline-error"
								, errorPlacement: function(error, element) {
									element.addClass('input-error');
									error.addClass('help-inline help-error').insertAfter(element);
								}
							});
							
						});
						
					}
				}
			]);
			
			if (Modernizr.input.placeholder) {
				$('html').addClass('input-placeholder');
				$('.form-inline').find('label').addClass('totallyinvisible');
			}

			
			// Pretty basic function: add a "Focused" class of some sort to a wrapper of label/input
			var theFocusClass = 's-focused',
				theElementToFocus = '.field',
				$theForms = $('.form-basic'),
				$theTextInputs = $theForms.find('.text');				
				 
				$theTextInputs.focus( function() {
					$(this).closest(theElementToFocus).addClass(theFocusClass);
				});
				
				$theTextInputs.blur( function() {
					$(this).closest(theElementToFocus).removeClass(theFocusClass);
				});
			
			
			// Second take on focus/blur controls (for .form forms)
				var theFocusClassV2 = 'is-focused',
					theElementToFocusV2 = '.controls',
					$theFormsV2 = $('.form'),
					$theInputsV2 = $theFormsV2.find('input, textarea').not(':password,:checkbox,:radio,[type="hidden"],[name^="snap"]'); //name^='snap' rules out Snaptcha sort-of-hidden fields
					
					$theInputsV2.on("focus blur", function() {
						$(this).closest(theElementToFocusV2).toggleClass(theFocusClassV2);
					});
				 
			// Another basic function: Disable a button on proper submit
			
				// On a few browsers, you'll run into issues with buttons being disabled on reload
				// What's happening is that they remember (via autocomplete) the state of the buttons
				// Removing that will fix it
				$theForms.attr('autocomplete','off');
				
				$theForms.submit(function(e) {
					
					var $theSubmittedForm = $(this),
						// Can I check validity of the form with either HTML5 or Jquery?
						canValidate = !!this.checkValidity || !!$theSubmittedForm.valid,
						// Will the browser validate with HTML5 API, and if so is it valid?
						isHTML5Valid = !!this.checkValidity && this.checkValidity(),
						//Has $.validate() been called on the form, and if so is it valid?
						isjQueryValid = !!$theSubmittedForm.valid && $theSubmittedForm.valid();
					
					/* Here's the thought process:
						!canValidate 		If I have no way to check validation, the form is going to submit without intervention
						|| isHTML5Valid 	If the browser thinks it's valid, it will submit the form
						|| isjQueryValid 	If jQuery.validate() thinks it's valid, it will submit the form
						
						So if any of these are true, disable the Submit button/input
					
					*/
					if ( !canValidate || isHTML5Valid || isjQueryValid ) {
					
					
						$theSubmittedForm.find('[type="submit"]')
							.attr('disabled','disabled')
							.val('Submitting...') // For <input>s
							.text('Submitting...'); // For <button>s					
					
					}
									
				});
				
			// Second take on submit/disabled controls for .form forms
			
				// On a few browsers, you'll run into issues with buttons being disabled on reload
				// What's happening is that they remember (via autocomplete) the state of the buttons
				// Removing that will fix it
				$theFormsV2.attr('autocomplete','off');
				
				$theFormsV2.submit(function(e) {
					
					var $theSubmittedForm = $(this),
						// Can I check validity of the form with either HTML5 or Jquery?
						canValidate = !!this.checkValidity || !!$theSubmittedForm.valid,
						// Will the browser validate with HTML5 API, and if so is it valid?
						isHTML5Valid = !!this.checkValidity && this.checkValidity(),
						//Has $.validate() been called on the form, and if so is it valid?
						isjQueryValid = !!$theSubmittedForm.valid && $theSubmittedForm.valid();
					
					/* Here's the thought process:
						!canValidate 		If I have no way to check validation, the form is going to submit without intervention
						|| isHTML5Valid 	If the browser thinks it's valid, it will submit the form
						|| isjQueryValid 	If jQuery.validate() thinks it's valid, it will submit the form
						
						So if any of these are true, disable the Submit button/input
					
					*/
					if ( !canValidate || isHTML5Valid || isjQueryValid ) {
					
					
						$theSubmittedForm.find('[type="submit"]')
							.attr('disabled','disabled')
							.val('Submitting...') // For <input>s
							.text('Submitting...'); // For <button>s					
					
					}
					
					/* This can occasionally lead to issues with back buttons. Some ideas here
						http://stackoverflow.com/questions/158319/cross-browser-onload-event-and-the-back-button/201406
						http://stackoverflow.com/questions/7988967/problems-with-page-cache-in-ios-5-safari-when-navigating-back-unload-event-not
					*/
									
				});
			
		},
		webcast_notification_page: function(){
			
		}
	},
	tutorial:
	{
		init: function()
		{			
			//Navigation toggle
			//Includes WAI-ARIA roles because a) I'm nice; and b) I can't add them via Structure (easily)
			if (Modernizr.history) {
			
				$('#tutorial_navigation')
					.attr('role','tree')
					.find('li')
					.attr('role','treeitem')
					.has('ul')
						.each(function(){
			
							var $theLi = $(this),
								$theUl = $(this).find('> ul'),
								$theToggler = $('<a class="togglearea" href="#" title="Open or close this level of the hierarchy" > <i data-icon="&#xe0a4;"></i></a>');
								
								$theLi.find('ul').attr('role','group');
								
								$theLi.attr('aria-expanded','false').addClass('s-closed');
								
								$theLi.prepend($theToggler);
								
								// If it's either here (or the parent of 'here' -- thanks Structure!), show the UL
								if ( $theLi.hasClass('parent-active') || $theLi.hasClass('active') ) {
									
									$theLi.removeClass('s-closed').addClass('s-open').attr('aria-expanded','true');
									
								}
								
								$theToggler.click( function(event) {
									
									event.preventDefault();
									
									//Cache the LI to expand or collapse
									var $theParent = $(this).parent();
									
									$theParent
										.toggleClass('s-closed')
										.toggleClass('s-open')
										//Here you're getting a boolean value for the aria-expanded attribute and setting it to the opposite)
										.attr('aria-expanded', !($theParent.attr('aria-expanded') === 'true') );
							
						});
				
				});
			}			
			
			// PushState Awesomeness
			// Fallback is a regular old page refresh. Sorry, old browsers!
			
			// Don't bother if the browser doesn't support the History API
				if ( Modernizr.history ) {
													
					// So, you need to know whether or not you've pushed events (due to Chrome/Webkit firing an event on page load)
					// I'm capturing pushCount here also just in case I ever need it. (incremented on history.pushState() (NOT YET)
					// See: http://stackoverflow.com/questions/8980255/how-do-i-retrieve-if-the-popstate-event-comes-from-back-or-forward-actions-with
					var everPushedSomething = false,
						pushCount = 0,
						pushStateId,
						scrollPositions = {};
						
					// Add relative positioning to the whole 
					$('.tutorial-body').addClass('posr');
				
					//Bind the event to all current and future non-internal anchors in these containers		
					$('#tutorial_navigation, #tutorial-nav-buttons').delegate('a[class!="togglearea"]', 'click', function(event) {
						
						var $theLink = $(this);
							theUrl = $theLink.attr('href');
							
							// tack on a trailing slash (Apache will redirect you anyway)
							if ( theUrl.charAt(theUrl.length-1) !== "/" )
							{
								theUrl = theUrl + '/';
							}
						
						// Stop the link event
						event.preventDefault();
						
						if ( !$theLink.parent().hasClass('active') ) {
						
							// Get the scroll position before leaving
							pushStateId = (new Date).getTime();
							// Store in a global variable. (We'll also push it to the state object)
							scrollPositions[pushStateId] = $(window).scrollTop();
							
							// Push that info to the history.state object of the current state ( replaceState() )
							history.replaceState( { id : pushStateId, scrollOffset : scrollPositions[pushStateId] }, null );
							
							// Swap the body content and other important stuff
							swapTutorialPage(theUrl);
							
							// Logging that I've added pushState events.
							if (!everPushedSomething) everPushedSomething = 'pushed it real good';
							pushCount++;
							
							// Add the new page to the history stack
							history.pushState( null , null, theUrl);
						
						}
						
						
					});
					
					// Need a special event for tracking when the user stops scrolling
					// Via http://james.padolsey.com/javascript/special-scroll-events-for-jquery/
					var supportsStateObject = typeof(history.state) !== "undefined",
						special = jQuery.event.special,
				        uid1 = 'D' + (+new Date()),
				        uid2 = 'D' + (+new Date() + 1);				 
					
					// (But only bother with this if the browser supports history.state)
					if (supportsStateObject) {
						
						special.scrollstop = {
							latency: 300,
							setup: function() {
							
							    var timer,
                      handler = function(evt) {
          
                        var _self = this,
                            _args = arguments;
            
                        if (timer) {
                            clearTimeout(timer);
                        }
            
                        timer = setTimeout( function(){
            
                            timer = null;
                            evt.type = 'scrollstop';
                            $.event.dispatch.apply(_self, _args);
            
                        }, special.scrollstop.latency);
            
                    };
            
                $(this).bind('scroll', handler).data(uid2, handler);
							
							},
							teardown: function() {
							    $(this).unbind( 'scroll', jQuery(this).data(uid2) );
							}
						};
						
						// When the user stops scrolling, log the scroll position in the state object
						$(window).on('scrollstop', function(e){
							pushStateId = (new Date).getTime();
							scrollPositions[pushStateId] = $(window).scrollTop();
							
							history.replaceState( { id : pushStateId, scrollOffset : scrollPositions[pushStateId] }, null );							
						});
						
					}
					
					//Add an event listener to the window for "popstate" events that fire when you hit back/forward
					
						// First, some browsers (Webkit for example) fire a popstate on load.
						// This tests for that. If window.history.state exists on load, you can assume the browser won't fire that initial popstate event.
						// THIS IS NO LONGER TRUE: Both Chrome 19+ and Firefox have history.state on load (=== null), but Chrome still fires the initial popstate event
						// See http://stackoverflow.com/questions/6421769/popstate-on-pages-load-in-chrome/10651028#10651028
						// And https://github.com/defunkt/jquery-pjax/issues/143
						// This assumes you're always doing history.pushState(null,...) <-- passing null as the stateObject
						// See https://developer.mozilla.org/en/DOM/Manipulating_the_browser_history
						// Because if you passed a stateObject, that will be saved on a refresh
						//var hasPopped = ('state' in window.history && window.history.state !== null)
						
						// We also need to test for the current URL (total href) and pathname
						var	initialUrl = location.href;
													
						// AND we need to test for the current #hash, as popstate fires on a hashchange
						// These need to be cached to the window so the swapTutorialPage function can access them
							window.currentPath = location.pathname;
							window.currentHash = location.hash;
						
						$(window).bind("popstate", function(e) {
						
							// Test if this is an onload popstate event that some browsers (Webkit mostly) fire
							var onloadPop = !everPushedSomething && location.href == initialUrl;
							// regardless, set your test to 'true' so you won't go through this again
							everPushedSomething = true;
							// If this is the onload popstate event, KILL IT WITH FIRE
							if (onloadPop) {return;}
							
							// Test if this is only a changing hash
							var onlyHashChange = location.pathname === window.currentPath && location.hash !== window.currentHash;
							
							// Update the "current" path and hash values for the next round
							window.currentPath = location.pathname;
							window.currentHash = location.hash;
								
							if (onlyHashChange) return;
							
							// Moving on...
							
							swapTutorialPage(location.pathname);
							
							
						});
					
				}
			
		}
	}
};

/* 
* Function to swap out the contents of one tutorial page for another via AJAX
* Takes one argument: a URL
*/
var swapTutorialPage = function(href) {
	
	$('.tutorial-body').append('<div id="popstate-loading" class="s-loading"></div>');

	$.ajax({
		url: href,
		success: function(data) {
			
			var $theNewPage = $(data),
				theNewTitle = $theNewPage.filter('title').text(),
				theNewBody = $theNewPage.find('#tutorial-body').html(),
				theNewPrevNextNav = $theNewPage.find('#tutorial-nav-buttons').html();
			
			// Replace the title of the page with the new title
			$('title').text(theNewTitle);
			
			// Replace the content of the body section with the new content
			$('#tutorial-body').html(theNewBody);
			
			// Replace the content of the previous/next buttons with the new buttons
			$('#tutorial-nav-buttons').html(theNewPrevNextNav);
			
			// Find that link in the sidebar and make it here
				// First, remove any other ".active" class
				$('#tutorial_navigation').find('.active').removeClass('active');
			
				// Next, cache the link (found w/ an attribute selector)
				var $theNewHereLink = $('#tutorial_navigation a[href$="' + href + '"]');
				
				if ($theNewHereLink.length === 0)
				{
					// Try it with removing a trailing slash
					$theNewHereLink = $('#tutorial_navigation a[href$="' + href.substring(0, href.length-1) + '"]');
				}
				
				// issue with structure 3.3.14: you could have multiple overviews and accordingly multiple "Here" links
				// but you're hiding ONE of them, so the while loop below HANGS because it'll never be not :hidden
				// therefore, only work with the first link
				// this will be unnecessary if the recursive_overview problem gets fixed in Structure
				if ($theNewHereLink.length > 1)
				{
					$theNewHereLink = $theNewHereLink.first();
				}
			
				// Cache the parent li
				var $theNewLi = $theNewHereLink.closest('li');
				// Toggle the parent li as active
				$theNewLi.addClass('active');
				
					// Is the parent li toggleable AND closed? Open it.
					if ( $theNewLi.hasClass('s-closed') ) {
						$theNewLi.removeClass('s-closed').addClass('s-open').attr('aria-expanded','true');
					}

					// Is it currently invisible due to toggling? Oh no!
					// Keep climbing up .s-closed items and toggle them open until it's visible
					while ( $theNewHereLink.is(":hidden") ) {
						$theNewHereLink.closest('.s-closed').removeClass('s-closed').addClass('s-open').attr('aria-expanded','true');
					}
					
			// Remove the 'loading' div
			$('#popstate-loading').remove();
			
			// Scrolling behavior at the end
				// Check for if there is a hash
				var hash = window.location.hash.toString();
				
				// First, check for the history object
				if ( typeof(history.state) === "object" && history.state != null && typeof(history.state.scrollOffset) === "number" ) { // null is an object!
					/* Here's the state of browser scrolling on a popstate event as I see it (as of June 2012):
						- Webkit browsers will return to the scroll position **if they can** (the content might not be there) at the same time as the popstate event
						- Chrome 18+ supports history.state; Safari 5 doesn't.
						- Firefox doesn't budge
						- Opera doesn't budge
					   So the following mostly helps FF and Opera, but CAN help Chrome/Safari if the browser couldn't scroll to the saved position b/c the content wasn't loaded yet
					*/
					$(window).scrollTop( history.state.scrollOffset );
				} else if (hash !== '') { // Next, if there's a hash, head to that
					$(window).scrollTop( $(hash).offset()['top'] );
				} else { // Failing all that, scroll to the top of the #tutorial-body element
					$(window).scrollTop( $('#tutorial-body').offset()['top'] );
				}
						
			// Update the "current" path and hash values for the popstate handler
			window.currentPath = window.location.pathname;
			window.currentHash = window.location.hash;
			
			// Push the new URL to Google Analytics
			if (window._gaq) { // If, ahem, Analytics is around
				_gaq.push(['_trackPageview', href]);
			}
				

		},
		error: function() {
			//If the AJAX fails, just send them to the link's target. Easiest fallback ever.
			window.location.href = href
		}
	});

}


Array.max = function( array ){ return Math.max.apply( Math, array );
};

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
		if (func !== '' && namespace[func] && typeof namespace[func][funcname] == 'function'){
			namespace[func][funcname]();
		}
	},
	// get the functions to execute
	loadEvents: function()
	{
		//Get the ID of the body
		var bodyId = document.body.id;

		// hit up common first.
	    UTIL.fire('common');
		    
		// do all the classes too.
		    $.each(document.body.className.split(/\s+/),function(i,classnm){
		      UTIL.fire(classnm);
		      UTIL.fire(classnm,bodyId);
		    });
		
		// AND finalize if you need something dead last
		UTIL.fire('common', 'finalize');
	}
};


// THE BIG KAHUNA: THIS FIRES ALL DOM-READY EVENTS
$(document).ready(function(){  
	UTIL.loadEvents();
});
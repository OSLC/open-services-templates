/*
	Add <details> and <summary> support to browsers that don't support it natively.
	H/T to Mathias Bynens for initial inspiration:
	http://mathiasbynens.be/notes/html5-details-jquery
	
	This plugin assumes that you have already done a feature support test for <details>.
	It does NOT test this natively.
	
	This plugin also relies on some simple CSS. It will work without it, but things will be wonky.
	See sections in your CSS: "toggleable" areas and "Summary/Details reset"
	
	This plugin works similar to those in Twitter Bootstrap: it has a sensible initialization function built-in that applies the polyfill to <details> elements automatically after it loads. 
	Upon loading this plugin, you DO NOT have to do this:
		$('details').details();
	(Because, uh, it's a <details> polyfill. This is the primary use case.)
*/

(function($){

	var Details = function(element, options) {
		
			this.$el = $(element);
			this.el = element;
			
			// Need to detect Opera for a keyup event later on
			// Sad clown
			this.isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
			
			this.options = $.extend({}, $.fn.details.defaults, options); //merge defaults and passed options
			
			//Initialize
			this.init();
			
		}

	
	Details.prototype = {

		constructor: Details
		
		, init: function( ) {
		
			var base = this //Avoid conflicts with this in $.each, event functions, and others
				, $theSummary = $('summary', this.el).first()
				, $theNodesWithoutSummary = this.$el.children(':not(summary)')
				, $theEverythingButSummary = this.$el.contents(':not(summary)'); //Includes all text nodes
			
			// If there is no <summary>, create one with some default text
			// This is not in the spec, but matches Chrome's implementation
			if (!$theSummary.length) {
				$theSummary = $('<summary>').text(this.options.summarytext).prependTo(this.$el);
			}
			
			// Need to check for text-only nodes and wrap them in a <span> so they can be targeted
			// This will let the basic CSS hide the little bastards (CSS can't target text nodes)
			// And we'll need them in nodes to hit them in the script with .show() or .hide()
			if ( $theNodesWithoutSummary.length != $theEverythingButSummary.length ) {
				// TO DO: there is a possibility that an iFrame here could bork things
				// Because .contents() will return every element in an iFrame
				// 		(But I think only if its on the same domain?)
				// There's a possibility that you'll have to adjust this to filter them out
				// a la .contents( ':not(summary)', ':not(iframe)' )
				// See: http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
				
				// Only keep nodes that a) are text (nodeType == 3) and b) have more than just whitespace
				/* [^ \t\n\f\r] explained:
				 	[ 		# begin character set
					 ^		# negates. Or any character that is not...
					  		# a space...
					 \t		# or a tab...
					 \n		# or a new line (linefeed)..
					 \f		# or a form-feed...
					 \r		# or a carriage return.
					] 		# end character set
				*/
				$theEverythingButSummary
					.filter(function() {
						return this.nodeType == 3 && /[^ \t\n\f\r]/.test(this.data);
					})
					.wrap('<span></span>'); //IE8 has a bug where it won't wrap unless you provide the full element incl closing
				
				// Now there are no text nodes that you have to worry about, so set $theNodesWithoutSummary
				$theNodesWithoutSummary = this.$el.children(':not(summary)');
			}
			
			$theSummary
				.attr('role', 'button') //WAI-ARIA role that this is user-actionable
				.prop('tabIndex', 0) // tabIndex of '0' means it's keyboard-accessible in markup order
				.prepend('<span class="' + this.options.summarysymbolclass + '"></span> ')
				.end() //.prepend() returns the new content. Go back to $theSummary 
				.on('click', function() {
					// Give it keyboard focus
					$theSummary.focus();
					
					// Trigger the toggle function (passing 'true' to toggle back and forth)
					// AND EVERYONE LAUGHED WHEN I ASSIGNED BASE=THIS
					base.toggleDetails(base.$el, $theSummary, $theNodesWithoutSummary, true);
				})
				.keyup(function(event) {
					if ( event.keyCode == 32 || (event.keyCode == 13 && !base.isOpera) ) {
						// h/t to Mathias: Opera already triggers a 'click' when you hit 'Enter'
						
						// On Enter (13) or Space (32), prevent that keyup event and trigger a click instead
						event.preventDefault();
						$theSummary.trigger('click');
					}
				});

			// Initial state: checks for open boolean attribute and reveals (if necessary)
			this.toggleDetails(this.$el, $theSummary, $theNodesWithoutSummary);
			
		} // end init()
		, toggleDetails: function($details, $summary, $childrenNotSummary, toggle) {
		
			var   isOpen = typeof $details.attr('open') === 'string' //Check if there's an open attribute
				, close = isOpen && toggle || !isOpen && !toggle;
					// Logic here: if it's open and I passed that I want to toggle it, I want it closed.
					// OR, for init: if it should be closed (no open property) and I didn't pass 'true' for 'toggle'
					
				if (close) {
					$details
						.prop("open", false) // use .prop() for boolean attributes!
						.removeAttr("open") 
						.triggerHandler('close.details'); //Trigger a namespaced event
					$summary
						.attr('aria-expanded', false)
						.find('.' + this.options.summarysymbolclass).html(this.options.summaryclosedsymbol); // > triangle
					$childrenNotSummary.hide();
				} else {
					$details
						.prop("open", true) // .prop() is what to use to check for these things
						.attr("open", true) // but if I'm styling with details[open], need to add the attribute also. Annoying.
						.triggerHandler('open.details');
					$summary
						.attr('aria-expanded', true)
						.find('.' + this.options.summarysymbolclass).html(this.options.summaryopensymbol); // down triangle
					$childrenNotSummary.show();
				}
				
		} // end toggleDetails
	};
	
	
	// The actual plugin
	$.fn.details = function(options) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('details');
				
			if (!data) $this.data('details', ( data = new Details(this, options) ) );
		});
	};
	
	
	$.fn.details.defaults = {
		// If there's not a <summary> element, we'll provide one
		// This isn't in the spec, but that's how Chrome handles it
		// This provides the default text.
		// If there is already a <summary> element, this will do nothing
		  summarytext: 'Details'
		  
		// HTML code (or text) to prepend to the <summary> element when closed
		// Defaults to a > triangle
		// This matches Chrome's default presentation
		, summaryclosedsymbol: '&#9654;'
		
		// HTML code (or text) to prepend to the <summary> element when open
		// Defaults to a downward triangle
		// This matches Chrome's default presentation
		, summaryopensymbol: '&#9660;'
		
		// Class to assign the <span> that will hold that symbol
		// Useful to override if you're using the default class elsewhere
		, summarysymbolclass: 'togglesymbol'
	}
	
	$.fn.details.Constructor = Details
	
	// Initialize and run on all <details> elements
	$(function () {
		$('details').each(function(){
			$detail = $(this);
			$detail.details( $detail.data() ); //Get all options from data-attributes
		});
	  })
	
})(jQuery);
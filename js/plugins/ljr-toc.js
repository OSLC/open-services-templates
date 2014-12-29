(function($){

	//Generate a TOC from a bunch of headers
	var Toc = function(element, options) {
		
			this.$el = $(element);
			this.el = element;
			
			this.options = $.extend({}, $.fn.toc.defaults, options); //merge defaults and passed options
			
			// Check if they provided a scope element. If not, default is <body>
			this.$scope = $(this.options.scope);
			
			//Initialize
			this.init();

		}

	
	Toc.prototype = {

		constructor: Toc
		
		, init: function( ) {
		
			var base = this
				, tags = ["h1","h2","h3","h4","h5","h6"] // All heading tags
				, $allHeadings
				, limited_tags
				, scope_id;
				
			// First, look for any headings within scope
			$allHeadings = this.$scope.find( tags.join(', ') );
			
			// No headings? Kill it!
			if ( !$allHeadings.length ) return;
			
			// Use options.startlevel and options.depth to figure out the new headings
			limited_tags = tags.splice(base.options.startlevel - 1, base.options.depth);
			
			// Create and cache the headings
			base.$headings = base.$scope.find( limited_tags.join(', ') );
			
			// Get or set the ID of your scoped element for making "back to top" links
			if ( base.options.toplinks !== false ) {
				// Get the ID of the scope element
				scope_id = base.$scope.attr('id');
				
				// If it's blank, get the one from your options
				if (scope_id == "" || typeof(scope_id) === "undefined") {
					scope_id = base.options.topscopeid;
					base.$scope.attr('id', scope_id);
				}
				
				// Cache that ID, which you'll use to build the Top links
				base.top_scope_id = scope_id;
			}
			
			// Figure out what kind of list to build
			// If the element is a list element, check that first. Otherwise, go to the options
			if ( this.$el.is('ul') || this.$el.is('ol') ) {
				base.isAlreadyList = true;
				base.liststyle = base.el.nodeName.toLowerCase();
			} else if (base.options.justlinks) { // if you just want links (no lists), go with this
				base.isAlreadyList = false;
				base.liststyle = null;
			} else {
				base.isAlreadyList = false;
				base.liststyle = base.options.listtype;	
			}
			
			
			// Prep the output
			base.output = "";
			base.current_level = this.options.startlevel;
			
			// Start looping through them
			base.$headings.each( function(i,element ) {
				
				var $heading = $(element)
					, heading_id
					, link
					, heading_level;
					
				// if the heading has an "id", use that
				heading_id = $heading.attr('id');
				
				// otherwise, build one
				if ( heading_id == "" || typeof(heading_id) === "undefined" ) {
					
					//build the slug
					// 1. get the heading text
					// 2. all lower case
					// 3. Delete everything that isn't alpha, numeric, or a hyphen
					// 4. Replace all remaining spaces with '-'
					var slug = $heading.text().toLowerCase().replace(/[^a-z0-9 -]/gi,'').replace(/\s/g,'-');
					
					// limit it to 40 characters
					slug = slug.substr(0, 40);
					
					heading_id = slug;
					
					//Set it on the heading
					$heading.attr('id', heading_id);
				}
				
				// You've got enough to build the link
				link = '<a href="#' + heading_id + '">' + $heading.text() + '</a>\n'
				
				// Parse the level of the heading from the tag name
				heading_level = element.nodeName.toLowerCase().substr(1,1);
								
				// For any others (or if the first heading is not at the highest level) gotta adjust the nesting of the lists
				if ( i > 0 || ( i == 0 && heading_level != base.current_level) ) {
				
					base.shiftLevel(heading_level);
				
				}
				
				// You've got the lists, drop in the link
				base.output += link + '\n';
				
				// If you're doing back-to-top links, assemble them here
				if (base.options.toplinks !== false) {
					
					var toplink = '<a href="#' + base.top_scope_id + '">' + base.options.toplinktext +  '</a>';
					
					// If they defined an element (and class)
					if (base.options.toplinkelement !== "") {
						toplink = '<' + base.options.toplinkelement + ' class="' + base.options.toplinkclass + '">' + toplink + '</' + base.options.toplinkelement + '>';
					}
					
					
					$heading.append(' ' + toplink);
					
				}		
				
			});
			
			// After all that, if your current level is deeper than the starting level, you'll have to close some things
			base.shiftLevel(base.options.startlevel, true);
			
			// For a list, wrap everything in a list item
			if (!base.options.justlinks) {
				base.output = '<li>\n' + base.output + '</li>\n';
				
				// If it's not already a list, wrap it in one
				if (!base.isAlreadyList) {
					
					var list_prepend,
						list_append;
					
					list_prepend = '<' + base.liststyle;
					
					//base.output = '<' + base.liststyle; // + ' class="' + base.options.listclass + '">\n' + base.output + '</' + base.liststyle + '>';
					if ( base.options.listclass !== "" ) {
						list_prepend += ' class="' + base.options.listclass + '"';
					}
					
					list_prepend += '>\n';
					
					list_append = '</' + base.liststyle + '>';
					
					base.output = list_prepend + base.output + list_append;
				}
			}
			
			// Drop it in your element
			base.$el.html(base.output);
						
		}
		
		, shiftLevel: function( heading_level, last_item ) {
			if ( last_item !== true ) last = false;
			
			var base = this;
			
			// If you don't care about nesting, just change current_level and return
			if (base.options.justlinks) {
				
				base.current_level = heading_level;
				return true;
				
			}
			
			if ( heading_level == base.current_level ) {

				// Depth hasn't changed. Just close the list item and open another
				if (!last_item) {
					base.output += '</li>\n<li>\n'
				}
			
			} else if ( heading_level > base.current_level ) {

				// Increase the nesting level
				// For every level that is greater than the current level, you'll need a new list
				var opening_tags = [];
				for (var i = base.current_level; i < heading_level; i++) {
					
					var opening_tag;
					
					opening_tag = '<' + base.liststyle;
					if ( base.options.innerlistclass !== "" ) {
						opening_tag += ' class="' + base.options.innerlistclass + '"'
					}
					opening_tag += '>\n';
					
					opening_tags.push( opening_tag );
				}
				
				// Open a new list for each level and tack on an opening list tag
				base.output += opening_tags.join( '<li>\n' ) + '<li>\n'
				
			} else {
			
				// Decrease the nesting level
				closing_tags = [];
				// For ever level that this heading is lower than the current level, close a list
				for (var i = base.current_level; i > heading_level; i--){
					closing_tags.push( '</' + base.liststyle + '>\n' );
				}
				
				// Close the current li tag, close all the lists (with a </li> in between)
				base.output += '</li>\n' + closing_tags.join( '</li>\n' );
				
				// If this isn't the last item, close the block and open the next one
				if (!last_item) {
					base.output += '</li>\n<li>\n'
				}
				
			}
			
			// Set the current level to the level of this heading
			base.current_level = heading_level;
			
		}		
		
	};
	
	
	// The actual plugin
	$.fn.toc = function(options) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('toc');
				
			if (!data) $this.data('toc', ( data = new Toc(this, options) ) );
		});
	};
	
	
	$.fn.toc.defaults = {
		  // What element should you scope your headings to?
		  scope: 'body'
		
		  // What level of heading to start at? h1 = 1, h2 = 2, and so forth
		, startlevel: 1
		  
		  // How many levels of headings to go from the start level of heading (including the start level)?
		, depth: 6
		
		  // If you just want a straight list of links, switch this to true
		, justlinks: false
		
		  // What type of list? options are "ul" or "ol"
		  // If the $el is a list itself, we'll use that
		, listtype: "ol"
		
		  // Any class to add to the list (if generated)?
		, listclass: ""
		
		  // Any classes to add to the inner list?
		, innerlistclass: ""
				
		  // Do you want to add "Back to top" links with each header?
		, toplinks: false
		
		  // What element to wrap the Back to top link with?
		, toplinkelement: ""
		
		  // Likewise, what class to stick on them?
		, toplinkclass: "backtotop"
		
		  // I think this explains itself
		, toplinktext: "Back to top"
		
		  // if necessary, add an ID to the scoped element to serve as the target for the Back To Top links
		, topscopeid: "toc-top"
		
	
	}
	
	
	$.fn.toc.Constructor = Toc
	
	
	// Initialize and run on all [data-provide="toc"] elements
	$(function () {
		$('[data-provide="toc"]').each(function(){
			$toc = $(this);
			$toc.toc( $toc.data() ); //Get all options from data- attributes
		});
	  })
	
})(jQuery);
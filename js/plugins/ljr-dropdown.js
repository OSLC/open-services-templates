(function($){

	//All-purpose dropdowns to be assigned to the appropriate link elements
	
	
	var toggle_elements = 'a[data-toggle="dropdown"]',
		Dropdown = function(element) {

			var $el = $(element);
			
			// On click, summon the toggle function (defined in the prototype below)
			$el.on('click', this.toggle)
			
			// Add an event listener to the HTML element to close things up for this item
			// ( Needed for elements without data-toggle="dropdown" )
			$('html').on('click', function() {
				$el.parent().removeClass('is-open');
			});

		}

	// Separate functionality from object creation
	Dropdown.prototype = {

		constructor: Dropdown,
		
		toggle: function(e) {
			var $this = $(this),
				$parent = $this.parent(), // To Do: Allow you to target other dropdowns (via data-target or href attributes)
				isOpen = $parent.hasClass('is-open');
			
			removeAllMenus();
			
			if (!isOpen) {
				$parent.addClass('is-open')
			}
			
			return false
		}
		
	};
	
	// Function to remove all menus
	function removeAllMenus() {
		$(toggle_elements).parent().removeClass('is-open');
	}

	// The actual plugin
	$.fn.dropdown = function(option) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('dropdown');
				
			// If it's not there already, create a new Dropdown instance
			// (Elements with a data-toggle attribute would have been picked up immediately (below)
			if (!data) $this.data('dropdown', ( data = new Dropdown(this) ) );
		});
	};
	
	$.fn.dropdown.Constructor = Dropdown
	
	// Initialize and run on all [data-toggle="dropdown"] elements
	$(function () {
		// If a click bubbles up to the HTML element, clear the menus
	    $('html').on('click', removeAllMenus)
	    
	    // If the click target was a toggle_element, activate the toggle function 
	    $('body').on('click', toggle_elements, Dropdown.prototype.toggle)
	  })
	
})(jQuery);
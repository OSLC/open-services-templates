(function(w,$, undefined){

	/* 
	See http://modernizr.com/docs/ and 
	http://stackoverflow.com/questions/5023514/how-do-i-normalize-css3-transition-functions-across-browsers				
	*/
	var transitionSupport = Modernizr ? Modernizr.csstransitions : false,
		transitionEventNames = {
		  'WebkitTransition' : 'webkitTransitionEnd',
		  'MozTransition'    : 'transitionend',
		  'OTransition'      : 'oTransitionEnd otransitionend', // Opera used both at one point
		  // Microsoft never supported prefixed transitions. IE10 is not prefixed.
		  'transition'       : 'transitionend'
		};

	
	var Popover = function(element, options){
		this.element = element;
		this.$element = $(element);
		this.options = options;
	}
	
	Popover.prototype = {
		
		constructor: Popover,
		
		supportsCssTransitions: transitionSupport && { 				
			end : transitionEventNames[ Modernizr.prefixed('transition') ]
		},
		
		toggle: function(){
			return this[!this.isShown ? 'show' : 'hide']()
		},
		
		show: function() {
			this.isShown = true;
			
			var $popover,
				self = this;
			
			$popover = this.popover();
			this.setContent();
			
			if (this.options.animation) {
				$popover.addClass( this.options.animation_class )
			}
			
			$popover
				.detach()
				.css({'display': 'block'});
			
			$popover.appendTo('body');
			
			this.placePopover();
			
			$(document).one('click.popover', function(e) {
				self.hide();
			});

		},
		
		getPosition: function(){
			var el = this.element;
			
			return $.extend(
				{}, 
				(typeof el.getBoundingClientRect === 'function') ? 
					el.getBoundingClientRect() 
					: { width: el.offsetWidth,
						height: el.offsetHeight
					},
				this.$element.offset() 
				)
		},
		
		placePopover: function(){
			var pos,
				$popover = this.popover(),
				popWidth,
				popHeight,
				top,
				left;
				
			pos = this.getPosition();
			
			popWidth = $popover[0].offsetWidth;
			popHeight = $popover[0].offsetHeight;
			
			offset = {
				top: pos.top - popHeight - 10,
				left: pos.left + pos.width/2 - popWidth/2
			}
			
			$popover
				.offset(offset)
				.addClass('in');
		},
		
		hide: function() {
		
			var self = this,
				$popover = this.popover();
			
			$popover.removeClass('in');
			
			this.supportsCssTransitions && $popover.hasClass(this.options.animation_class) ? 
				this.removeWithAnimation()
				: $popover.detach();
			
			this.isShown = false;
		
		},
		
		removeWithAnimation: function() {
			
			var $popover = this.popover(),
				self = this,
				timeout = setTimeout(function() {
					$popover.off(self.supportsCssTransitions.end).detach();
				}, 500);

			$popover.one(self.supportsCssTransitions.end, function(){
				clearTimeout(timeout);
				$popover.detach();
			});

		},
		
		popover: function() {
			return this.$popover = this.$popover || $(this.options.template);
		},
		
		setContent: function() {
			var $popover = this.popover();
				
			$popover.find('.popover-title').text( this.options.title || this.$element.text() );
			$popover.find('.popover-body')[this.options.html ? 'html' : 'text']( this.options.content || this.$element.attr('title') );
		}

	}
	
	
	/* jQuery function definition
	 ----------------------------------- */
	$.fn.popover = function(option){
		return this.each(function() {
			var $this = $(this),
				data = $this.data('popover'),
				options =  $.extend({}, $.fn.popover.defaults, $this.data(), typeof option === "object" && option);
			
			if (!data) { 
				$this.data('popover', ( data = new Popover(this, options) ) ) 
			}
			
			if (typeof option === "string") {
				data[option]();
			} else if (options.show) {
				data.show();
			}
		});
	}
	
	/* Defaults
	 ----------------------------------- */
	$.fn.popover.defaults = {
		animation: true,
		animation_class: 'fade', 
		template: "<div class=\"popover\"><div class=\"popover-title\"></div><div class=\"popover-body\"></div></div>",
		title: '',
		content: '',
		html: false,	
		show: true
	}
	

	/* Auto init on for [data-popover] 
	 ----------------------------------- */
	$(document).on('click.popover', '[data-popover]', function(e){
		
		e.preventDefault();
		
		var $this = $(this),
			option = $this.data('popover') ? 'toggle' : $.extend({}, $this.data() );
			
		$this.popover(option);
		
	});

})(window, window.jQuery)
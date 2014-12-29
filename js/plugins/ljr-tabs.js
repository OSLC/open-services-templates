/* ========================================================
 * ljr-tabs.js 
 * ========================================================
 * Copyright 2012 Lee Reamsnyder, IBM
 *
 * Heavily inspired by Twitter Bootstrap tabs
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 *
 * This version differs from Twitter Bootstrap in the following ways:
 *  + The Data API uses [role="tab"] (WAI-ARIA) instead of [data-toggle="tab"]
 *  + WAI-ARIA support everywhere
 *  + Google Analytics events triggered on tab click
 *  + Additional .drop animation support
 *  + Transition support/test is baked-in (requires Modernizr... I should change that)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


(function(w,$) {

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
	
	
	var Tabs = function (element, options) {
		this.element = $(element),
		this.options = $.extend({},this.defaults, typeof options == "object" && options);
	};
	
	
	Tabs.prototype = {
	
		constructor: Tabs,
		
		supportsCssTransitions: transitionSupport && { 				
			end : transitionEventNames[ Modernizr.prefixed('transition') ]
		},
		
		show: function() {
		
			var $this = this.element,
				$tablist = $this.closest('ul'),
				$parent = $this.parent('li'),
				selector = ( '#' + $this.attr('aria-controls') ) || $el.data('target') || $el.attr('href'),
				previous,
				$target,
				e;
			
			// If current, stop
			if ( $parent.hasClass('active') ) return;
			
			selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
			
			// determine previous panel
			previous = $tablist.find('.active:last a')[0];
			
			// Trigger the "show" event
			// Passes the previous tab element as e.relatedTarget
			// The clicked tab would be (naturally) e.target
			e = $.Event('show', {relatedTarget: previous});
			$this.trigger(e);
			
			if (e.isDefaultPrevented()) return;
			
			$target = $(selector);
			
			// Set new tab parent active
			this.activate( $parent, $tablist, 'aria-selected' );
			this.activate( $target, $target.parent(), 'aria-hidden', function(){
				// 'Shown' event
				$this.trigger({
					type:'shown',
					relatedTarget: previous
				});
			});
			
			if (w._gaq) { // If Analytics is around
				_gaq.push(['_trackEvent', 'Tab interaction', 'Clicked a panel', selector, 0]);
			}

		},
		
		activate: function(element, container, ariastatus, callback) {
			var $active = container.find('> .active'),
				isTablist = ariastatus === 'aria-selected',
				$ariaPrevEl,
				$ariaNewEl,
				transition = callback
					&& this.supportsCssTransitions 
					&& ( $active.hasClass('drop') || $active.hasClass('fade') );
			
			// Define callback function (or it'll just go if there's no csstransitions support)
			function next() {
			
				// Remove active and selected status
				$active.removeClass('active');
			
				$ariaPrevEl = isTablist ? $active.find('a') : $active;
				$ariaPrevEl.attr(ariastatus, isTablist ? 'false' : 'true' );
		
				// Add .active and ARIA status to the new one
				element.addClass('active')
			
				$ariaNewEl = isTablist ? element.find('a') : element;
				$ariaNewEl.attr(ariastatus, isTablist.toString() );
				
				if (transition) {
					element[0].offsetWidth // triggers a reflow so that the transition can work
					element.addClass('in')
				} else {
					// If transitions aren't supported or we won't be doing them here, remove the possibility
					element.removeClass('fade drop')
				}
				
				callback && callback();
			
			}
			
			/* 
			  If transtions are supported, fire next() after the previous has finished its transitions. 
			  Otherwise, just fire next(); 
			*/			
			transition ? $active.one( this.supportsCssTransitions.end, next ) : next();
			
			$active.removeClass('in'); // when finished, will trigger next();
			
		}
	}
	
	/* Define the plugin */
	$.fn.tabs = function( option ) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data('tabs');	
				
			if (!data) $this.data('tab', (data = new Tabs(this) ) );
			if (typeof option === 'string') data[option]();
		});
	}
	
	$.fn.tabs.defaults = {};
	
	/* ARIA-ize the tabs if not already in the markup */
	var $tablists = $('.nav-tabs');
	$tablists.attr('role','tablist');
	$tablists.find('a').each(function(){
		var $this = $(this),
			target;
		
		// Set ARIA-controls if not already
		if ( !$this.attr('aria-controls') ) {
			$this.attr('aria-controls', $this.data('target') || $this.attr('href'))
		}
		
		target = $( '#' + $this.attr('aria-controls') );
		
		// Set ARIA Role for the tab
		$this.attr({
			'role':'tab', 
			'aria-selected': $this.parent('li').hasClass('active').toString()
		});
		
		// And for the target
		target.attr({
			'role':'tabpanel', 
			'aria-labelledby': $this.attr('id'),
			'aria-hidden' : target.hasClass('active') ? 'false' : 'true'
			})
	});
		
	/*  WAI-ARIA Data API 
		[role="tab"]
	*/
	$(document).on('click.tabs.data', 'a[role="tab"]', function(e) {
		e.preventDefault();
		$(this).tabs('show');
	})


})(window,window.jQuery)
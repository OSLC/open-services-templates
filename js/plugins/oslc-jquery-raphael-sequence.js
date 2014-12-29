(function(window,$,Raphael){

// Extend Raphael to return the center point of elements and sets
Raphael.el.getCenter = function(){
	var bb = this.getBBox();
	return {'cx' : Math.round(bb.x + bb.width/2), 'cy': Math.round(bb.y + bb.height/2)};
}
Raphael.st.getCenter = function(){
	var bb = this.getBBox();
	return {'cx' : Math.round(bb.x + bb.width/2), 'cy': Math.round(bb.y + bb.height/2)};
}


var OSLC_animation = function(element, options) {

	// Cache the element and merge options/defaults
	var base = this;
	this.element = $(element);
	this.options = $.extend({},this.defaults, typeof options == "object" && options)


	// Set some basic properties
	this.id = element.id;	
	this.name = this.options['name'];
	this.actors = {};
	this.sets = {};

	// Init Raphael
	this.paper = this.init();
	
	// Build stage from stage object
	$.each( this.options.stage, function(key,options) {
 		base.createActor(options);
 	});
 	
 	// Add actors
 	$.each( this.options.actors, function(key,options) {
		base.createActor(options);
	});

	// Set initial values for all actors
	this.paper.forEach(function(el){
		el.data('transformStart', 	el.matrix.toTransformString() );
		el.data('opacityStart', 	el.attr('opacity') );
		el.data('fillStart', 		el.attr('fill') );
	});

	this.firstRun = true;
	this.watchingForRestart = false;
//	this.prepareRestart();
}


OSLC_animation.prototype = {
	
	constructor: OSLC_animation,
	
	init: function() {
		var $this = this.element
		  , id = this.id;
		
		return Raphael(id, this.options.width || $this.width(), this.options.height);
	},
	
	duckType: function(obj,i) {
		i = i || 0;
		
		if (typeof obj === "function") {
			return 	obj(i, this);
		}
		
		if ( $.isArray(obj) ) {
			return obj[i];
		}
		
		return obj;
	},
	
	createActor: function(o) {

		var base = this
		    ,num = o.amount || 1
			,actor
			,sets = this.sets
			,setNames = o.set
		
		// Convert to an array if necessary
		if (setNames) { setNames = $.isArray(o.set) ? o.set : [o.set] }
		
		// Loop through multiple actors
		for (var i = 0; i<num; i++) {
			
			// Create raphael object
			switch ( o.type ) {
				case 'rect':
					var x = this.duckType(o.x, i)
					  , y = this.duckType(o.y, i)
					  , w = this.duckType(o.w, i)
					  , h = this.duckType(o.h, i);
					  
					  actor = this.paper.rect(x,y,w,h);
					
					break;
				
				case 'circle':
					var x = this.duckType(o.x, i)
					  , y = this.duckType(o.y, i)
					  , r = this.duckType(o.r, i);
					
					actor = this.paper.circle(x, y, r);
					break;
					
				case 'ellipse':
					var x = this.duckType(o.x, i)
					  , y = this.duckType(o.y, i)
					  , rx = this.duckType(o.rx, i)
					  , ry = this.duckType(o.ry, i);
					  
					actor = this.paper.ellipse(x,y,rx,ry);
				
					break;
				
				case 'text':
				
					var x = this.duckType(o.x, i)
					var y = this.duckType(o.y, i)
					var text = this.duckType(o.text, i)
					
					actor = this.paper.text(x,y,text);
				
					break;
				
				case 'clone':

					actor = this.actors[o.clone].clone();
				
					break;
										
				default: // path
					actor = this.paper.path(o.path);
			}
			
			// Loop through the attributes object (we're looping so you can call functions on "i" or grab array values)
			for (var name in o.attr)
			{
			  actor.attr(name, this.duckType(o.attr[name], i) );
			}

			// Cache it to this.actors object
			this.actors[o.name + (num>1 ? i+1 : '')] = actor;
				
			// Add to set, creating if necessary
			if (setNames) {				
				$.each(setNames, function(key,setName){
					base.pushToSet(setName, actor);
				})
			}	
		}
		
		if (o.pushSetToSet) { 
			$.each(setNames, function(key,setName){				
				base.pushToSet(o.pushSetToSet, sets[setName]); 
			})
		}
		
		if (o.shuffleSet) {
			this.shuffleArray( sets[o.shuffleSet] )
		}
		
		return actor;
	
	},
	
	pushToSet: function ( setName, el ) {
		var sets = this.sets;
		
		if (sets[setName]) { // Push to existing
			sets[setName].push(el);
		} else {
			sets[setName] = this.paper.set().push(el);
		}
	},
	
	shuffleArray: function( myArray ) {
		// http://stackoverflow.com/questions/813935/randomizing-elements-in-an-array
		// http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
		var i = myArray.length, j, tempi, tempj
		while (i--)
		{
		  j = Math.floor(Math.random() * (i + 1))
		  tempi = myArray[i];
		  myArray[i] = myArray[j];
		  myArray[j] = tempi;		
		}
	},
	
	buildAnimation: function( i, params, ms, easing, delay, stagger, callback) {
		var base = this
   		  , i = i || 0
   		  , computedParams = {}
		  , animation
		
		// Build animation Params object by processing any arrays or functions
		$.each(params, function(key,value) {
			computedParams[key] = base.duckType(value,i);
		});
		
		// Build basic animation object
		animation = Raphael.animation( computedParams, ms, easing || 'ease');
		
		if (callback && typeof callback === "function") {
			// For debugging when the callback fires
// 			animation.anim[100].callback = function(){
// 				console.log('callback!')
// 				callback();
// 			}
			animation.anim[100].callback = callback;
		}
		
		// Build the delay for the animation, including stagger, if any
		delay = (delay || 0) + i*(stagger || 0);
		if (delay) animation.del = delay; // More performant than anim.delay(), as it does not make a copy

		return animation;
		
	},
	
	doAnimation: function(opts) {
		var base = this
		  , paper = this.paper
		  , actors
		  , callback = opts.callback
		  , attachCallback
		  , anim
		  , costars;
		  
		if (opts.prep) {
			opts.prep(0,this);
		}
		
		
		// Determine what we're moving
		if (opts.set) {
			actors = this.sets[opts.set]
		} else {
			// create a temporary Raphael set
			actors = paper.set(this.actors[opts.actor]);
		}
		
		if (opts.withActors) {
			costars = paper.set( this.actors[opts.withActors] )
		}
		
		if (opts.withSet) {
			costars = this.sets[opts.withSet];
		}
		
		// FASTER (for debugging)
		//opts.delay = 0;

		$.each(actors, function(i, actor){

			attachCallback = !opts.hustle && (i+1 === actors.length); 
		
			anim = base.buildAnimation(
					i
				  , opts.params
				  , opts.ms
				  , opts.ease
				  , opts.delay
				  , opts.stagger
				  , attachCallback && callback);
			
			actor.animate(anim);
			
			if ( costars && costars[i] ) {
				costars[i].animateWith( 
					actor
					, anim
					, base.buildAnimation( 
						i
						, opts.withParams || opts.params
						, opts.withMs || opts.ms
						, opts.withEase || opts.ease
						, opts.delay
						, opts.stagger
						, false) 
					);
			}
		});
		
		// Pass in a truthy "hustle" option and immediately do the callback
		// instead of assigning it to a callback with this.buildAnimation()
		if (opts.hustle) { callback() }

	},
	
	doSequence: function(seq, opts) {
		var base = this
		  , opts = opts || this.options.actions[seq]
		  , next = this.options.actions[seq+1]
		
		//console.log('sequence ' + seq);
		
		// Analytics event if this is the last sequence
		if (!next) {
			if (window._gaq) { // If Analytics is around
			  _gaq.push(['_trackEvent', 'About page interaction', 'Finished animation', this.name, 0]);
			}
		}

		opts.callback = next ? function() { base.doSequence(seq+1) } : function() { base.prepareRestart() };
		
		this.doAnimation(opts);
		
	},
	
	go: function(){  	/* Syntax candy */
		this.doSequence(0);
	},
	
	stopAnimation: function(){
		// Pause all animations in place
		this.paper.forEach(function(el,i){
			el.pause();
		});
		
	},
	
	resetPaper: function(){
	
		this.paper.forEach( function(el) {
			el.attr({ 
			  transform: el.data('transformStart')
			, opacity: el.data('opacityStart')
			, fill: el.data('fillStart')
			})
		});
		
	},
	
	prepareRestart: function(){
		var paper = this.paper
		  , base = this
		  , bg
		  , icon
		  , restartSet
		  , anim
		  , iconBB;
		
		if (this.watchingForRestart) return;
		
		this.watchingForRestart = true;
				
		paper.setStart()
		
		bg = paper
			.rect( -5,-5, paper.width+10, paper.height+10 )
			.attr({'stroke-width':0, fill:'#000', opacity: 0, 'title': 'Click to start' + (base.firstRun ? '' : ' again')}) 
		
		icon = paper
			.path(this.firstRun ? "M16.001,2c-7.732,0-14,6.268-14,14c0,7.731,6.268,14,14,14 c7.732,0,14-6.269,14-14C30.001,8.269,23.733,2,16.001,2 M13.001,22.998v-14l9.334,7L13.001,22.998z" : "M25.882,6.116C23.351,3.577,19.856,2,15.987,2C8.263,2,2.001,8.268,2.001,16 s6.266,14.001,13.988,14.001c5.723,0,10.641-3.44,12.809-8.364l-3.816-1.638c-1.538,3.442-4.984,5.853-8.991,5.853 c-5.427,0-9.843-4.42-9.843-9.852c0-5.432,4.416-9.851,9.843-9.851c2.719,0,5.18,1.022,6.963,2.814l-4.145,4.054h11.176V2 L25.882,6.116z")
			.attr({'stroke-width':.25, stroke: '#333'
				, fill: '#FFF' , transform: 'S5,5,0,0', opacity : .6
				, 'title' : 'Click to watch animation' + (this.firstRun ? '' : ' again') 
			  })
		
		restartSet = paper.setFinish();
				
		// re-set 
		restartSet.attr('cursor','pointer');
		
		iconBB = icon.getBBox();
		icon.transform('...T' + (0-iconBB.width-100) + ',' + (paper.height/2 - iconBB.height/2 - iconBB.y) );
		
		anim = Raphael.animation( {'opacity':0.1}, 200, '<', function(){
			icon.animate({'transform': '...T300,0'}, '250', '>', function(){
				if (base.firstRun && base.options.teaser){
					base.doAnimation(base.options.teaser);					
				}
			});		
		});
		
		anim.del = 750;
				
		bg.animate(anim);

		restartSet.hover(function(e){
			icon.animate({'opacity': 1}, 250, 'linear')
		},
		function(){
			icon.animate({'opacity': .6}, 250, 'linear')
		});

		restartSet.click(function(e){
			
			// Change various properties
			if (base.firstRun) { base.firstRun = false; }
			base.watchingForRestart = false;
			
			// TO DO: Define this.name property
			if (window._gaq) { // If Analytics is around
				_gaq.push(['_trackEvent', 'About page interaction', 'Started animation', base.name, 0]);
			}
			
			icon.animate({'transform': '...R360'}, 400, '<>', function(){
			
				icon.animate({'transform':'...S1.33', opacity: 0},250, '<')
				bg.animate({'opacity': 0}, 500, '<', function(){
				
					restartSet.remove();
					base.resetPaper();
					base.go();
				
				})
			
			});
			
		});
		
	},
	
}


$.fn.oslc_animation = function (option) {
  return this.each(function () {
	var $this = $(this)
	  , data = $this.data('oslc_animation')
	  , options = $.extend({}, $.fn.oslc_animation.defaults, typeof option === 'object' && option);
	if (!data) {
		$this.data('oslc_animation', (data = new OSLC_animation(this, options) )  )
	}
  });
}

$.fn.oslc_animation.defaults = {
	height : 250
  , name: 'A very fancy animation'
  , stage: [
    {  name: 'bg'
     , type: 'ellipse'
     , x: function(i,data) { return data.paper.width/2 }
  	 , y: function(i,data) { return data.paper.height/2 }
  	 , rx: function(i,data) { return data.paper.width*3.22 }
     , ry: function(i,data) { return data.paper.height*2.72 }
     , attr: {'fill': 'r#FFF-#DDD', 'stroke-width': 0}
    }]
  , actors: []
  , actions: []
}

var headerAttrs = { 
		  	'text-anchor': 'start'
		  	,'font-family': '"Helvetica Neue", Helvetica, Arial, sans-serif'
		  	,'font-size': 36
		  	,'font-weight':'bold'
		  	, fill: 'hsl(215,37,52)'
		  	, transform: 'S1.2'
		  	, opacity: 0
		  	};

var paper1opts = {
	name: 'Panel 1: Our goals'
	,actors: [
		{   name: 'beam'
		  , 'set': 'beams'
		  , amount: 18
		  , path: 'M145,0L145,53L0,0z'
		  , attr: {
			  fill : function(i) { return i % 2 ? 'hsl(30, 100, 50)' : 'hsl(60, 100, 50)'}
			, 'stroke-width': 1
			, stroke : 'hsl(15,60,50)'
			, opacity: 0
			, transform : function(i) { return 'r'+i*20 +',0,0T-150,0'} }
		}
	   ,{   name: 'puzzleLeft'
	      , 'set': 'fullPuzzle'
	      , path: "M46.388,49.958V33.891c0-1.789,0.754-3.234,2.542-3.234c0.504,0,1.052,0.307,1.088,0.307h-0.169 c1.104,0.543,2.24,0.878,3.553,0.878c4.596,0,8.276-3.726,8.276-8.319c0-4.592-3.749-8.314-8.341-8.314 c-1.271,0-2.474,0.31-3.556,0.815c0,0-0.291,0.367-0.846,0.367c-1.787,0-2.548-1.451-2.548-3.238V0H0v49.958z"
	      , attr: {
			  fill : 'hsl(215,50,56)'
			, 'stroke-width': 1
			, 'stroke-opacity': 1
			, stroke : '#222'
			, opacity: 1
			, transform : function(i,data) {return 'S2T'+ data.paper.width*2/3 +',-80'}
		  }
		}
		,{   name: 'puzzleRight'
	      , 'set': 'fullPuzzle'
	      , path: "M34.088,50.002h15.911V0H0v12.472c0-0.635,2.417-0.953,3.994-0.953c6.63,0,11.392,5.392,11.392,12.023 c0,6.63-4.762,12.026-11.392,12.026C2.42,35.569,0,35.249,0,34.613v15.389h13.335z"
	      , attr: {
			  fill : 'hsl(215,75,80)'
			, 'stroke-width': 1
			, 'stroke-opacity': 1
			, stroke : '#222'
			, opacity: 0
			, transform : function(i,data){
				var puzzleLeftBB = data.actors['puzzleLeft'].getBBox();
				return 'S5T'+( puzzleLeftBB.x + puzzleLeftBB.width + 2)+',100'}
		  }
		}
		,{   name: 'cannonball'
	      , type: 'circle', x: -20, y: 120, r: 20
	      , attr: {
			  fill : 'r(.35,.35)#999-#444'
			, 'stroke-width': 0
			, opacity: 1
		  }
		}
		,{   name: 'cloud1'
	      , 'set': 'clouds'
	      , type: 'path'
	      , path: "M24.384,59.055c0-0.696-0.072-1.374-0.185-2.037 c7.207-2.247,12.527-8.75,13.042-16.565h-0.014c0.029-0.411,0.062-0.821,0.062-1.24c0-0.567-0.033-1.125-0.084-1.681 c-0.012-0.143-0.027-0.288-0.043-0.432c-0.059-0.511-0.133-1.02-0.23-1.519c-0.008-0.04-0.014-0.082-0.021-0.123 c-0.105-0.515-0.24-1.02-0.389-1.52c-0.047-0.163-0.098-0.325-0.15-0.485c-0.129-0.398-0.273-0.792-0.428-1.179 c-0.063-0.156-0.125-0.311-0.191-0.464c-0.17-0.394-0.355-0.775-0.552-1.153c-0.102-0.197-0.208-0.392-0.316-0.585 c-0.151-0.266-0.312-0.525-0.475-0.784c-0.188-0.3-0.385-0.591-0.589-0.878c-0.167-0.231-0.334-0.463-0.511-0.688 c-0.174-0.217-0.352-0.431-0.531-0.642c-0.138-0.159-0.28-0.315-0.424-0.469c-0.345-0.376-0.706-0.734-1.08-1.081 c-0.128-0.117-0.252-0.237-0.383-0.35c-0.232-0.205-0.472-0.399-0.716-0.591c-0.139-0.111-0.279-0.214-0.42-0.319 c-0.214-0.157-0.439-0.298-0.659-0.448c-2.687-1.689-5.858-2.685-9.271-2.69v-2.621c3.357,0,6.517,0.834,9.298,2.291 c0.624-1.638,0.995-3.398,0.995-5.255c0-8.317-6.742-15.06-15.06-15.06c-7.915,0-14.39,6.107-15.001,13.864H0v44.703 c0,6.732,5.459,12.191,12.191,12.191C18.924,71.246,24.384,65.787,24.384,59.055z"
	      , attr: {
			  fill : '#DDD'
			, 'stroke-width': 0
			, opacity: 1
			, transform : 't-60,130s.1,.1,0,0'
		  }
		}
		,{  name: 'cloud2'
	      , 'set': 'clouds'
	      , type: 'path'
	      , path: "M32.741,15.547c0,2.074-0.393,4.156-1.167,6.188l-0.185,0.483 c0.142,0.105,0.282,0.211,0.405,0.311c0.283,0.222,0.561,0.447,0.81,0.667c0.118,0.102,0.232,0.208,0.346,0.313l0.105,0.098 c0.446,0.413,0.85,0.816,1.216,1.216c0.164,0.175,0.326,0.354,0.501,0.554c0.2,0.235,0.398,0.474,0.601,0.729 c0.199,0.254,0.39,0.516,0.581,0.783c0.234,0.326,0.457,0.659,0.675,1.004c0.184,0.293,0.365,0.586,0.541,0.896 c0.121,0.219,0.242,0.438,0.357,0.662c0.242,0.466,0.449,0.897,0.631,1.317c0.072,0.164,0.139,0.331,0.215,0.525 c0.182,0.446,0.348,0.902,0.49,1.343c0.061,0.188,0.121,0.379,0.174,0.557c0.188,0.633,0.332,1.201,0.451,1.781l0.016,0.1 c0.107,0.542,0.193,1.111,0.264,1.725c0.02,0.166,0.035,0.333,0.051,0.499c0.064,0.721,0.094,1.329,0.094,1.915 c0,0.45-0.029,0.87-0.057,1.24l0.002,0.171C39.332,48.607,34.26,55.656,27,58.771c0.003,0.096,0.004,0.19,0.004,0.283 c0,1.538-0.236,3.021-0.673,4.418c1.016,4.45,4.99,7.773,9.749,7.773c5.529,0,10.01-4.479,10.01-10.009 c0-0.569-0.059-1.128-0.15-1.674c5.916-1.843,10.285-7.181,10.709-13.599h-0.012c0.021-0.336,0.053-0.674,0.053-1.017 c0-0.467-0.031-0.925-0.072-1.381c-0.008-0.119-0.021-0.236-0.033-0.354c-0.049-0.42-0.109-0.836-0.189-1.246 c-0.008-0.033-0.012-0.066-0.018-0.1c-0.086-0.426-0.197-0.84-0.318-1.25c-0.041-0.135-0.082-0.267-0.125-0.398 c-0.105-0.328-0.225-0.65-0.352-0.968c-0.051-0.128-0.104-0.256-0.156-0.381c-0.139-0.323-0.293-0.638-0.453-0.947 c-0.084-0.161-0.172-0.321-0.262-0.48c-0.123-0.217-0.254-0.432-0.389-0.643c-0.154-0.246-0.316-0.485-0.482-0.721 c-0.139-0.19-0.275-0.381-0.42-0.565c-0.143-0.178-0.289-0.354-0.438-0.525c-0.113-0.131-0.229-0.259-0.346-0.387 c-0.285-0.308-0.58-0.604-0.887-0.888c-0.105-0.096-0.207-0.193-0.314-0.287c-0.191-0.167-0.389-0.328-0.588-0.484 c-0.115-0.09-0.23-0.177-0.346-0.263c-0.346-0.255-0.701-0.497-1.066-0.726l0.195-1.254c0.736-1.578,1.17-3.324,1.17-5.183 c0-6.828-5.535-12.363-12.363-12.363c-2.08,0-4.029,0.525-5.745,1.436C32.71,14.908,32.741,15.225,32.741,15.547z"
	      , attr: {
			  fill : '#DDD'
			, 'stroke-width': 0
			, opacity: 1
			, transform : function(i,data) { return data.actors['cloud1'].transform() }
		  }
		}
		,{  name: 'textbgtop'
		  , type: 'rect'
		  , x: 0
		  , y: -125
		  , w: function(i,data) {return data.paper.width}
		  , h: 125
		  , attr: {fill: '270-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R-5T-50,-48'}
		 }
		,{  name: 'textbgbottom'
		  , type: 'rect'
		  , x: 0
		  , y: 250
		  , w: function(i,data) {return data.paper.width}
		  , h: 125
		  , attr: {fill: '90-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R5T-50,48'}
		 }
		,{  name: 'header1'
		  , type: 'text'
		  , text: 'Easier integrations'
		  , x: 50
		  , y: 125
		  , attr: headerAttrs
		}
		,{  name: 'header2'
		  , type: 'text'
		  , text: 'Robust, flexible connections'
		  , x: 50
		  , y: 125
		  , attr: headerAttrs
		}
		,{  name: 'header3'
		  , type: 'text'
		  , text: 'Expose & use more data'
		  , x: 50
		  , y: 125
		  , attr: headerAttrs
		}
	  ]
	,actions: [
	   { // text bgs slide in
		  actor: 'textbgtop'
		, delay: 500
		, params: {transform: '...T0,125'}
		, ms: 400
		, ease: '<>'
		, withActors: 'textbgbottom'
		, withParams: {transform: '...T0,-125'}
	   }
	 , { // Header1 shows up
	 	  actor: 'header1'
	 	, delay: 100
	 	, params: {opacity: 1, transform: ''}
	 	, ms: 500
	 	, ease: '<'
	   }
	 , { // Header1 shows up
	 	  actor: 'header1'
	 	, delay: 2000
	 	, params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	 	, ms: 400
	 	, ease: '<'
	   }
	 , { // text bgs slide up
		  actor: 'textbgtop'
		, delay: 100
		, params: {transform: '...T0,-125'}
		, ms: 400
		, ease: '<>'
		, withActors: 'textbgbottom'
		, withParams: {transform: '...T0,125'}
	   }
	 , {   // Left puzzle slides in
	      actor: 'puzzleLeft'
		, delay: 250
		, params: {'transform': '...T0,180'}
		, ms: 600
		, ease: '<>'
		}
	, {   // Right puzzle drops
		  actor: 'puzzleRight'
		, delay: 1000
		, params: {opacity: 1, transform: '...S.4'}
		, ms: 600
		, ease: '<'
	  }
	, { // text bgs slide in
		 actor: 'textbgtop'
	   , delay: 500
	   , params: {transform: '...T0,125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,-125'}
	  }
	, { // Header2 in
		 actor: 'header2'
	   , delay: 50
	   , params: {opacity: 1, transform: ''}
	   , ms: 500
	   , ease: '<'
	  }
	, { // Header2 out
		 actor: 'header2'
	   , delay: 2500
	   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	   , ms: 400
	   , ease: '<'
	  }
	, { // text bgs slide out
		 actor: 'textbgtop'
	   , delay: 50
	   , params: {transform: '...T0,-125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,125'}
	  }
	, { // Puzzle stands up
	    'set': 'fullPuzzle'
	  , delay: 250
	  , params: {
	  	  'transform': function(i,data) { 
	  		  var puzzleCenter = data.sets['fullPuzzle'].getCenter();  
			  return '...R90,' + puzzleCenter.cx + ',' + puzzleCenter.cy 
		  }
		}
	  , ms: 750
	  , ease: '<>'	
	}
	, { // Clouds expand 1
	    'set': 'clouds'
	  , delay: 1000
	  , params: {'opacity':1, 'transform': '...T20,0s20,20,0,45'} 
	  , ms: 900
	  , ease: 'linear'			
	}
	, { // Clouds expand 2 + cannonball goes
	    'set': 'clouds'
	  , delay: 0
	  , params: {'opacity': 0, 'transform': '...T10,0s1.5,1.5,0,45'}
	  , ms: 450
	  , ease: 'linear'
	  , withActors: 'cannonball'
	  , withParams: {'transform': function(i,data){ return 't' + data.actors['puzzleLeft'].getBBox().x + ',0' } }
	  , withEase: 'linear'
	}
	, { // Cannonball splat
		actor: 'cannonball'
	  , delay: 0
	  , params: {'transform': function(i,data){ 
	  		var fullPuzzle = data.sets['fullPuzzle'];
	  		return '...S.75,1.3333,' + fullPuzzle.getBBox().x + ',' + fullPuzzle.getCenter().cy 
		  } 
		}
	  , ms: 50
	  , ease: '>'
	}
	, { // Cannonball drops
		actor: 'cannonball'
	  , delay: 800
	  , params: {'transform': '...S1.3333,0.75T-50,175', opacity: 0}
	  , ms: 250
	  , ease: '<'
	}
	, { // text bgs slide in
		 actor: 'textbgtop'
	   , delay: 500
	   , params: {transform: '...T0,125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,-125'}
	  }
	, { // Header3 in
		 actor: 'header3'
	   , delay: 50
	   , params: {opacity: 1, transform: ''}
	   , ms: 500
	   , ease: '<'
	  }
	, { // Header3 out
		 actor: 'header3'
	   , delay: 2250
	   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	   , ms: 400
	   , ease: '<'
	  }
	, { // text bgs slide out
		 actor: 'textbgtop'
	   , delay: 50
	   , params: {transform: '...T0,-125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,125'}
	  }
	, { // Full puzzle to stage 3
		'set': 'fullPuzzle'
	  , delay: 300
	  , params: {'transform': function(i,data) {
		  var puzzleCenter = data.sets['fullPuzzle'].getCenter();
		  return '...R-90,' + puzzleCenter.cx + ',' + puzzleCenter.cy + 'T0,-20'
		} 
	  }
	  , ms: 600
	  , ease: '<>'
	}
	, { // beams be shinin' 1
		'set': 'beams'
	  , delay: 500
	  , prep: function(i,data) {
			var beams = data.sets['beams']
				,puzzleRightBox = data.actors['puzzleRight'].getBBox();
			
			beams.transform('...T' + ( beams.getBBox().width/2 + data.sets['fullPuzzle'].getCenter().cx ) + ',' + ( puzzleRightBox.y + puzzleRightBox.height/2 ) );
	    }
	  , params: { opacity: .125
	    , transform: function(i,data) { 
		  var beamsCenter = data.sets['beams'].getCenter();
		  return '...R-6,' + beamsCenter.cx + ',' + beamsCenter.cy  
		} 
	  }
	  , ease: 'linear'
	  , ms: 800
	}
	, { // beams be shinin' 2
	    'set': 'beams'
	  , delay: 0
	  , params: { transform: function(i,data){ 
		  var beamsCenter = data.sets['beams'].getCenter();
		  return '...R-18,' + beamsCenter.cx + ',' + beamsCenter.cy } }
	  , ease: 'linear'
	  , ms: 2400
	}
	, { // beams be spreadin'
	    'set': 'beams'
	  , delay: 0
	  , params: { opacity: 0, transform: '...t70,0' }
	  , ease: '<'
	  , ms: 800
	}
	, { // puzzle to center
		'set': 'fullPuzzle'
	  , delay: 1000
	  , params: { 'transform': function(i,data) {
		  var puzzleCenter = data.sets['fullPuzzle'].getCenter();
		  return '...R-360,' + puzzleCenter.cx + ',' +  puzzleCenter.cy + 'T' + ( data.paper.width/2 - puzzleCenter.cx ) +','+ (data.paper.height/2 - puzzleCenter.cy)  } 
	    }
	  , ease: '<>'
	  , ms: 800
	}
	, { // puzzle grows
		'set': 'fullPuzzle'
	  , delay: 0
	  , params: { 'transform': function(i,data) { return '...S1.6,1.6,' + data.paper.width/2 + ',' +  data.paper.height/2} }
	  , ease: '<>'
	  , ms: 500
	}
	]
	,teaser: {
		'set': 'fullPuzzle'
	  , prep: function(i,data) {
	  		var paper = data.paper
	  			,puzzleLeft = data.actors['puzzleLeft']
	  			,puzzleRight = data.actors['puzzleRight'];
	  		
	  		data.sets['fullPuzzle'].attr('opacity',1);
	  		
			puzzleLeft.transform('T' + (paper.width + puzzleLeft.getBBox().width) +',100S3');
			puzzleRight.transform('T'+ (puzzleLeft.getBBox().x + puzzleRight.getBBox().width - 50) +',100S3');
		}
	  , delay: 100
	  , params: {transform: function(i,data) { return '...T-'+ Math.round(data.paper.width/4) +',0' }}
	  , ms: 350
	  , ease: '<>'
	}
}

var paper2opts = {
	name: 'Panel 2: Our process'
	,actors: [
		{ name: 'person'
		, 'set': 'people'
		, amount: 4
		, path: "M24.997,23.264c6.322,0,11.437-5.115,11.437-11.426c0-6.309-5.115-11.427-11.437-11.427 c-6.302,0-11.43,5.118-11.43,11.427C13.566,18.149,18.695,23.264,24.997,23.264z M25.003,28.3c-12.97,0-23.584,9.375-24.592,21.289 h49.178C48.587,37.675,37.977,28.3,25.003,28.3z"
		, attr: { 'stroke-width': 0.75, 'stroke-opacity': 1, stroke: '#333'
		   , opacity: 0
		   , fill: ['hsl(215,10,60)'
			  ,'hsl(215,10,40)'
			  ,'hsl(215,10,35)'
			  ,'hsl(215,10,70)']
		   , transform: function(i,data) {
		   		var paperw = data.paper.width
		   			,transforms = ['t'+(paperw-400)+',180S1.5'
				,'t'+(paperw-180)+',175S1.1667'
				,'t'+(paperw-320)+',150'
				,'t'+(paperw-260)+',130S0.6667']
				
		   		return transforms[i];
		     } 
		   } 
	  }
	  , { name: 'bubble'
		, 'set': 'bubbles'
		, amount: 7
		, type: 'circle', x: 0, y: 0, r: 8
		, attr: { opacity: 0, fill: '#FFF' }
	  }
	  , { name: 'thought'
		, 'set': 'specAndThought'
		, path: "M14.458,8.041c-1.064-1.243-2.451-1.704-3.785-1.704C4.779,6.337,0,11.116,0,17.01 c0,5.895,4.779,10.674,10.673,10.674h30.24c4.913,0,8.895-3.982,8.895-8.895c0-4.913-3.981-8.894-8.895-8.894 c-0.702,0-1.379,0.101-2.036,0.255C37.77,4.923,33.131,1,27.571,1C14.78,1,14.458,8.041,14.458,8.041z"
		, attr: { opacity: 0, fill: '#FFF', stroke: '#888', 'stroke-width': 2, transform: 's3,3,0,0' }
	  }
	  , { name: 'spec'
	   , 'set': 'specAndThought'
	   , path: "M35.673,0.097H17.885v42.691h32.018V14.327h-14.23V0.097z M44.566,37.451H23.222v-1.778 h21.345V37.451z M44.566,32.115H23.222v-1.779h21.345V32.115z M44.566,26.779H23.222V25h21.345V26.779z M44.566,19.664v1.779 H23.222v-1.779H44.566z M37.451,0.097v12.452h12.452L37.451,0.097z M16.106,39.23H5.434v-1.779h10.673v-3.557H5.434v-1.779h10.673 v-3.558H5.434v-1.778h10.673v-3.558H5.434v-1.779h10.673V7.212H0.097v42.691h32.018v-5.337H16.106V39.23z"
	   , attr: {fill: 'hsl(215,55,42)','stroke-width': .2, stroke: '#111', 'stroke-opacity': '1', opacity: 0}
	  }
	,{ name: 'clonedSpec'
	  , 'set': 'clonedSpecs'
	  , amount: 4
	  , type: 'clone'
	  , clone: 'spec'
	}
	,{ name: 'monitor1a'
	  , 'set': 'monitor1'
	  , path: "M28.136,2H3.868C2.837,2,2.001,2.842,2.001,3.881V21.12 c0,1.039,0.836,1.88,1.867,1.88h24.268c1.029,0,1.865-0.841,1.865-1.88V3.881C30.001,2.842,29.165,2,28.136,2 M28.001,17h-24V4h24 V17z"
	  , attr: {fill: '#CCC', 'stroke-width' : .5, stroke: '#666', opacity : 0
	    , transform: function(i,data){ return 'S4,4,0,0T' + (data.paper.width-385) + ',120' }
	    }
	}
	,{ name: 'monitor1b'
	  , 'set': 'monitor1'
	  , pushSetToSet: 'screens'
	  , path: "M19.001,24.001 13.001,24.001 13.001,28.001 10.001,28.001 10.001,30.001 13.001,30.001 19.001,30.001 22.001,30.001 22.001,28.001 19.001,28.001 z"
	  , attr: {fill: '#CCC', 'stroke-width' : .5, stroke: '#666', opacity : 0
	    , transform: function(i,data){ return data.actors['monitor1a'].transform() }
	    }
	}
	,{ name: 'laptop1'
	  , 'set': 'screens'
	  , path: "M29.969,27.436L27.585,19H23v2H9v-2H4.513l-2.386,8.436 C1.635,28.903,2.666,30,3.762,30h24.572C29.432,30,30.163,28.139,29.969,27.436 M27,3.648C27,2.743,26.561,2,25.699,2H6.398 C5.537,2,5,2.743,5,3.648V18h22V3.648z M24,15H8V5h16V15z"
	  , attr: {'fill': '#777', 'stroke-width' : .25, 'stroke': '#111', 'opacity' : 0
	    , transform: function(i,data){ return 'S3,3,0,0T'+ (data.paper.width - 225) +',100'}
	    }
	}
	,{  name: 'monitor2a'
	  , 'set': 'monitor2'
	  , type: 'clone'
	  , clone: 'monitor1a'
	  , attr: {fill: '#BBB', 'stroke-width' : .3, stroke: '#555'
		 , transform: function(i,data) { return 'S2,2,0,0T'+(data.paper.width - 112)+',65' }
		}
	}
	,{  name: 'monitor2b'
	  , 'set': 'monitor2'
	  , pushSetToSet: 'screens'
	  , type: 'clone'
	  , clone: 'monitor1b'
	  , attr: {fill: '#BBB', 'stroke-width' : .3, stroke: '#555' 
		 , transform: function(i,data) { return data.actors['monitor2a'].transform() }
		}
	}
	,{  name: 'laptop2'
	  , 'set': 'screens'
	  , type: 'clone'
	  , clone: 'laptop1'
	  , attr: {fill: '#666', transform: function(i,data){ return 'S1.5,1.5,0,0T'+(data.paper.width - 35)+',10'} }
	}
	,{  name: 'textbgtop'
	  , type: 'rect'
	  , x: 0
	  , y: -125
	  , w: function(i,data) {return data.paper.width}
	  , h: 125
	  , attr: {fill: '270-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R-5T-50,-48'}
	 }
	,{  name: 'textbgbottom'
	  , type: 'rect'
	  , x: 0
	  , y: 250
	  , w: function(i,data) {return data.paper.width}
	  , h: 125
	  , attr: {fill: '90-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R5T-50,48'}
	 }
	,{  name: 'header1'
	  , type: 'text'
	  , text: 'Gather industry experts'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	,{  name: 'header2'
	  , type: 'text'
	  , text: 'Discuss common problems & solutions'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	,{  name: 'header3'
	  , type: 'text'
	  , text: 'Publish open specifications'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	]
	,actions: [
	{ // text bgs slide in
		 actor: 'textbgtop'
	   , delay: 500
	   , params: {transform: '...T0,125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,-125'}
	  }
	, { // Header1 in
		 actor: 'header1'
	   , delay: 50
	   , params: {opacity: 1, transform: ''}
	   , ms: 500
	   , ease: '<'
	  }
	, { // Header3 out
		 actor: 'header1'
	   , delay: 1750
	   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	   , ms: 400
	   , ease: '<'
	  }
	, { // text bgs slide out
		 actor: 'textbgtop'
	   , delay: 50
	   , params: {transform: '...T0,-125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,125'}
	  }
	,{ // people slide in
	    'set': 'people'
	  , delay: 500
	  , stagger: 500
	  , params: {opacity: 1, transform: ['...T10,0' ,'...T-10,0' ,'...T0,5' ,'...T0,-5'] } 
	  , ms: 1000
	  , ease: '<>'
	}
	,{ // text bgs slide in
		 actor: 'textbgtop'
	   , delay: 750
	   , params: {transform: '...T0,125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,-125'}
	  }
	, { // Header2 in
		 actor: 'header2'
	   , delay: 50
	   , params: {opacity: 1, transform: ''}
	   , ms: 500
	   , ease: '<'
	  }
	, { // Header2 out
		 actor: 'header2'
	   , delay: 2500
	   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	   , ms: 400
	   , ease: '<'
	  }
	, { // text bgs slide out
		 actor: 'textbgtop'
	   , delay: 50
	   , params: {transform: '...T0,-125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,125'}
	  }
	,{ // Bubbles!
	    prep: function(i,data) {
	    	var people = data.sets['people']
	    		,transforms = ['S.5T' + (people[0].getCenter().cx + 10) + ',' + (people[0].getBBox().y - 15)
				,'S.6T' + (people[1].getCenter().cx - 10) + ',' + (people[1].getBBox().y - 10)
				,'S.5T' + (people[2].getCenter().cx + 2) + ',' + (people[2].getBBox().y - 10)
				,'S.65T' + (people[3].getCenter().cx - 5) + ',' + (people[3].getBBox().y - 5)
				,'S.8T' + (people[0].getCenter().cx + 25) + ',' + (people[0].getBBox().y - 45)
				,'S.9T' + (people[1].getCenter().cx - 35) + ',' + (people[1].getBBox().y - 50)
				,'S.8T' + (people[2].getCenter().cx + 12) + ',' + (people[2].getBBox().y - 40)
			]
			data.sets['bubbles'].forEach(function(bubble,x){
				bubble.transform( transforms[x] );
			});
	    }
	  , 'set': 'bubbles'
	  , delay: 1000
	  , stagger: 125
	  , params: { opacity: 1, transform: '...T0,-10' }
	  , ms: 350
	}
	,{ // thought bubble appears
	    prep: function(i,data) {
	    	// Place the thought bubble dead center over the people
	    	data.actors['thought'].transform('...T' + ( data.sets['people'].getCenter().cx - data.actors['thought'].getCenter().cx ) + ',15' )
	    }
	  , actor: 'thought'
	  , delay: 150
	  , params: { opacity: 1, transform: '...T0,-10' }
	  , ms: 300
	}
	,{ // Spec appears
		actor: 'spec'
	  , prep: function(i,data){
	  		var spec = data.actors['spec']
			  , specCenter = spec.getCenter()
			  , thoughtCenter = data.actors['thought'].getCenter();
	  		
	  		spec.transform('...T' + (thoughtCenter.cx - specCenter.cx) + ',' + (thoughtCenter.cy - specCenter.cy))
		}
	  , delay: 200
	  , params: {opacity: 1}
	  , ms: 200
	}
	,{ // people dance 1
		'set': 'people'
	  , delay: 500
	  , stagger: 50
	  , params: { transform: '...t0,-8' }
	  , ms: 100
	  , ease: '>'
	}
	,{ // people dance 2
		'set': 'people'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...t0,8' }
	  , ms: 100
	  , ease: '<'
	}
	,{ // people dance 3
		'set': 'people'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...t0,-8' }
	  , ms: 100
	  , ease: '>'
	}
	,{ // people dance 4
		'set': 'people'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...t0,8' }
	  , ms: 100
	  , ease: '<'
	}
	,{ // text bgs slide in
		 actor: 'textbgtop'
	   , delay: 750
	   , params: {transform: '...T0,125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,-125'}
	  }
	, { // Header3 in
		 actor: 'header3'
	   , delay: 50
	   , params: {opacity: 1, transform: ''}
	   , ms: 500
	   , ease: '<'
	  }
	, { // Header3 out
		 actor: 'header3'
	   , delay: 2000
	   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
	   , ms: 400
	   , ease: '<'
	  }
	, { // text bgs slide out
		 actor: 'textbgtop'
	   , delay: 50
	   , params: {transform: '...T0,-125'}
	   , ms: 400
	   , ease: '<>'
	   , withActors: 'textbgbottom'
	   , withParams: {transform: '...T0,125'}
	  }
	,{ // drop the people
		delay: 250
	  , 'set': 'people'
	  , stagger: 75
	  , params: { opacity: 0, transform: '...t0,100' }
	  , ms: 250
	  , ease: '<'
	}
	,{ // pop bubbles
		delay: 125
	  , 'set': 'bubbles'
	  , stagger: 50
	  , params: {opacity: 0, transform: '...S2'}
	  , ms: 133
	  , ease: '>'
	}
	,{ // Slide the spec over
		'set': 'specAndThought'
	  , delay: 500
	  , params: { transform: function(i,data) { 
	  		  var specBox = data.actors['spec'].getBBox()
	  		  	  ,tx = data.paper.width-specBox.x-475;
		  	  
		  	  return '...T'+tx+',0' 
			}
		}
	  , ms: 750
	  , ease: '<>'
	  , hustle: true
	}
	,{ // Screens slide in from the right
		'set': 'screens'
	  , delay: 650
	  , stagger: 100
	  , params: { opacity: 1, transform: '...T-15,0' }
	  , ms: 250
	}
	,{ // Specs get distributed to the screens
		'set': 'clonedSpecs'
	  , prep: function(i,data) { 
	  		var shrink = [ '...S.8' ,'...S.45' ,'...S.33' ,'...S.22' ];

	  		data.sets['clonedSpecs']
	  			.transform( data.actors['spec'].transform() )
	  			.forEach(function(spec,x){ spec.transform( shrink[x] ); });
	    }
	  , delay: 1000
	  , stagger: 250
	  , params: { 
	  		opacity: 1
	      , transform: function(i,data) {
	  			var clonedTy = [-22,-18,-11,-9]
				  , screenCenter = data.sets['screens'][i].getCenter()
				  , specCenter = data.sets['clonedSpecs'][i].getCenter();
				  
				  return '...T' + Math.floor( screenCenter.cx - specCenter.cx ) + ',' + Math.floor( screenCenter.cy - specCenter.cy + clonedTy[i] );	
	  		}
	  	}
	  , ms: 400
	  , ease: '>'
	}
	,{ // screens dance 1
		'set': 'screens'
	  , withSet: 'clonedSpecs'
	  , delay: 500
	  , stagger: 50
	  , params: { transform: '...T0,-5' }
	  , ms: 100
	  , ease: '>'
	}
	,{ // screens dance 2
		'set': 'screens'
	  , withSet: 'clonedSpecs'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...T0,5' }
	  , ms: 100
	  , ease: '<'
	}
	,{ // screens dance 3
		'set': 'screens'
	  , withSet: 'clonedSpecs'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...T0,-5' }
	  , ms: 100
	  , ease: '>'
	}
	,{ // screens dance 4
		'set': 'screens'
	  , withSet: 'clonedSpecs'
	  , delay: 0
	  , stagger: 50
	  , params: { transform: '...T0,5' }
	  , ms: 100
	  , ease: '<'
	}
	,{ // screens drop
		'set': 'screens'
	  , withSet: 'clonedSpecs'
	  , delay: 1000
	  , stagger: 100
	  , params: { opacity: 0, transform: '...T0,100' }
	  , ms: 250
	  , ease: '<'
	}
	,{ // spec to the center
		'set': 'specAndThought'
	  , delay: 1000
	  , params: { transform: function(i,data) {
		  var specCenter = data.sets['specAndThought'].getCenter();
		  return '...R-360,' + specCenter.cx +','+ specCenter.cy + 'T' + (data.paper.width/2 - specCenter.cx) + ','+ (data.paper.height/2 - specCenter.cy);
		}
	  }
	  , ms: 750
	  , ease: '<>'
	}
	,{ // spec embiggens
		'set': 'specAndThought'
	  , delay: 100
	  , params: { transform: '...S1.8' }
	  , ms: 500
	}
  ]
    ,teaser: {
		'set': 'people'
	  , prep: function(i,data) {
	  		var paper = data.paper
	  			,people = data.sets['people'];
	  			
	  		people.transform('S3,3,0,0T'+paper.width+',120').attr('opacity',1)
		}
	  , delay: 100
	  , params: {transform: function(i,data) { return '...T-'+ (225-i*50) +',0' }}
	  , stagger: 125
	  , ms: 100
	  , ease: '<>'
	}
}

var textAttrs = {'font-family': 'monospace', 'font-size': '16px', 'font-weight': 800, 'fill': '#666', 'opacity': 0, 'transform': ''}

var paper3opts = {
	name: 'Panel 3: Our specifications'
  , actors: [{ name: 'jumbleA'
	  , 'set': ['jumble','otherLetters']
	  , amount: 8
	  , type: 'text'
	  , text: ['z', 'a', 'y', 'b', 'x', 'c', 'w', 'd']
	  , x: function(i,data) {return (data.paper.width-400) + i*(Math.round(data.paper.width/34.28)) }
	  , y: 60
	  , attr: textAttrs
	}
	,{ name: 'jumbleB'
	  , 'set': ['jumble','otherLetters']
	  , amount: 8
	  , type: 'text'
	  , text: ['e', 'l', 'y', 'f', 'e', 'd', 'q', 's']
	  , x: function(i,data) {return (data.paper.width-400) + i*(Math.round(data.paper.width/34.28)) }
	  , y: 90
	  , attr: textAttrs
	}
	,{ name: 'jumbleC'
	  , 'set': ['jumble','resourceLetters', 'specLetters']
	  , amount: 8
	  , type: 'text'
	  , text: ['r', 'e', 's', 'o', 'u', 'r', 'c', 'e']
	  , x: function(i,data) {return (data.paper.width-400) + i*(Math.round(data.paper.width/34.28)) }
	  , y: 120
	  , attr: textAttrs
	}
	,{ name: 'jumbleD'
	  , 'set': ['jumble','otherLetters']
	  , amount: 8
	  , type: 'text'
	  , text: ['m', 'h', 'e', 'r', 'i', 'n', 't', 'p']
	  , x: function(i,data) {return (data.paper.width-400) + i*(Math.round(data.paper.width/34.28)) }
	  , y: 150
	  , attr: textAttrs
	}
	,{ name: 'jumbleE'
	  , 'set': ['jumble','otherLetters']
	  , shuffleSet: 'otherLetters'
	  , amount: 8
	  , type: 'text'
	  , text: ['s', 'f', 't', 'n', 'u', 'c', 'k', 'e']
	  , x: function(i,data) {return (data.paper.width-400) + i*(Math.round(data.paper.width/34.28)) }
	  , y: 180
	  , attr: textAttrs
	}
	,{ name: 'httpLetters'
	  , 'set': 'specLetters'
	  , type: 'text'
	  , text: 'http://application/'
	  , x: function(i,data) {return data.paper.width/2}
	  , y: 120
	  , attr: textAttrs
	}
	,{ name: 'findLetters'
	  , 'set': 'apiLetters'
	  , type: 'text'
	  , text: '/find'
	  , x: 0
	  , y: 90
	  , attr: $.extend({},textAttrs,{'text-anchor': 'start'})
	}
	,{ name: 'selectLetters'
	  , 'set': 'apiLetters'
	  , type: 'text'
	  , text: '/select'
	  , x: 0
	  , y: 90
	  , attr: $.extend({},textAttrs,{'text-anchor': 'start'})
	}
	,{ name: 'previewLetters'
	  , 'set': 'apiLetters'
	  , type: 'text'
	  , text: '/preview'
	  , x: 0
	  , y: 90
	  , attr: $.extend({},textAttrs,{'text-anchor': 'start'})
	}
	,{ name: 'robot'
	  , 'set': ['implementation', 'implementationWithoutFlash']
	  , path: "M44.512,26.972c0-8.786-8.385-17.706-18.625-18.541V5.326 c1.032-0.367,1.773-1.341,1.773-2.498c0-1.469-1.192-2.661-2.662-2.661c-1.469,0-2.661,1.192-2.661,2.661 c0,1.157,0.743,2.132,1.776,2.498v3.105C13.873,9.266,5.489,18.186,5.489,26.972v6.897h39.023V26.972z M17.414,28.127 c-2.289,0-4.14-1.854-4.14-4.139c0-2.287,1.852-4.14,4.14-4.14c2.283,0,4.138,1.853,4.138,4.14 C21.552,26.273,19.696,28.127,17.414,28.127z M32.587,28.127c-2.287,0-4.137-1.854-4.137-4.139c0-2.287,1.85-4.14,4.137-4.14 c2.286,0,4.14,1.853,4.14,4.14C36.727,26.273,34.873,28.127,32.587,28.127z M0.167,35.643v14.19h49.666v-14.19H0.167z"
	  , attr: {fill: 'hsl(215,50,56)', 'stroke-width': 0, transform: function(i,data) { return 'S1.5,1.5,0,0T' + (data.paper.width*3/4) + ',-150' } }
	}
	,{ name: 'cabinetBg'
	  , 'set': ['implementation', 'implementationWithoutFlash']
	  , type: 'rect'
	  , x: function(i,data) { return Math.round( data.actors['robot'].getBBox().x ) }
	  , y: function(i,data) { return Math.round( data.actors['robot'].getBBox().y ) }
	  , w: function(i,data) { return Math.round( data.actors['robot'].getBBox().width + 1 ) }
	  , h: function(i,data) { return Math.round( data.actors['robot'].getBBox().height + 1 ) }
	  , attr: {fill: '#FFF', 'stroke-width': 0, opacity: 1}
	}
	,{ name: 'cabinet'
	  , 'set': ['implementation', 'implementationWithoutFlash']
	  , path: "M46.208,0.237H3.773L0.237,5.543h49.525L46.208,0.237z M7.312,42.688h35.375v-8.844 H7.312V42.688z M17.925,37.382h14.15v1.769h-14.15V37.382z M7.312,21.462h35.375v-8.844H7.312V21.462z M17.925,16.156h14.15v1.769 h-14.15V16.156z M0.237,49.764h49.525V7.312H0.237V49.764z M5.544,10.85h38.912v33.607H5.544V10.85z M7.312,32.075h35.375v-8.844 H7.312V32.075z M17.925,26.769h14.15v1.769h-14.15V26.769z"
	  , attr: {fill: '#999', 'stroke-width': 0, transform: function(i,data){ return 'S2,2,0,0' } }
	}
	,{ name: 'flash'
	  , 'set': 'implementation'
	  , type: 'circle'
	  , x: function(i,data) { 
	  	var cabinet = data.actors['cabinet']
	  	   ,robot = data.actors['robot']
	  	   ,dx = robot.getCenter().cx - cabinet.getCenter().cx
	  	   ,dy = robot.getBBox().y - 2;
	  	
	  	cabinet.transform( '...T' + dx + ',' + dy )
	  	
	  	return cabinet.getCenter().cx }
	  , y: function(i,data) { return data.actors['cabinet'].getCenter().cy }
	  , r: 5
	  , attr: {fill: '#FFF', 'stroke-width': 0, opacity: 0 }
	}
	,{  name: 'textbgtop'
	  , type: 'rect'
	  , x: 0
	  , y: -125
	  , w: function(i,data) {return data.paper.width}
	  , h: 125
	  , attr: {fill: '270-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R-5T-50,-48'}
	 }
	,{  name: 'textbgbottom'
	  , type: 'rect'
	  , x: 0
	  , y: 250
	  , w: function(i,data) {return data.paper.width}
	  , h: 125
	  , attr: {fill: '90-#DDD-white', opacity: 0, 'stroke-width' :0, transform: 'R5T-50,48'}
	 }
	,{  name: 'header1'
	  , type: 'text'
	  , text: 'Minimalistic'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	,{  name: 'header2'
	  , type: 'text'
	  , text: 'Inspired by the web'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	,{  name: 'header3'
	  , type: 'text'
	  , text: 'Implemented & tested'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
	,{  name: 'header4'
	  , type: 'text'
	  , text: 'Evolving'
	  , x: 50
	  , y: 125
	  , attr: headerAttrs
	}
  ]
  , actions: [
  { // text bgs slide in
	 actor: 'textbgtop'
   , delay: 250
   , params: {transform: '...T0,125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,-125'}
  }
  ,{ // Header1 in
	 actor: 'header1'
   , delay: 50
   , params: {opacity: 1, transform: ''}
   , ms: 500
   , ease: '<'
  }
  ,{ // Header1 out
	 actor: 'header1'
   , delay: 1600
   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
   , ms: 400
   , ease: '<'
  }
  ,{ // text bgs slide out
	 actor: 'textbgtop'
   , delay: 50
   , params: {transform: '...T0,-125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,125'}
  }
  ,{ // letters fade in
  	  'set':'jumble'
  	, delay: 250
  	, params: {opacity: 1}
  	, ms: 1000
  }
  ,{ // other letters drop
  	  'set':'otherLetters'
  	, delay: 1250
  	, stagger: 33
  	, params: {opacity: 0, transform: '...T0,30'}
  	, ms: 100
  	, ease: '<'
  }
  ,{ // 'resource' constricts
  	  'set':'resourceLetters'
  	, delay: 1150
  	, params: {transform: function(i,data) { return '...T-' + i*( Math.round(data.paper.width/34.28) - 11 ) + ',0' }}
  	, ms: 600
  	, ease: '<>'
  }
  ,{ // 'resource' changes colors
  	  'set':'resourceLetters'
  	, delay: 0
  	, params: {fill: function(i,data){ return data.actors['robot'].attr('fill') }}
  	, ms: 125
  	, ease: '<>'
  }
  ,{ // text bgs slide in
	 actor: 'textbgtop'
   , delay: 250
   , params: {transform: '...T0,125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,-125'}
  }
  ,{ // Header2 in
	 actor: 'header2'
   , delay: 50
   , params: {opacity: 1, transform: ''}
   , ms: 500
   , ease: '<'
  }
  ,{ // Header2 out
	 actor: 'header2'
   , delay: 2000
   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
   , ms: 400
   , ease: '<'
  }
  ,{ // text bgs slide out
	 actor: 'textbgtop'
   , delay: 50
   , params: {transform: '...T0,-125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,125'}
  }
  ,{ // 'http' slides over
  	  actor:'httpLetters'
  	, prep: function(i,data){ data.actors['httpLetters'].transform('') } // need to reset this sometimes 
  	, delay: 300
  	, params: { opacity: 1
  	  , transform: function(i,data) { 
  	  	var httpLetters = data.actors['httpLetters']
  	  	  , httpLettersBB = httpLetters.getBBox()
  	  	  , tx = data.sets['resourceLetters'].getBBox().x - httpLettersBB.x - httpLettersBB.width + 1;
  	  	  
  	  	return '...T'+tx+',0'
	  } 
  	}
  	, ms: 750
  	, ease: '<>'
  }
  ,{ // /FIND appears
  	  actor: 'findLetters'
  	, prep: function(i,data) { 
  		var resourceLettersBB = data.sets['resourceLetters'].getBBox()
  		  , tx = resourceLettersBB.x + resourceLettersBB.width -1;
  		
  		data.sets['apiLetters'].transform('...T' + tx + ',0');  		
  		}
	, delay: 1500
	, params: { transform: '...T0,30', opacity: 1}
	, ms: 325
	, ease: '<'
  }
  ,{ // /FIND drops
  	  actor: 'findLetters'
	, delay: 1600
	, params: { transform: '...T0,50', opacity: 0}
	, ms: 325
	, ease: '<'
  }
  ,{ // /Select appears
  	  actor: 'selectLetters'
	, delay: 0
	, params: { transform: '...T0,30', opacity: 1 }
	, ms: 325
	, ease: '<'
  }
  ,{ // /FIND drops
  	  actor: 'selectLetters'
	, delay: 1600
	, params: { transform: '...T0,50', opacity: 0 }
	, ms: 325
	, ease: '<'
  }
  ,{ // /Select appears
  	  actor: 'previewLetters'
	, delay: 0
	, params: { transform: '...T0,30', opacity: 1 }
	, ms: 325
	, ease: '<'
  }
  ,{ // /FIND drops
  	  actor: 'previewLetters'
	, delay: 1600
	, params: { transform: '...T0,50', opacity: 0 }
	, ms: 325
	, ease: '<'
  }
  ,{ // text bgs slide in
	 actor: 'textbgtop'
   , delay: 250
   , params: {transform: '...T0,125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,-125'}
  }
  ,{ // Header3 in
	 actor: 'header3'
   , delay: 50
   , params: {opacity: 1, transform: ''}
   , ms: 500
   , ease: '<'
  }
  ,{ // Header3 out
	 actor: 'header3'
   , delay: 1250
   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
   , ms: 400
   , ease: '<'
  }
  ,{ // text bgs slide out
	 actor: 'textbgtop'
   , delay: 50
   , params: {transform: '...T0,-125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,125'}
  }
  ,{ // Spec letters make room
  	  'set': 'specLetters'
	, delay: 200
	, params: { transform: '...T-250,0' }
	, ms: 500
	, ease: '<>'
  }
  ,{ // Implementation drops
  	  'set': 'implementation'
	, delay: 350
	, params: { transform: '...T0,220' }
	, ms: 600
	, ease: '<>'
  }
  ,{ // Spec shot
  	  'set': 'specLetters'
	, delay: 600
	, params: { 
	     opacity: 0
	   , transform: function(i,data) {
		   var specCenter = data.sets['specLetters'].getCenter();
		   return '...S0.3,0.3,' + specCenter.cx + ',' + specCenter.cy + 'T' + Math.round( data.paper.width/3.4238 ) + ',0'
		 } 
	  }
	, ms: 1200
	, ease: 'cubic-bezier(0.750, -0.140, 0.815, 0.095)'
  }
  ,{ // YOU SHALL NOT FLASH
  	  actor: 'flash'
	, delay: 0
	, params: { opacity: 1, transform: '...S200' }
	, ms: 200
	, ease: '<'
  }
  ,{ // BACK TO THE SHADOWS
  	  actor: 'flash'
	, prep: function(i,data) { data.actors['cabinet'].attr('fill', data.actors['robot'].attr('fill')  ) }
	, delay: 400
	, params: { opacity: 0 }
	, ms: 1500
	, ease: '<'
  }
  ,{ // text bgs slide in
	 actor: 'textbgtop'
   , delay: 250
   , params: {transform: '...T0,125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,-125'}
  }
  ,{ // Header4 in
	 actor: 'header4'
   , delay: 50
   , params: {opacity: 1, transform: ''}
   , ms: 500
   , ease: '<'
  }
  ,{ // Header4 out
	 actor: 'header4'
   , delay: 1250
   , params: {opacity: 0, transform: function(i,d) { return d.actors['header1'].data('transformStart') }}
   , ms: 400
   , ease: '<'
  }
  ,{ // text bgs slide out
	 actor: 'textbgtop'
   , delay: 50
   , params: {transform: '...T0,-125'}
   , ms: 400
   , ease: '<>'
   , withActors: 'textbgbottom'
   , withParams: {transform: '...T0,125'}
  }
  ,{ // Rise of the machines
  	  actor: 'robot'
	, delay: 400
	, params: { transform: '...T0,-50' }
	, ms: 1750
  }
  ,{ // Flash out a bit
  	  actor: 'flash'
	, prep: function(i,data) {
		var flash = data.actors['flash'];
		flash.attr({fill:'#FDFFBF', transform: '...S0.005'})
		flash.transform( '...T0,' + (data.actors['robot'].getBBox().y - flash.getBBox().y ) ) 
	  }
	, delay: 1000
	, params: { opacity: .7, transform: '...S4' }
	, ms: 1050
	, ease: '<>'
  }
  ,{ // Flash back in 
  	  actor: 'flash'
	, delay: 0
	, params: { opacity: .5, transform: '...S0.25' }
	, ms: 1050
	, ease: '<>'
  }
  ,{ // Flash out a bit more
  	  actor: 'flash'
	, delay: 0
	, params: { opacity: .7, transform: '...S8' }
	, ms: 1050
	, ease: '<>'
  }
  ,{ // Flash in one last time
  	  actor: 'flash'
	, delay: 0
	, params: { opacity: .75, transform: '...S0.125' }
	, ms: 1050
	, ease: '<>'
  }
  ,{ // Last flash
  	  actor: 'flash'
	, delay: 0
	, params: { opacity: 1, transform: '...S210', fill: '#FFF' }
	, ms: 300
	, ease: '<'
  }
  ,{ // Last flash
  	  actor: 'flash'
	, prep: function(i,data) { 
		data.sets['implementationWithoutFlash'].attr('opacity',0);
	  }
	, delay: 500
	, params: { opacity: 0,  }
	, ms: 1500
  }
  ,{ // letters fade back in 
      'set': 'otherLetters'
    , prep: function(i,data){ 
    	var jumble = data.sets['jumble']
    	
    	jumble.transform( jumble.data('transformStart') );
    	
    	jumble.transform('...T' + (data.paper.width/2 - jumble.getBBox().width/2 - jumble.getBBox().x) + ',0');
    	
    	}
    , delay: 0
    , params: {opacity: 0.2}
    , ms: 400
  }
  ,{
      'set': 'resourceLetters'
	, params: {opacity: 1}
	, ms: 600
  }
 
  ]
  , teaser: {
		'set': 'jumble'
	  , prep: function(i,data) {
	  		var paper = data.paper
	  			,jumble = data.sets['jumble'];
	  			
	  		jumble.attr({opacity:1, transform: '...T'+ (paper.width - jumble.getBBox().x + 100) + ','+ paper.height })
		}
	  , delay: 100
	  , params: {transform: function(i,data) { return '...T-300,-160' }}
	  , ms: 300
	  , ease: '<>'
	}
}

$('#about-our-software').oslc_animation(paper1opts);

$('#what-oslc-does').oslc_animation(paper2opts);

$('#our-specs').oslc_animation(paper3opts);

// $('body').on('click', function(){
// 	$('#about-our-software').data('oslc_animation').stopAnimation()
// })

//$('#about-our-software, #what-oslc-does, #our-specs').oslc_animation();

})(window, window.jQuery, Raphael);
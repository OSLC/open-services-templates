// http://stackoverflow.com/questions/5827793/settimeout-how-to-do-it?rq=1
window.allAnimTimeouts = [];

function addTimeout(code, time){
	if (typeof window.allAnimTimeouts === 'undefined') window.allAnimTimeouts = [];
	
	window.allAnimTimeouts.push( setTimeout(code, time) );
};

// http://stackoverflow.com/questions/813935/randomizing-elements-in-an-array
// http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
function arrayShuffle(myArray) {
	var i = myArray.length, j, tempi, tempj;
	while (--i)
	{
	  j = Math.floor(Math.random() * (i + 1))
	  tempi = myArray[i];
	  myArray[i] = myArray[j];
	  myArray[j] = tempi;
	}
	
}

var getSetCenter = function(set)
{
	var bb = set.getBBox();
	var cx = bb.x + bb.width/2;
	var cy = bb.y + bb.height/2;
	
	return {'cx' : cx, 'cy' : cy};
}

/* 
 * 
 * PAPER 1: How do we like 'em? INTEGRATED!
 *
 */
var paper1id = 'about-our-software';

var paper1 = Raphael(paper1id, $('#' + paper1id).width(), 250);
$(paper1).data({'name':'Panel 1: Our goals', 'initial':1});


var paper1bg = paper1.ellipse(paper1.width/2, paper1.height/2, paper1.width*3.22, paper1.height*2.72)
		.attr({'fill': 'r#FFF-#DDD', 'stroke-width': 0})

var beams = paper1.set()

	for ( i = 0; i < 18; i++ ) {
		var newbeam = paper1.path('M145,0L145,53L0,0z');
		var color = i % 2 ? 'hsl(30, 100, 50)' : 'hsl(60, 100, 50)';

		newbeam.attr({'fill' : color, 'stroke-width':1, 'stroke' : 'hsl(15,60,50)', 'opacity': 0});
		// rotate i*20 degrees around 0,0 and shove out of the way
		newbeam.transform('r' + i*20 + ',0,0T-150,0');

		beams.push(newbeam);
	}


var puzzleLeft = paper1
	.path("M46.388,49.958V33.891c0-1.789,0.754-3.234,2.542-3.234c0.504,0,1.052,0.307,1.088,0.307h-0.169 c1.104,0.543,2.24,0.878,3.553,0.878c4.596,0,8.276-3.726,8.276-8.319c0-4.592-3.749-8.314-8.341-8.314 c-1.271,0-2.474,0.31-3.556,0.815c0,0-0.291,0.367-0.846,0.367c-1.787,0-2.548-1.451-2.548-3.238V0H0v49.958z")
	.attr({fill: 'hsl(215,50,56)','opacity': 1,'stroke-width': '1','stroke-opacity': '1', 'stroke-color' : '#999'})
	.transform('t40,-80S2')
	.data('id', 'puzzleLeft');

var puzzleRight = paper1
	.path("M34.088,50.002h15.911V0H0v12.472c0-0.635,2.417-0.953,3.994-0.953c6.63,0,11.392,5.392,11.392,12.023 c0,6.63-4.762,12.026-11.392,12.026C2.42,35.569,0,35.249,0,34.613v15.389h13.335z")
	.attr({fill: 'hsl(215,75,80)','opacity': 1,'stroke-width': '1','stroke-opacity': '1', 'stroke-color' : '#999'})
	.transform('t'+ Math.round(paper1.width/5.2) +',285S2')
	.data('id', 'puzzleLeft');

var fullPuzzle = paper1.set().push(puzzleLeft).push(puzzleRight);

var cannonball = paper1.circle(-20, 120, 20).attr({'fill': 'r(.35,.35)#999-#444', 'stroke-width' : 0, 'opacity' : 1, 'fill-opacity' : 1});

var cloud1 = paper1
	.path("M24.384,59.055c0-0.696-0.072-1.374-0.185-2.037 c7.207-2.247,12.527-8.75,13.042-16.565h-0.014c0.029-0.411,0.062-0.821,0.062-1.24c0-0.567-0.033-1.125-0.084-1.681 c-0.012-0.143-0.027-0.288-0.043-0.432c-0.059-0.511-0.133-1.02-0.23-1.519c-0.008-0.04-0.014-0.082-0.021-0.123 c-0.105-0.515-0.24-1.02-0.389-1.52c-0.047-0.163-0.098-0.325-0.15-0.485c-0.129-0.398-0.273-0.792-0.428-1.179 c-0.063-0.156-0.125-0.311-0.191-0.464c-0.17-0.394-0.355-0.775-0.552-1.153c-0.102-0.197-0.208-0.392-0.316-0.585 c-0.151-0.266-0.312-0.525-0.475-0.784c-0.188-0.3-0.385-0.591-0.589-0.878c-0.167-0.231-0.334-0.463-0.511-0.688 c-0.174-0.217-0.352-0.431-0.531-0.642c-0.138-0.159-0.28-0.315-0.424-0.469c-0.345-0.376-0.706-0.734-1.08-1.081 c-0.128-0.117-0.252-0.237-0.383-0.35c-0.232-0.205-0.472-0.399-0.716-0.591c-0.139-0.111-0.279-0.214-0.42-0.319 c-0.214-0.157-0.439-0.298-0.659-0.448c-2.687-1.689-5.858-2.685-9.271-2.69v-2.621c3.357,0,6.517,0.834,9.298,2.291 c0.624-1.638,0.995-3.398,0.995-5.255c0-8.317-6.742-15.06-15.06-15.06c-7.915,0-14.39,6.107-15.001,13.864H0v44.703 c0,6.732,5.459,12.191,12.191,12.191C18.924,71.246,24.384,65.787,24.384,59.055z")
	.attr({"fill-rule": 'evenodd',"clip-rule": 'evenodd',fill: '#DDD','stroke-width': '0','stroke-opacity': '1'});
	
var cloud2 = paper1
	.path("M32.741,15.547c0,2.074-0.393,4.156-1.167,6.188l-0.185,0.483 c0.142,0.105,0.282,0.211,0.405,0.311c0.283,0.222,0.561,0.447,0.81,0.667c0.118,0.102,0.232,0.208,0.346,0.313l0.105,0.098 c0.446,0.413,0.85,0.816,1.216,1.216c0.164,0.175,0.326,0.354,0.501,0.554c0.2,0.235,0.398,0.474,0.601,0.729 c0.199,0.254,0.39,0.516,0.581,0.783c0.234,0.326,0.457,0.659,0.675,1.004c0.184,0.293,0.365,0.586,0.541,0.896 c0.121,0.219,0.242,0.438,0.357,0.662c0.242,0.466,0.449,0.897,0.631,1.317c0.072,0.164,0.139,0.331,0.215,0.525 c0.182,0.446,0.348,0.902,0.49,1.343c0.061,0.188,0.121,0.379,0.174,0.557c0.188,0.633,0.332,1.201,0.451,1.781l0.016,0.1 c0.107,0.542,0.193,1.111,0.264,1.725c0.02,0.166,0.035,0.333,0.051,0.499c0.064,0.721,0.094,1.329,0.094,1.915 c0,0.45-0.029,0.87-0.057,1.24l0.002,0.171C39.332,48.607,34.26,55.656,27,58.771c0.003,0.096,0.004,0.19,0.004,0.283 c0,1.538-0.236,3.021-0.673,4.418c1.016,4.45,4.99,7.773,9.749,7.773c5.529,0,10.01-4.479,10.01-10.009 c0-0.569-0.059-1.128-0.15-1.674c5.916-1.843,10.285-7.181,10.709-13.599h-0.012c0.021-0.336,0.053-0.674,0.053-1.017 c0-0.467-0.031-0.925-0.072-1.381c-0.008-0.119-0.021-0.236-0.033-0.354c-0.049-0.42-0.109-0.836-0.189-1.246 c-0.008-0.033-0.012-0.066-0.018-0.1c-0.086-0.426-0.197-0.84-0.318-1.25c-0.041-0.135-0.082-0.267-0.125-0.398 c-0.105-0.328-0.225-0.65-0.352-0.968c-0.051-0.128-0.104-0.256-0.156-0.381c-0.139-0.323-0.293-0.638-0.453-0.947 c-0.084-0.161-0.172-0.321-0.262-0.48c-0.123-0.217-0.254-0.432-0.389-0.643c-0.154-0.246-0.316-0.485-0.482-0.721 c-0.139-0.19-0.275-0.381-0.42-0.565c-0.143-0.178-0.289-0.354-0.438-0.525c-0.113-0.131-0.229-0.259-0.346-0.387 c-0.285-0.308-0.58-0.604-0.887-0.888c-0.105-0.096-0.207-0.193-0.314-0.287c-0.191-0.167-0.389-0.328-0.588-0.484 c-0.115-0.09-0.23-0.177-0.346-0.263c-0.346-0.255-0.701-0.497-1.066-0.726l0.195-1.254c0.736-1.578,1.17-3.324,1.17-5.183 c0-6.828-5.535-12.363-12.363-12.363c-2.08,0-4.029,0.525-5.745,1.436C32.71,14.908,32.741,15.225,32.741,15.547z")
	.attr({"fill-rule": 'evenodd',"clip-rule": 'evenodd',fill: '#DDD','stroke-width': '0','stroke-opacity': '1'});
			
var clouds = paper1.set().push(cloud1).push(cloud2);

// Set the clouds tiny and off-frame
clouds.attr({'opacity' : 0}).transform('t-60,130s.1,.1,0,0');


// set initial values for everything
paper1.forEach(function(el){
	el.data('transformStart', 	el.matrix.toTransformString() );
	el.data('opacityStart', 	el.attr('opacity') );
	el.data('fillStart', 		el.attr('fill') );
})

function paper1tease(){
	puzzleLeft.transform('...T' + (paper1.width + puzzleLeft.getBBox().width) +',177S1.5');
	
	puzzleRight.transform('...T'+ (puzzleLeft.getBBox().x + puzzleRight.getBBox().width - 23) +',-188S1.5')
	
	fullPuzzle.animate({'transform': '...T-'+ Math.round(paper1.width/2) +',0'},350, '<>')
}

$(paper1).data('tease', paper1tease );

function paper1start(){
	puzzleLeft.animate({'transform': '...T0,177'}, 600, '<>', function(){
		addTimeout(puzzleRightEnter, 1250);
	})
}

$(paper1).data('restart', paper1start);

function puzzleRightEnter() {

	puzzleRight.animate(
	  {'transform': '...T0,-188'}
	  , 600
	  , '<>'
	  , function(){
	  	addTimeout(puzzleRightSlide, 800);
	  }
	);
};

function puzzleRightSlide() {
	var puzzleLeftBox = puzzleLeft.getBBox();
	var puzzleRightBox = puzzleRight.getBBox();
	var tx = Math.round( puzzleRightBox.x - (puzzleLeftBox.x + puzzleLeftBox.width) + 23 ); // whatever the distance between the BBoxes and 23 more of overlap
	
	puzzleRight.animate(
	  {'transform': '...T-'+ tx +',0'}
	  , 500
	  , '<>'
	  , function(){
	  	addTimeout(puzzleStandUp, 1750);
	  }
	)
};

function puzzleStandUp() {
	// calculate the center of the group
	var puzzleCenter = getSetCenter(fullPuzzle);
				
	fullPuzzle.animate( {'transform': '...R90,' + puzzleCenter.cx + ',' + puzzleCenter.cy + 'T' + Math.round(paper1.width/3) + ',0'}, 800, '<>', function(){
		addTimeout(fireCannon, 1000)
	});
}

function fireCannon() {
	
	var cloudsCenter = getSetCenter(clouds);
	var cloudsTime = 800;
	var puzzleEdge = fullPuzzle.getBBox().x;
		 
	clouds
		.animate({'transform': '...T30,0s30,30,0,45'},cloudsTime, 'linear')
	 	.animate({'opacity' : 1}, cloudsTime * 11/16, 'linear', function() {
		  clouds.animate({'opacity' : 0}, cloudsTime * 5/16)
		  cannonball.animate({'transform': 't' + puzzleEdge + ',0R1080'}, 400, 'linear', cannonPlop);
		});				
}

function cannonPlop() {
	
	// squash against the wall
	cannonball.animate({'transform': '...S.75,1.3333,' + fullPuzzle.getBBox().x + ',' + getSetCenter(fullPuzzle).cy },50, '>', function(){
		addTimeout( dropCannonball, 1250)
	});
				
}

function dropCannonball(){
	cannonball.animate({'transform': '...S1.33333,0.75T-50, 175', opacity : 0}, '250', '<', function(){
		addTimeout(puzzlePrepareInspection,1000)
	});
}

function puzzlePrepareInspection() {
	
	var puzzleCenter = getSetCenter(fullPuzzle);
	
	fullPuzzle.animate({'transform': '...R-90,' + puzzleCenter.cx + ',' + puzzleCenter.cy + 'T'+ Math.round(paper1.width/3) +',-20'}, 1000, '<>', function(){
		addTimeout(sweetSunshine, 500);
	});		
}

function sweetSunshine() {
	
	var puzzleLeftBox = puzzleLeft.getBBox();
	var puzzleRightBox = puzzleRight.getBBox();
	var fullPuzzleCenter = getSetCenter(fullPuzzle);
	var beamsBox = beams.getBBox(); // I really only need one. they're identical and in the same spot
	
	// Place the beam sets
	var beams1tx = beamsBox.width/2 + fullPuzzleCenter.cx;
	var beamsty =  puzzleRightBox.y + puzzleRightBox.height/2;
	
	beams.transform('...T'+beams1tx+','+beamsty);
	
	var beamsCenter = getSetCenter(beams);
	var shineTime = 4000;
	
	beams.animate({'transform': '...R-20,' + beamsCenter.cx + ',' + beamsCenter.cy}, shineTime*4/5, 'linear', function(){
		beams.animate({'transform': '...t60,0'}, shineTime/5, '<');
	}).animate({'opacity':.125}, shineTime/8, 'linear', function(){
		
		addTimeout(function(){ 
			beams.animate({'opacity': 0}, shineTime/8, 'linear', function(){
				addTimeout(paper1close, 1000);
			})					
		}, shineTime*3/4)
		
	});

}


function paper1close() {

	if (window._gaq) { // If Analytics is around
		_gaq.push(['_trackEvent', 'About page interaction', 'Finished animation', $(paper1).data('name'), 0]);
	}
	
	var fullPuzzleBox = fullPuzzle.getBBox();
	var puzzleCenter = getSetCenter(fullPuzzle);
	var tx = paper1.width/2 - fullPuzzleBox.width/2;
	var ty = paper1.height/2 - fullPuzzleBox.height/2;
	var currentPuzzleMatrix = puzzleLeft.matrix.split();
	var dx = tx - currentPuzzleMatrix.dx;
	var dy = ty - currentPuzzleMatrix.dy;
	
	fullPuzzle.animate({'transform': '...R-360,' + puzzleCenter.cx + ',' + puzzleCenter.cy + 'T' + dx + ',' + dy},800, '<>', function(){
		var puzzleCenter = getSetCenter(fullPuzzle);
		
		fullPuzzle.animate({'transform' : '...S1.6,1.6,' + puzzleCenter.cx + ',' + puzzleCenter.cy},500, '<>', function(){
			addTimeout(function(){
				prepareRestart(paper1, paper1start);
			},1000)
		})
		
	});
	
	
}



/* 
 * 
 * PAPER 2: WHAT WE DO
 *
 */

var paper2id = 'what-oslc-does';

var paper2 = Raphael(paper2id, $('#'+paper2id).width() ,250);
$(paper2).data({'name': 'Panel 2: Our process', 'initial': 1});

var paper2bg = paper2.ellipse(paper1.width/2, paper1.height/2, paper1.width*3.22, paper1.height*2.72)
	.attr({'fill': 'r#FFF-#DDD', 'stroke-width': 0});

// People set
var people = paper2.set();

// Biggest to smallest
var peopleTransformStart = ['t30,180S1.5'
							,'t250,175S1.1667'
							,'t110,150'
							,'t170,130S0.6667'];
var peopleSlideIn = ['...T10,0'
					,'...T-10,0'
					,'...T0,5'
					,'...T0,-5'];
var peopleColors = [ 'hsl(215,10,60)'
		,'hsl(215,10,40)'
		,'hsl(215,10,35)'
		,'hsl(215,10,70)'
	];

// Build them and add to set
for ( i = 0; i < 4; i++ ) {
	people.push(
		paper2.path("M24.997,23.264c6.322,0,11.437-5.115,11.437-11.426c0-6.309-5.115-11.427-11.437-11.427 c-6.302,0-11.43,5.118-11.43,11.427C13.566,18.149,18.695,23.264,24.997,23.264z M25.003,28.3c-12.97,0-23.584,9.375-24.592,21.289 h49.178C48.587,37.675,37.977,28.3,25.003,28.3z")
		.attr({fill: peopleColors[i],'stroke-width': '.75','stroke-opacity': '1', stroke: '#333', opacity: 0})
		.transform(peopleTransformStart[i])
	);
}

// Bubbles!
var bubbles = paper2.set();

	for ( i = 0; i < 7; i++ ) {
		var circle = paper2.circle(0,0,8);
		circle.attr({'opacity': 0, 'fill': '#FFF'});
		bubbles.push(circle);
	}

// Big thought bubble
var thought = paper2.path("M14.458,8.041c-1.064-1.243-2.451-1.704-3.785-1.704C4.779,6.337,0,11.116,0,17.01 c0,5.895,4.779,10.674,10.673,10.674h30.24c4.913,0,8.895-3.982,8.895-8.895c0-4.913-3.981-8.894-8.895-8.894 c-0.702,0-1.379,0.101-2.036,0.255C37.77,4.923,33.131,1,27.571,1C14.78,1,14.458,8.041,14.458,8.041z")
	.attr({'stroke-width': 2, 'fill': 'white', 'stroke' : '#888', opacity : 0})
	.transform('s3,3,0,0')

// Specification graphic
var spec = paper2.path("M35.673,0.097H17.885v42.691h32.018V14.327h-14.23V0.097z M44.566,37.451H23.222v-1.778 h21.345V37.451z M44.566,32.115H23.222v-1.779h21.345V32.115z M44.566,26.779H23.222V25h21.345V26.779z M44.566,19.664v1.779 H23.222v-1.779H44.566z M37.451,0.097v12.452h12.452L37.451,0.097z M16.106,39.23H5.434v-1.779h10.673v-3.557H5.434v-1.779h10.673 v-3.558H5.434v-1.778h10.673v-3.558H5.434v-1.779h10.673V7.212H0.097v42.691h32.018v-5.337H16.106V39.23z")
	.attr({'fill': 'hsl(215,55,42)','stroke-width': .2, 'stroke': '#111', 'stroke-opacity': '1', opacity: 0})

var specAndThought = paper2.set([spec, thought]);

var clonedSpecs = paper2.set();

	for (i = 0; i < 4; i++) {
		var clonedSpec = spec.clone();
		clonedSpecs.push(clonedSpec);
	}

var monitor1a = paper2.path("M28.136,2H3.868C2.837,2,2.001,2.842,2.001,3.881V21.12 c0,1.039,0.836,1.88,1.867,1.88h24.268c1.029,0,1.865-0.841,1.865-1.88V3.881C30.001,2.842,29.165,2,28.136,2 M28.001,17h-24V4h24 V17z");

var monitor1b = paper2.path("M19.001,24.001 13.001,24.001 13.001,28.001 10.001,28.001 10.001,30.001 13.001,30.001 19.001,30.001 22.001,30.001 22.001,28.001 19.001,28.001 z");

var monitor1 = paper2.set().push(monitor1a).push(monitor1b);

monitor1.attr({'fill': '#CCC', 'stroke-width' : .5, 'stroke': '#666', 'opacity' : 0})
	.transform('S4,4,0,0T'+ (paper2.width - 385) +',120')

var laptop1 = paper2.path("M29.969,27.436L27.585,19H23v2H9v-2H4.513l-2.386,8.436 C1.635,28.903,2.666,30,3.762,30h24.572C29.432,30,30.163,28.139,29.969,27.436 M27,3.648C27,2.743,26.561,2,25.699,2H6.398 C5.537,2,5,2.743,5,3.648V18h22V3.648z M24,15H8V5h16V15z")
	.attr({'fill': '#777', 'stroke-width' : .25, 'stroke': '#111', 'opacity' : 0})
	.transform('S3,3,0,0T'+ (paper2.width - 225) +',100');

var monitor2 = monitor1.clone();

monitor2.attr({'fill': '#BBB', 'stroke-width' : .3, 'stroke': '#555'})
	.transform('S2,2,0,0T'+( paper2.width - 112)+',65')

var laptop2 = laptop1.clone().attr('fill','#666').transform('S1.5,1.5,0,0T'+(paper2.width - 35)+',10');

var screens = paper2.set([monitor1, laptop1, monitor2, laptop2]);


// set initial values for everything
paper2.forEach(function(el){
	el.data('transformStart', 	el.matrix.toTransformString() );
	el.data('opacityStart', 	el.attr('opacity') );
	el.data('fillStart', 		el.attr('fill') );
})

function paper2tease() {
	people.transform('S3,3,0,0T'+(paper2.width)+',120').attr('opacity',1)
	
	people.forEach(function(el,i){
		addTimeout(function(){
			el.animate( {'transform':'...T-'+(250-i*50)+',0' },100,'<>')
		}, i*125)
	});
}

$(paper2).data('tease', paper2tease );

function paper2start() {
	people.forEach(function(person,i){
		// Stagger their entry
		addTimeout( function(){
			person.animate({'transform': peopleSlideIn[i],'opacity':1},1000,'<>', function(){
				if (i === people.length-1)
				{
					addTimeout(peopleSlide, 1000)
				}
			})
		},i*500)
	});
}

$(paper2).data('restart', paper2start);
		
function peopleSlide() {
	
	var tx = Math.round( paper2.width/31.58 );
	
	// Crude approximation of gravity with linear horizontal motion
	people.animate({
		 '10%' : {'transform': '...t0,-18T'+tx+',0','easing': 'linear'}
		,'20%' : {'transform': '...t0,-14T'+tx+',0','easing': 'linear'}
		,'30%' : {'transform': '...t0,-10T'+tx+',0','easing': 'linear'}
		,'40%' : {'transform': '...t0,-6T'+tx+',0','easing': 'linear'}
		,'50%' : {'transform': '...t0,-2T'+tx+',0','easing': 'linear'}
		,'60%' : {'transform': '...t0,2T'+tx+',0','easing': 'linear'}
		,'70%' : {'transform': '...t0,6T'+tx+',0','easing': 'linear'}
		,'80%' : {'transform': '...t0,10T'+tx+',0','easing': 'linear'}
		,'90%' : {'transform': '...t0,14T'+tx+',0','easing': 'linear'}
		,'100%' : {'transform': '...t0,18T'+tx+',0','easing': 'linear'}
		}, 750)

	addTimeout(growingThoughts,2000)
}
		

function growingThoughts() {
	
	// calculate location based on location of people
	var bubbleTransformPrep = [
		'S.5T' + (getSetCenter(people[0]).cx + 10) + ',' + (people[0].getBBox().y - 15)
		,'S.6T' + (getSetCenter(people[1]).cx - 10) + ',' + (people[1].getBBox().y - 10)
		,'S.5T' + (getSetCenter(people[2]).cx + 2) + ',' + (people[2].getBBox().y - 10)
		,'S.65T' + (getSetCenter(people[3]).cx - 5) + ',' + (people[3].getBBox().y - 5)
		,'S.8T' + (getSetCenter(people[0]).cx + 25) + ',' + (people[0].getBBox().y - 45)
		,'S.9T' + (getSetCenter(people[1]).cx - 35) + ',' + (people[1].getBBox().y - 50)
		,'S.8T' + (getSetCenter(people[2]).cx + 12) + ',' + (people[2].getBBox().y - 40)
	];
	
	bubbles.forEach(function(shape,i){
		shape.transform(bubbleTransformPrep[i]);
		
		addTimeout(function(){
			shape.animate({'opacity': 1, 'transform': '...T0,-10'}, 350,'ease', function(){
				if (i === bubbles.length-1)
				{
					addTimeout(sharedThoughtAppearance,100);
				}
			})
		}, i*125)
	});	
	
}
				
function sharedThoughtAppearance() {
	// calculate where the bubble should be (centered over people)
	thought.transform('...T' + (getSetCenter(people).cx - thought.getBBox().width/2 ) + ',15');
	
	thought.animate({'transform': '...T0,-10', opacity: 1}, 300,'ease', function(){
		addTimeout(specAppearance,250)
	})
	
}

function specAppearance() {
	var thoughCenter = getSetCenter(thought);
	var specBB = spec.getBBox();

	// Set spec location
	spec.transform('T' + ( thoughCenter.cx - specBB.width/2 ) + ',' + (thoughCenter.cy - specBB.height/2) );
	
	spec.animate({'opacity': 1}, 200, 'ease', function(){
		addTimeout(celebrateGoodTimes, 500)
	})
}

var littleDance = {
  '12.5%': {transform: '...T0,-5', easing: '>'}
  ,'25%': {transform: '...T0,5',easing: '<'}
  ,'37.5%': {transform: '...T0,-5',easing: '>'}
  ,'50%': {transform: '...T0,5', easing:'<'}
  ,'62.5%': {transform: '...T0,-5', easing:'>'}
  ,'75%': {transform: '...T0,5', easing:'<'}
  ,'87.5%': {transform: '...T0,-5', easing:'>'}
  ,'100%': {transform: '...T0,5', easing:'<'}
}

function celebrateGoodTimes(){
	
	// do a little dance, with some staggering
	people.forEach(function(person, i){
		addTimeout(function(){
			person.animate(littleDance
			, 1000)
		},50*i);
		
	});
	
	// can't seem to set a timeout with a keyframe animation
	// so wait a while, then move on
	addTimeout(function(){
		dropPeople();
	},2250)
}

var dropAnimation = {transform: '...T0,100', opacity: 0}

function dropPeople(){
	
	people.forEach(function(person,i){
		addTimeout(function(){
			person.animate(dropAnimation, 250,'<', function(){
				if (i+1 === people.length)
				{
					addTimeout(popBubbles, 250);
				}
			})
		},75*i)
	})
}

function popBubbles() {
	bubbles.forEach(function(bubble,i){
		addTimeout(function(){
			bubble.animate({transform:'...S2', opacity: 0}, 133,'>', function(){
				if (i+1 === bubbles.length)
				{
					addTimeout( prepareSpecDist , 500 )
				}
			})
		},50*i);
	});
}

function prepareSpecDist() {

	specAndThought.animate( {transform: '...T'+Math.round(paper2.width/6)+',0'}, 750, '<>')
	
	screens.forEach(function(screen,i){
		addTimeout(function(){
			screen.animate({transform: '...T-15,0', opacity: 1}, 250, '<>', function(){
				if (i+1 === screens.length)
				{
					addTimeout(distributeSpec,500)
				}
			})
		}, i*100 + 500)
	});
}

var clonedSpecsTransforms = [
	 '...S.8'
	,'...S.45'
	,'...S.4'
	,'...S.22'
];

var clonedSpecTy = [
	22
   ,16
   ,10
   ,8
]

function distributeSpec() {
	
	// Set all cloned specs to the same current position as the new one.
	clonedSpecs.transform( spec.matrix.toTransformString() );
	
	screens.forEach(function(screen,i){
		
		// apply appropriate scaling to the cloned spec
		clonedSpecs[i].transform(clonedSpecsTransforms[i])
		
		// Specs shrink from the center point, so you can use that center point to calculate distance to travel
		var clonedSpecCenter = getSetCenter(clonedSpecs[i]);
		var screenCenter = getSetCenter(screen);
		var tx = Math.floor(screenCenter.cx - clonedSpecCenter.cx);
		var ty = Math.floor(screenCenter.cy - clonedSpecCenter.cy - clonedSpecTy[i]);
		
		addTimeout(function(){
			clonedSpecs[i].animate({transform: '...T' + tx + ',' + ty, opacity: 1}, 400, '>', function(){
				if (i+1 === screens.length) addTimeout(screensDance, 750);
			})
		}, 500 + i*250 )
				
	});
}

function screensDance() {
	
	screens.forEach(function(screen, i){
		addTimeout(function(){
			var currentAnim = screen.animate(littleDance, 1000)
			clonedSpecs[i].animateWith(screen, currentAnim, littleDance, 1000);
			
		},50*i)
	});
	
	addTimeout(clearScreens,2000);
}

function clearScreens() {
	
	screens.forEach(function(screen,i){
		
		addTimeout(function(){
			var currentAnim = screen.animate(dropAnimation, 250, '<', function(){
				if (i+1 === screens.length) addTimeout(finalSpec, 1000)
			});
			clonedSpecs[i].animateWith(screen, currentAnim, dropAnimation, 250, '<')
		},i*100)
		
	});
}

function finalSpec() {

	if (window._gaq) { // If Analytics is around
		_gaq.push(['_trackEvent', 'About page interaction', 'Finished animation', $(paper2).data('name'), 0]);
	}
		
	var specBox = specAndThought.getBBox();
	var specCenter = getSetCenter(specAndThought);
	var tx = paper2.width/2 - specBox.width/2;
	var ty = paper2.height/2 - specBox.height/2;
	var currentSpecMatrix = specAndThought[1].matrix.split();
	var dx = tx - currentSpecMatrix.dx;
	var dy = ty - currentSpecMatrix.dy;
	
	specAndThought.animate({transform: '...R-360,' + specCenter.cx + ',' + specCenter.cy + 'T' + dx + ',' + dy}, 750, '<>', function(){
		// reset to new position
		specCenter = getSetCenter(specAndThought);
		
		specAndThought.animate({transform: '...S1.8,1.8,' + specCenter.cx + ',' + specCenter.cy}, 500, function(){
			addTimeout( function(){
				prepareRestart(paper2, paper2start);
			},2000)
		});
	})
	
}



/* 
 * 
 * PAPER 3: ABOUT OUR SPECS
 *
 */
var paper3id = 'our-specs'; 

var paper3 = Raphael(paper3id, $('#'+paper3id).width() ,250);
$(paper3).data({'name':'Panel 3: Our specifications', 'initial':1});

var paper3bg = paper3.ellipse(paper1.width/2, paper1.height/2, paper1.width*3.22, paper1.height*2.72)
	.attr({'fill': 'r#FFF-#DDD', 'stroke-width': 0})

var textAttrs = {'font-family': 'monospace', 'font-size': '16px', 'font-weight': 800, 'fill': '#666', 'opacity': 0, 'transform': ''};

var resourceJumbleLetters = [
   ['Z', 'A', 'Y', 'B', 'X', 'C', 'W', 'D'] // 0-7
 , ['E', 'L', 'Y', 'F', 'E', 'D', 'Q', 'S'] // 8-15
 , ['R', 'E', 'S', 'O', 'U', 'R', 'C', 'E'] // 16-23
 , ['M', 'H', 'E', 'R', 'I', 'N', 'T', 'P'] // 24-31
 , ['S', 'A', 'T', 'S', 'U', 'C', 'E', 'T'] // 32-39
 ];
		
var jumble = paper3.set();
var otherLetters = paper3.set();
var resourceLetters = paper3.set();

var letterSpacing = Math.round(paper3.width/34.28);
var letterContractTx = letterSpacing-11;

for ( i = 0; i < resourceJumbleLetters.length; i++ ) {
   
   for ( x = 0; x < resourceJumbleLetters[i].length; x++ ) {
	   var letter = paper3
		   .text( 25 + letterSpacing*x, 60+30*i, resourceJumbleLetters[i][x].toLowerCase() )
		   .attr(textAttrs);
		   
	   jumble.push(letter);
	   
	   // add all the non-RESOURCE letters to another array
	   if (i !== 2) { 
		   otherLetters.push(letter);
	   } else {
		   resourceLetters.push(letter);
	   }
		   
   }
}

// Re-order the otherLetters array randomly
arrayShuffle(otherLetters);

var httpLetters = paper3.text(50, 120, 'http://application/')
	   .attr(textAttrs)
	   .attr('fill', '#999');

var apiFill = httpLetters.attr('fill');

var findLetters = paper3.text(0,90,'/find')
	   .attr(textAttrs)
	   .attr('fill', apiFill);

var selectLetters = paper3.text(0,90,'/select')
	   .attr(textAttrs)
	   .attr('fill', apiFill);

var createLetters = paper3.text(0,90,'/create')
	   .attr(textAttrs)
	   .attr('fill', apiFill);
	   
var apiLetters = paper3.set(findLetters, selectLetters, createLetters);

var specLetters = paper3.set(httpLetters, resourceLetters)
 

var cabinet = paper3.path("M46.208,0.237H3.773L0.237,5.543h49.525L46.208,0.237z M7.312,42.688h35.375v-8.844 H7.312V42.688z M17.925,37.382h14.15v1.769h-14.15V37.382z M7.312,21.462h35.375v-8.844H7.312V21.462z M17.925,16.156h14.15v1.769 h-14.15V16.156z M0.237,49.764h49.525V7.312H0.237V49.764z M5.544,10.85h38.912v33.607H5.544V10.85z M7.312,32.075h35.375v-8.844 H7.312V32.075z M17.925,26.769h14.15v1.769h-14.15V26.769z")
		.attr({fill: '#999','stroke-width': '0','stroke-opacity': '1', opacity: 1})
		.transform('S2,2,0,0T' + paper3.width/2 + ',-150');
	
cabinetBB = cabinet.getBBox();
var cabinetCenter = getSetCenter(cabinet);

// flash, too
var flash = paper3.circle( cabinetCenter.cx, cabinetCenter.cy, 5 )
		.attr({'stroke-width': 0, 'fill': '#FFF', opacity: 0})

var cabinetBG = paper3.rect( cabinetBB.x, cabinetBB.y+6, cabinetBB.width, cabinetBB.height-6 )
		.attr({'fill': '#FFF', 'stroke-width': 0, 'opacity': 1})
		
var robot = paper3.path("M44.512,26.972c0-8.786-8.385-17.706-18.625-18.541V5.326 c1.032-0.367,1.773-1.341,1.773-2.498c0-1.469-1.192-2.661-2.662-2.661c-1.469,0-2.661,1.192-2.661,2.661 c0,1.157,0.743,2.132,1.776,2.498v3.105C13.873,9.266,5.489,18.186,5.489,26.972v6.897h39.023V26.972z M17.414,28.127 c-2.289,0-4.14-1.854-4.14-4.139c0-2.287,1.852-4.14,4.14-4.14c2.283,0,4.138,1.853,4.138,4.14 C21.552,26.273,19.696,28.127,17.414,28.127z M32.587,28.127c-2.287,0-4.137-1.854-4.137-4.139c0-2.287,1.85-4.14,4.137-4.14 c2.286,0,4.14,1.853,4.14,4.14C36.727,26.273,34.873,28.127,32.587,28.127z M0.167,35.643v14.19h49.666v-14.19H0.167z")
		.attr({'fill': 'hsl(215,50,56)', 'stroke-width': 0});
	
	robot.transform('S1.5,1.5,0,0')
	robot.transform('...T' + (cabinetCenter.cx - robot.getBBox().width/2) +',' + cabinetBB.y );

var implementation = paper3.set(robot, cabinetBG, cabinet, flash);
var implementationNoFlash = paper3.set(robot, cabinetBG, cabinet);

// stacks toFront in the order elements were added to the set :-)
implementation.toFront();

// set initial values for everything
paper3.forEach(function(el){
	el.data('transformStart', 	el.matrix.toTransformString() );
	el.data('opacityStart', 	el.attr('opacity') );
	el.data('fillStart', 		el.attr('fill') );
})

function paper3tease(){
	jumble.attr({'opacity':1,'transform':'...T'+paper3.width+','+paper3.height})
	
	jumble.animate({'transform':'...T-'+ jumble.getBBox().width +',-160'}, 200,'<>');
}

$(paper3).data('tease', paper3tease );

function paper3start() {
   jumble.animate({opacity: 1}, 1000, 'ease', function(){
	   addTimeout(dropLetters, 1250)
   });
}

$(paper3).data('restart', paper3start);

var letterAnim = Raphael.animation({transform: '...T0,30', opacity: 0}, 100, '<')
var letterAnimCallback = Raphael.animation({transform: '...T0,30', opacity: 0}, 100, '<', function(){
   addTimeout( colorResources, 1250 )
   });

function dropLetters() {

   for ( i = 0; i < otherLetters.length; i++ ) {

	   otherLetters[i].animate( i+1 === otherLetters.length ? letterAnimCallback.delay(i*33) : letterAnim.delay(i*33) );	
   }
}

function colorResources() {
	
	resourceLetters.animate({ 'opacity' : 0 }, 250, '<>', function(){
		resourceLetters.attr('fill', robot.attr('fill'))
		
		resourceLetters.animate({'opacity': 1}, 250, '<>', function(){
			addTimeout(contractResources,500)
		});
	})
	
}

function contractResources(){
   
   resourceLetters.forEach(function(letter, i){
	   letter.animate({transform: '...T-' + (i*letterContractTx) + ',0'}, 600, '<>', function(){
		   if (i+1 === resourceLetters.length) {
			   addTimeout(slideResources, 1250)
		   }
	   })
   });
   
}

function slideResources(){
   resourceLetters.animate({transform: '...T'+Math.round(paper3.width/3.87)+',0'}, 750, '<>', function(){
	   addTimeout( fadeInUrl, 250 )
   })
}

function fadeInUrl(){
   
   httpLetters.transform('T0,0');
   
   // calculate location of resources and distance to move
   var resourceLettersBB = resourceLetters.getBBox();
   var httpLettersBB = httpLetters.getBBox();
   var tx = resourceLettersBB.x - httpLettersBB.width - httpLettersBB.x + 1;
   
   httpLetters.animate({transform: '...T' + tx + ',0', opacity: 1}, 750, '<>', function(){
	   addTimeout(cycleApis, 1500)
   })
}

function cycleApis(){
   
   var resourceLettersBB = resourceLetters.getBBox();
   var cycleTime = 2250;
   
   // place at the end of resources chunk
   apiLetters.forEach(function(chunk,i){
		
	chunk.transform('T' + (resourceLettersBB.x + resourceLettersBB.width + (chunk.getBBox().width/2) - 1) + ',0');
	
	addTimeout(function(){
	   chunk.animate({
		 '15%' : {transform: '...T0,30', opacity: 1, easing: '<'}
		,'85%' : {}
		,'100%': {transform: '...T0,35', opacity: 0, easing: '<'}
		}, cycleTime)
		} ,i*cycleTime);
   })
   
   addTimeout( enterImp ,cycleTime*apiLetters.length + 1250 );
}


function enterImp() {

	implementation.animate({transform: '...T0,225'}, 750, '<>', function() {
		addTimeout( ingestSpec,500);
	});
	
}

function ingestSpec() {
	
	var specLettersCenter = getSetCenter(specLetters);
	
	specLetters.animate({'transform': '...S.3,.3,' + specLettersCenter.cx + ',' + specLettersCenter.cy + 'T'+Math.round(paper3.width/3.428)+',0', opacity: 0 }, 1000, 'cubic-bezier(0.750, -0.140, 0.815, 0.095)', impFlash)
	
}

function impFlash(){
	flash.animate( {opacity: 1, 'transform': '...S200'}, 200, '<', function(){
		addTimeout( fadeOutFlash,500)
	})
	
}

function fadeOutFlash(){
	// match cabinet and robot
	cabinet.attr('fill', robot.attr('fill'));
	
	flash.animate({opacity: 0}, 2000, 'ease', function(){
		addTimeout(rollImpOver,1000)
	});
	
}

function rollImpOver() {
	var cabinetCenter = getSetCenter(cabinet);

	implementation.animate({'transform': '...T'+ Math.round(paper3.width/4) +',0R720'}, 1000, '<>', function(){
		addTimeout(riseUpRobot, 1250);
	});
}

function riseUpRobot() {		
	robot.animate({transform: '...T0,-50'},1750,'ease', function(){
		addTimeout(finalFlash, 1000);
	});
}

function finalFlash(){
	
	flash.attr('fill', '#FDFFBF');
	flash.transform('...S0.005'); // shrink the flash to a reasonable size
	
	var robotBB = robot.getBBox();
	var flashBB = flash.getBBox();
	
	// place it at the top of the robot
	flash.transform('...T0,' + (robotBB.y - flashBB.y) );
	
	flash.animate({
	    '24%' : {'transform': '...S4', opacity: .7, easing: '<>'}
	  , '47%' : {'transform': '...S0.25', opacity: .5, easing: '<>'}
	  , '71%' : {'transform' : '...S8', opacity: .7, easing: '<>'}
	  , '95%' : {'transform' : '...S0.125', opacity: .5, easing: '<>'}
	  , '100%': {'transform' : '...S210', 'fill':'#FFF', opacity: 1, easing: '<'}
	}, 4500)
	
	addTimeout(finalPaper3, 5000)
	
}

function finalPaper3() {

	if (window._gaq) { // If Analytics is around
		_gaq.push(['_trackEvent', 'About page interaction', 'Finished animation', $(paper3).data('name'), 0]);
	}
	
	implementationNoFlash.attr('opacity',0);
	
	// reset to initial position/size
	otherLetters.transform( otherLetters.data('transformStart') )
	resourceLetters.transform( otherLetters.data('transformStart') )
	
	var resourceLettersBB = resourceLetters.getBBox()
	var tx = paper3.width/2 - resourceLettersBB.width/2 - resourceLettersBB.x
	
	resourceLetters.transform('...T' + tx + ',0');
	otherLetters.transform('...T' + tx + ',0')
	
	flash.animate({opacity:0}, 2000, 'ease', function(){
		otherLetters.animate({opacity: .15}, 400,'ease', function(){
			resourceLetters.animate({opacity: 1}, 600,'ease', function(){
				addTimeout(function(){
					prepareRestart(paper3, paper3start)
				},2000)
			})
		})
	})			

}

function prepareRestart(paper) {

	var initial = $(paper).data('initial');
	
	$(paper).data('watchingForRestart', true);
		
	paper.setStart();
	
		var restartBG = paper.rect(-5,-5, paper.width+10, paper.height+10)
			.attr({'stroke-width':0, fill:'#000', opacity: 0, 'title': 'Click to ' + (initial ? 'start' : 'start again')});
		
		var iconPath ='';
			
		if (initial) { // Play icon
			iconPath = "M16.001,2c-7.732,0-14,6.268-14,14c0,7.731,6.268,14,14,14 c7.732,0,14-6.269,14-14C30.001,8.269,23.733,2,16.001,2 M13.001,22.998v-14l9.334,7L13.001,22.998z";
		} else { // Restart icon
			iconPath = "M25.882,6.116C23.351,3.577,19.856,2,15.987,2C8.263,2,2.001,8.268,2.001,16 s6.266,14.001,13.988,14.001c5.723,0,10.641-3.44,12.809-8.364l-3.816-1.638c-1.538,3.442-4.984,5.853-8.991,5.853 c-5.427,0-9.843-4.42-9.843-9.852c0-5.432,4.416-9.851,9.843-9.851c2.719,0,5.18,1.022,6.963,2.814l-4.145,4.054h11.176V2 L25.882,6.116z";
		}
		
		var restartIcon = paper.path(iconPath)
			.attr({'stroke-width':.25, 'stroke': '#333', fill: '#FFF', transform: 'S5,5,0,0', opacity : .6, 'title' : 'Click to watch animation' + (initial ? '' : ' again')});
	
	var restartSet = paper.setFinish();
	
	var restartIconBB = restartIcon.getBBox();
	var tx = 0 - restartIconBB.width - 100;
	var ty = paper.height/2 - restartIconBB.height/2 - restartIconBB.y;
	
	restartIcon.transform('...T' + tx + ',' + ty)
	
	restartSet.attr('cursor', 'pointer');
			
	restartBG.animate({'opacity':0.1}, 200, '<', function(){
		restartIcon.animate({'transform': '...T300,0'}, '250', '>', function(){
			
			if (initial){
				$(paper).data('tease')();
			}
			
		})
	});
	
	restartSet.hover(function(e){
		restartIcon.animate({'opacity': 1}, 250, 'linear')
	},
	function(){
		restartIcon.animate({'opacity': .6}, 250, 'linear')
	});
	
	restartSet.click(function(e){
		
		$(paper).data('watchingForRestart', 0);
		
		if (initial) {
			$(paper).data('initial',0)
		}

		if (window._gaq) { // If Analytics is around
			_gaq.push(['_trackEvent', 'About page interaction', 'Started animation', $(paper).data('name'), 0]);
		}
				
		restartIcon.animate({'transform': '...R360'}, 400, '<>', function(){
			
			restartIcon.animate({'transform':'...S1.33', opacity: 0},250, '<')
			restartBG.animate({'opacity': 0}, 500, '<', function(){
				
				restartSet.remove();

				restartPaper(paper);
				
			})
			
		});
		
	});
	
}

function resetPaper(paper) {
	
	if (typeof paper !== "undefined"){
		paper.forEach(function(el){
			el.attr({
			   transform: el.data('transformStart')
			 , opacity: el.data('opacityStart')
			 , fill: el.data('fillStart') });
		});
	
	}	

}

function restartPaper(paper, restart){

	resetPaper(paper);
	
	if ( $(paper).data('restart') ){
		$(paper).data('restart')();	
	}
	
	
}

function stopAnimation(paper){
	// Pause all animation
	paper.forEach(function(el,i){
		el.pause();
	})
	
	// clear all timeouts
	if (window.allAnimTimeouts.length > 0){
		for (key in allAnimTimeouts) {
			clearTimeout(allAnimTimeouts[key]);
		}	
	}
	
	// clear the array so it doesn't get unwieldy
	allAnimTimeouts.length = 0;
}
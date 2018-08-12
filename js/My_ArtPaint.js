/**
 * My_ArtPaint
 * Copyright (c) 2018 Elisa Theng
 * @author Elisa Theng
 * @version 1.0
 */

 var My_ArtPaint = {
	
	that : null,

	_init : function(settings) {
		My_ArtPaint.vars = {
			$container : $("#container-canvas"),
			$canvas : $('#canvas'),
			context	: $('#canvas')[0].getContext('2d'),
			colors : {
				"stroke" : {
					"$element" : $("#colorStrokePicked"),
					"value"	: null
				},
				"fill" : {
					"$element" : $("#colorFillPicked"),
					"value"	: null
				}
			},
			thickness : {
				"$element" : $("#thickness"),
				"$select" : $("#thickness-select"),
				"value"	: null
			},
			tools : {
				"pencil" : false,
				"rubber" : false,
				"line" : false,
				"rectangle" : false,
				"circle" : false
			},
			points : [],
			startPoint : { x:0, y:0 }
		};

		// allow overriding the default elements
		$.extend(My_ArtPaint.vars, settings);

		that = My_ArtPaint.vars;
		My_ArtPaint._run();
	},

	_run : function() {
		My_ArtPaint.setCanvas();
	},

	setCanvas : function() {
		that.$canvas.attr('width', that.$container.width());
		that.$canvas.attr('height', that.$container.height());

		$(window).resize(function() {
			that.$canvas.css({"display":"block", "margin": "0 auto"});
		}); 
	},

};
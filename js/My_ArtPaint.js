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
		My_ArtPaint.getColor();
		My_ArtPaint.getThickness();

		$.each(that.tools, function(t, tbool) {
			$("#" + t).on("click", function() {
				My_ArtPaint.initTools();
				that.tools[t] = true;

				that.$canvas.off();
				that.context.beginPath();
				
				// set color and thickness
				that.context.lineCap = "round";
				that.context.lineWidth = that.thickness.value;
				that.context.strokeStyle = that.colors.stroke.value;

				// painting
				if (that.tools[t] && t == "pencil") 
					My_ArtPaint.paintWithPencil();
			});
		});
	},

	setCanvas : function() {
		that.$canvas.attr('width', that.$container.width());
		that.$canvas.attr('height', that.$container.height());

		$(window).resize(function() {
			that.$canvas.css({"display":"block", "margin": "0 auto"});
		}); 
	},

	getColor : function() {
		$.each(that.colors, function(c, element) {
			that.colors[c].value = that.colors[c].$element.val();

			that.colors[c].$element.on("change", function() {
				that.colors[c].value = that.colors[c].$element.val();
			});
		});
	},

	getThickness : function() {
		var thickness = that.thickness;

		thickness.value = thickness.$select[0].value;
		thickness.$element.click(function() {
			thickness.value = thickness.$select[0].value;
		});
	},

	initTools : function() {
		$.each(that.tools, function(t, boolean) {
			that.tools[t] = false;
		});
	},

	paintWithPencil: function() {
		var mousedownActive = false;

		that.$canvas.mousedown(function(e) {
			mousedownActive = true;

			that.startPoint.x = e.offsetX;
			that.startPoint.y = e.offsetY;
			
			that.context.moveTo(that.startPoint.x, that.startPoint.y);
		})
		.mousemove(function(e) {
			if (mousedownActive) {
				that.context.lineTo(e.offsetX, e.offsetY);
				that.context.stroke();
			}
		})
		.mouseup(function() {
			mousedownActive = false;
		})
		.mouseleave(function() {
			that.$canvas.mouseup();
		});

		that.context.closePath();
	},

};
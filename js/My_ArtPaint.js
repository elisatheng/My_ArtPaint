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
				"line" : false,
				"rectangle" : false,
				"circle" : false,
				"rubber" : false
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
				that.context.globalCompositeOperation = (t == "rubber") ? "destination-out" : "source-over";

				// painting
				if ((that.tools[t] && t == "pencil") || (that.tools[t] && t == "rubber")) 
					My_ArtPaint.paintOrErase();
				if (that.tools[t] && t == "line") 
					My_ArtPaint.paintLine();
				if (that.tools[t] && t == "rectangle") 
					My_ArtPaint.paintRectangle();
				if (that.tools[t] && t == "circle") 
					My_ArtPaint.paintCircle();

				that.context.closePath();
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

	paintOrErase: function() {
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
	},

	paintLine: function() {
		var clickedCpt = 0,
			j = 0,
			pts = [];

		that.$canvas.on("click", function(e) {
			++clickedCpt;

			pts.push(e.offsetX);
			pts.push(e.offsetY);

			if (clickedCpt == 2) {
				that.context.beginPath();

				for (var i = 0; i < (pts.length/2); i++) {
					that.context.lineTo(pts[j], pts[j+1]);
					that.context.stroke();
					j += 2;
				}

				clickedCpt = 0;
				j = 0;
				pts = [];
			}
		});
	},

	paintRectangle: function() {
		var clickedCpt = 0,
			j = 0,
			pts = [];

		that.$canvas.on("click", function(e) {
			++clickedCpt;

			pts.push(e.offsetX);
			pts.push(e.offsetY);

			if (clickedCpt == 2) {
				var pts_tmp = pts;
				var diff = pts_tmp[3] - pts_tmp[1];

				pts = [
					pts_tmp[0], pts_tmp[1],
					pts_tmp[0], pts_tmp[1] + diff,
					pts_tmp[2], pts_tmp[3],
					pts_tmp[2], pts_tmp[3] - diff,
					pts_tmp[0], pts_tmp[1]
				];

				that.context.beginPath();
				
				for (var i = 0; i < (pts.length/2); i++) {
					that.context.lineTo(pts[j], pts[j+1]);
					that.context.stroke();
					j += 2;
				}

				clickedCpt = 0;
				j = 0;
				pts = [];
			}
		});
	},

	paintCircle: function() {
		var clickedCpt = 0,
			pts = [];

		that.$canvas.on("click", function(e) {
			++clickedCpt;

			pts.push(e.offsetX);
			pts.push(e.offsetY);

			if (clickedCpt == 2) {
				var radiusx = pts[2] - pts[0],
					radiusy = pts[3] - pts[1],
					radius = Math.sqrt(( (Math.pow(radiusx, 2) + (Math.pow(radiusy, 2))) ));

				that.context.beginPath();
				that.context.arc(pts[0], pts[1], radius, 0, Math.PI*2, true);
				that.context.stroke();

				clickedCpt = 0;
				pts = [];
			}
		});
	}

};
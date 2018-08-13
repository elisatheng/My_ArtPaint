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
			$section : $(".section"),
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
			filling : {
				"$element" : $("#filling"),
				"state"	: false
			},
			thickness : {
				"$element" : $("#thickness"),
				"$select" : $("#thickness-select"),
				"value"	: null
			},
			tools : {
				"paint" : {
					"pencil" : false,
					"line" : false,
					"rectangle" : false,
					"circle" : false,
					"rubber" : false
				},
				"setting" : {
					"new" : false,
					"save" : false,
					"upload" : false
				}
			},
			points : [],
			startPoint : { x:0, y:0 },
			img : new Image(),
			reader : new FileReader()
		};

		// allow overriding the default elements
		$.extend(My_ArtPaint.vars, settings);

		that = My_ArtPaint.vars;
		My_ArtPaint._run();
	},

	_run : function() {
		My_ArtPaint.setCanvas();
		
		My_ArtPaint.getColor();
		My_ArtPaint.getFilling();
		My_ArtPaint.getThickness();

		My_ArtPaint.clickTools();
	},

	clickTools : function() {
		$.each(that.tools, function(type, toolObj) {
			$.each(toolObj, function(tool, toolState) {

				$("#" + tool).on("click", function() {
					My_ArtPaint.initTools();
					that.tools[type][tool] = true;

					that.$canvas.off();

					if (type == "paint") {
						$("#" + tool).addClass("active");

						that.context.globalCompositeOperation = (tool == "rubber") ? "destination-out" : "source-over";
						that.context.lineCap = "round";
						that.context.lineWidth = that.thickness.value;
						that.context.strokeStyle = that.colors.stroke.value;

						// paint
						if ((that.tools[type][tool] && tool == "pencil") || (that.tools[type][tool] && tool == "rubber")) 
							My_ArtPaint.paintOrErase();
						else if (that.tools[type][tool] && tool == "line") 
							My_ArtPaint.paintLine();
						else if (that.tools[type][tool] && tool == "rectangle") 
							My_ArtPaint.paintRectangle();
						else if (that.tools[type][tool] && tool == "circle") 
							My_ArtPaint.paintCircle();
					}
					else if (type == "setting") {
						if (tool == "new")
							My_ArtPaint.settingNew();
						else if (tool == "save")
							My_ArtPaint.settingSave();
						else if (tool == "upload")
							My_ArtPaint.settingUpload();
					}
				});

			});
		});
	},

	setCanvas : function() {
		// set size
		that.$canvas.attr('width', that.$section.width());
		that.$canvas.attr('height', that.$section.height());

		$(window).resize(function() {
			that.$canvas.css({"display":"block", "margin": "0 auto"});
		});

		// set white img
		that.img.onload = function() {
			that.context.drawImage(that.img, 0, 0, that.$canvas[0].width-1, that.$canvas[0].height-1);
		};
		that.img.src = "img/white.jpg";
	},

	getColor : function() {
		$.each(that.colors, function(type, element) {
			that.colors[type].value = that.colors[type].$element.val();

			that.colors[type].$element.on("change", function() {
				that.colors[type].value = that.context[type + "Style"] = that.colors[type].$element.val();
			});
		});
	},

	getFilling : function() {
		that.filling.$element.on("click", function() {
			if (!that.filling.$element.hasClass("active")) {
				that.filling.$element.addClass("active");
				that.filling.value = true;
			}
			else {
				that.filling.$element.removeClass("active");
				that.filling.value = false;
			}
		})
	},

	getThickness : function() {
		var thickness = that.thickness;

		thickness.value = thickness.$select[0].value;
		thickness.$element.click(function() {
			thickness.value = that.context.lineWidth = thickness.$select[0].value;
		});
	},

	initTools : function() {
		$.each(that.tools, function(type, toolObj) {
			$.each(toolObj, function(tool, toolState) {
				that.tools[type][tool] = false;

				if ($("#" + tool).hasClass("active")) 
					$("#" + tool).removeClass("active");
			});
		});
	},

	paintOrErase: function() {
		var mousedownActive = false;

		that.$canvas.mousedown(function(e) {
			mousedownActive = true;

			that.startPoint.x = e.offsetX;
			that.startPoint.y = e.offsetY;
			
			that.context.beginPath();
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

				that.context.closePath();

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

					// filling
					if (that.filling.$element.hasClass("active")) {
						that.context.fillStyle = that.colors.fill.value;
						that.context.fill();
					}

					j += 2;
				}

				that.context.closePath();

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

				// filling
				if (that.filling.$element.hasClass("active")) {
					that.context.fillStyle = that.colors.fill.value;
					that.context.fill();
				}

				that.context.closePath();

				clickedCpt = 0;
				pts = [];
			}
		});
	},

	settingNew: function() {
		that.context.clearRect(0, 0, that.$canvas.width(), that.$canvas.height());
	},

	settingSave: function() {
		$("#saveAs").on('click', function(ev) {
			$("#saveAs")[0].download = "my_artpaint.png";
			$("#saveAs")[0].href = that.$canvas[0].toDataURL("image/png");
		});
	},

	settingUpload: function() {
		// on browse
		$(":file").change(function (e) {
			if (this.files && this.files[0]) {
				that.reader.onload = function(e) {
					that.img.onload = function() {
						var wRatio = that.$canvas[0].width / that.img.naturalWidth;
						var hRatio = that.$canvas[0].height / that.img.naturalHeight;
						var ratio = Math.min(wRatio, hRatio);

						that.context.drawImage(that.img, 0, 0, that.img.width, that.img.height, 0, 0, that.img.naturalWidth*ratio, that.img.naturalHeight*ratio);
					};

					that.img.src = e.target.result;
				};
				that.reader.readAsDataURL(e.target.files[0]);
			}
		});
	}

};
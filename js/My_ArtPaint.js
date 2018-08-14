/**
 * My_ArtPaint
 * Copyright (c) 2018 Elisa Theng
 * @author Elisa Theng
 * @version 1.0
 */

(function($) {

	// PLUGIN
	$.fn.My_ArtPaint = function( defaults ) {
		// Merging default and my own parameters
		defaults = $.extend({}, $.fn.My_ArtPaint.defaults, defaults || {});
		$.fn.My_ArtPaint._setDefaultsElements();
		
		// Looping through all nodes
		this.each(function() {
			$.fn.My_ArtPaint._init();
			$.fn.My_ArtPaint._clickTools();
		});

		return this;
	};


	// DEFAULTS
	$.fn.My_ArtPaint.defaults = {
		$section : null,
		$canvas : null,
		context	: null,
		colors : {
			stroke : { $element : null, value : null },
			fill : { $element : null, value : null }
		},
		filling : { $element : null, state : false },
		thickness : { $element : null, $select : null, value : null },
		tools : {
			paint : {
				pencil : false,
				line : false,
				rectangle : false,
				circle : false,
				rubber : false
			},
			setting : {
				new : false,
				save : false,
				upload : false
			}
		},
		points : [],
		img : new Image(),
		reader : new FileReader()
	};


	// METHODS
	$.extend($.fn.My_ArtPaint, {
		_setDefaultsElements : function() {
			this.defaults.$section = $(".section");
			this.defaults.$canvas = $("#canvas");
			this.defaults.context = $("#canvas")[0].getContext("2d");
			this.defaults.colors.stroke.$element = $("#colorStrokePicked");
			this.defaults.colors.fill.$element = $("#colorFillPicked");
			this.defaults.filling.$element = $("#filling");
			this.defaults.thickness.$element = $("#thickness");
			this.defaults.thickness.$select= $("#thickness-select");
		},

		_init : function() {
			this.setCanvas(this.defaults);
			this.getColor(this.defaults);
			this.getThickness(this.defaults);
			this.getFilling(this.defaults);
		},

		_clickTools : function() {
			let _this = this;
			let that = _this.defaults;

			$.each(that.tools, function(type, toolObj) {
				$.each(toolObj, function(tool, toolState) {

					$("#" + tool).on("click", function() {
						_this.initTools(that);
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
								_this.paintOrErase(that);
							else if (that.tools[type][tool] && tool == "line") 
								_this.paintLine(that);
							else if (that.tools[type][tool] && tool == "rectangle") 
								_this.paintRectangle(that);
							else if (that.tools[type][tool] && tool == "circle") 
								_this.paintCircle(that);
						}
						else if (type == "setting") {
							if (tool == "new")
								_this.settingNew(that);
							else if (tool == "save")
								_this.settingSave(that);
							else if (tool == "upload")
								_this.settingUpload(that);
						}
					});

				});
			});
		},

		setCanvas : function(that) {
			// set size
			that.$canvas.attr('width', that.$section.width());
			that.$canvas.attr('height', that.$section.height());

			$(window).resize(function() {
				that.$canvas.css({"display":"block", "margin": "0 auto"});
			});

			// set white img
			this.setCanvasWhite(that);
		},

		setCanvasWhite : function(that) {
			that.img.onload = function() {
				that.context.drawImage(that.img, 0, 0, that.$canvas[0].width-1, that.$canvas[0].height-1);
			};
			that.img.src = "img/white.jpg";
		},

		getColor : function(that) {
			$.each(that.colors, function(type, element) {
				that.colors[type].value = that.colors[type].$element.val();

				that.colors[type].$element.on("change", function() {
					that.colors[type].value = that.context[type + "Style"] = that.colors[type].$element.val();
				});
			});
		},

		getThickness : function(that) {
			that.thickness.value = that.thickness.$select[0].value;
			
			that.thickness.$element.click(function() {
				that.thickness.value = that.context.lineWidth = that.thickness.$select[0].value;
			});
		},

		getFilling : function(that) {
			that.filling.$element.on("click", function() {
				if (!that.filling.$element.hasClass("active")) {
					that.filling.$element.addClass("active");
					that.filling.value = true;
				}
				else {
					that.filling.$element.removeClass("active");
					that.filling.value = false;
				}
			});
		},

		initTools : function(that) {
			$.each(that.tools, function(type, toolObj) {
				$.each(toolObj, function(tool, toolState) {
					that.tools[type][tool] = false;

					if ($("#" + tool).hasClass("active")) 
						$("#" + tool).removeClass("active");
				});
			});
		},

		paintOrErase: function(that) {
			var mousedownActive = false;

			that.$canvas.mousedown(function(e) {
				mousedownActive = true;

				that.context.beginPath();
				that.context.moveTo(e.offsetX, e.offsetY);
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

		paintLine: function(that) {
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

		paintRectangle: function(that) {
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

		paintCircle: function(that) {
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

		settingNew: function(that) {
			that.context.clearRect(0, 0, that.$canvas.width(), that.$canvas.height());

			this.setCanvasWhite(that);
		},

		settingSave: function(that) {
			$("#saveAs").on('click', function(ev) {
				$("#saveAs")[0].download = "my_artpaint.png";
				$("#saveAs")[0].href = that.$canvas[0].toDataURL("image/png");
			});
		},

		settingUpload: function(that) {
			// on browse (no drag'n drop)
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

	});
}(jQuery));
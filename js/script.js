$(function() {
	My_ArtPaint._init();


	// TOGGLE MENU
	$(".aside .toggle").on("click", function() {
		$(".aside .tools").slideToggle("normal");
		
		$(".aside .toggle:contains('=')").length > 0
			? $(".aside .toggle").text("x")
			: $(".aside .toggle").text("=");
	});
});
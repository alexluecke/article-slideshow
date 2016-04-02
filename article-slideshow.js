var ArticleSlideshow = (function($) {
	var App = {};

	// Provider elements reference slideshow provider elements
	// (i.e. Twitter Bootstrap)
	App.conf = {
		nonce: '',
		elements: {
			'wrap': '#article-slideshow-wrapper',
			'thumbnails_container': '.thumbnails',
			provider: {
				'target': '#article-slideshow', // id of the carousel object
				'container': '.carousel-inner' // id of the carousel object
			},
		},
		dims: {},
	};

	// Slides are an array of image objects.
	App.slides = [];

	// cache for dom elements
	App.elements = {
		provider: {
			'target': null,
			'container': null
		},
	};

	$.fn.exists = function() {
		return this.length > 0;
	};

	function ImageException(message) {
		this.message = message || 'No message provided.';
		this.name =  "ImageException";
	}

	function log(e) {
		console.log(e.name + ": " + e.message);
	}

	function getImgObj() {
		return {
			'active': '',
			'image': '',
			'alt': '',
			'text': '',
		};
	}

	/*
	 * getSlideHtml can be passed in as a config argument if you wish to change
	 * the basic slide structure to something else.
	 */
	App.getSlideHtml = function(s) {
		var slide = $.extend({}, getImgObj(), s);

		if (slide.image === '')
			throw new ImageException("No slide image provided to App.getSlideHtml.");

		return "<div class='item" + (slide.active ? ' active' : '') + "'>" +
			"<img src='" + slide.image + "' alt='" + slide.alt + "'>" +
			"<div class='carousel-caption'>" + slide.text + "</div>" +
			"</div>";
	};

	function getSlideObj(slide) {
		return $(App.getSlideHtml(slide));
	}

	/*
	 * getSlideHtml can be passed in as a config argument if you wish to change
	 * the basic slide structure to something else.
	 */
	App.getThumbHtml = function(s) {
		var slide = $.extend({}, getImgObj(), s);

		if (slide.image === '')
			throw new ImageException("No slide image provided to App.getSlideHtml.");

		return "<img style='width: 50px; height: 50px; float: left;'" + 
			" class='thumbnail" + (slide.active ? ' active' : '') + "'" +
			" src='" + slide.image + "' alt='" + slide.alt + "'>";
	};

	function getThumbObj(slide) {
		return $(App.getThumbHtml(slide));
	}

	App.init = function(options) {

		$(App.conf, options.conf || {});
		$(App.elements.provider, options.elements || {});
		App.getSlideHtml = options.getSlideHtml || App.getSlideHtml;

		// Merge provided slides into App.slides
		if (Array.isArray(options.slides)) {
			options.slides.filter(function(x) {
				return $.trim(x.image) !== '';
			}).forEach(function(x) {
				App.slides.push($.extend({}, getImgObj(), x));
			});
		}

		App.slides.forEach(function(x) {
			x.active = false;
		});

		if (App.slides.length === 0)
			return;

		App.slides[0].active = true;
		App.elements.provider.target = $(App.conf.elements.provider.target);
		App.elements.provider.container = App.elements.provider.target
			.find(App.conf.elements.provider.container).first();
		App.elements.wrap = $(App.conf.elements.wrap);
		App.elements.thumbnails_container = App.elements.wrap
			.find(App.conf.elements.thumbnails_container).first();

		App.slides.forEach(function(slide) {
			App.elements.provider.container.append(getSlideObj(slide));
			App.elements.thumbnails_container.append(getThumbObj(slide));
		});
	};

	return App;

})(jQuery);

var test_slides = [];
test_slides.push({
	'image': '  ',
	'text': 'Testing the first slide 1.',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 2.',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 3.',
});

ArticleSlideshow.init({
	'slides': test_slides,
});

/*

	 <!-- Controls -->
	 <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
	 <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
	 <span class="sr-only">Previous</span>
	 </a>
	 <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
	 <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
	 <span class="sr-only">Next</span>
	 </a>

*/

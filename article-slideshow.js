var Templater = Templater || (function($) {
	return $ === null ? null : function(args) {
		args = args || {};

		var structs = {
			'slide': {
				'index': 0,
				'active': false,
				'image': '',
				'alt': '',
				'text': '',
			}
		};

		var slide = args.slide || {
			html: function(s) {
				var slide = $.extend({}, structs.slide, s);
				return $.trim(slide.image) === '' ? ''
					: [
						"<div class='item" + (slide.active ? ' active' : '') + "'>",
						"\t<img src='" + slide.image + "' alt='" + slide.alt + "'>",
						"\t<div class='carousel-caption'>" + slide.text + "</div>",
						"</div>"
					].join("\n");
			},
		};

		var thumbnail = args.thumbnail || {
			html: function(s) {
				var slide = $.extend({}, structs.slides, s);
				return $.trim(slide.image) === '' ? ''
					: [
						"<li data-target='#article-slideshow-wrapper'",
						" data-slide-to='" + slide.index + "'",
						" class='thumbnail" + (slide.active ? ' active' : '') + "'>",
						"<div class='cover' style='background-image: url(" + slide.image + ");'>&nbsp;</div>",
						"</li>"
					].join("\n");
			},
		};

		// Make getters for the objects.
		[slide, thumbnail].forEach(function(x) {
			x.get = function(s) { return $(x.html(s)); };
		});

		return {
			'slide': slide,
			'thumbnail': thumbnail,
			'structs': structs,
		};
	};
})(jQuery);

var ArticleSlideshow = (function($) {
	return $ === null ? null : function() {

		$.fn.exists = function() {
			return this.length > 0;
		};

		var App = {};
		var _t = null;

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
		};

		// Slides are an array of objects.
		App.slides = [];

		// cache for dom elements
		App.elements = {
			provider: {
				'target': null,
				'container': null
			},
			'wrap': null,
			'thumbnails_container': null,
		};

		function log(e) {
			console.log(e.name + ": " + e.message);
		}

		function loadElementCache() {
			App.elements.provider.target = $(App.conf.elements.provider.target);
			App.elements.provider.container = App.elements.provider.target
				.find(App.conf.elements.provider.container).first();
			App.elements.wrap = $(App.conf.elements.wrap);
			App.elements.thumbnails_container = App.elements.wrap
				.find(App.conf.elements.thumbnails_container).first();
		}

		function loadContent() {
			App.slides.forEach(function(slide) {
				App.elements.provider.container.append(_t.slide.get(slide));
			});
			App.elements.thumbnails_container.append(
				App.slides.map(function(x) {
					return _t.thumbnail.html(x);
				}).join("\n")
			);
		}

		function setActiveSlide(idx) {
			idx = Number.parseInt(idx || 0);
			App.slides.forEach(function(x) { x.active = false; });
			App.slides[idx].active = true;
		}

		App.init = function(args) {

			args = args || {};

			$(App.conf, args.conf || {});
			$(App.elements.provider, args.elements || {});

			// If user wants to provide their own templates.
			_t = args.templater || new Templater();

			// Merge provided slides into App.slides
			if (Array.isArray(args.slides)) {
				var idx = 0;
				args.slides.filter(function(x) {
					return $.trim(x.image) !== '';
				}).forEach(function(x) {
					x.index = idx; idx++;
					App.slides.push($.extend({}, _t.structs.slide, x));
				});
			}

			if (App.slides.length === 0) return;

			setActiveSlide(0);
			loadElementCache();
			loadContent();

		};

		return App;

	};
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

var article_slideshow = new ArticleSlideshow();

article_slideshow.init({
	'slides': test_slides
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

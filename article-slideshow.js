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
		var active_index = 0;

		var cache = {
			'slides': null,
			'thumbnails': null,
		};

		// Provider elements reference slideshow provider elements
		// (i.e. Twitter Bootstrap)
		App.conf = {
			nonce: '',
			elements: {
				'wrap': '#article-slideshow-wrapper',
				thumbnails: {
					container: '.thumbnails',
				},
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
			thumbnails: {
				container: null,
			},
			'wrap': null,
		};

		function log(e) {
			console.log(e.name + ": " + e.message);
		}

		function setupContent() {
			App.elements.provider.target = $(App.conf.elements.provider.target);
			App.elements.provider.container = App.elements.provider.target
				.find(App.conf.elements.provider.container).first();
			App.elements.wrap = $(App.conf.elements.wrap);
			App.elements.thumbnails.container = App.elements.wrap
				.find(App.conf.elements.thumbnails.container).first();
		}

		function setupSlides() {
			App.slides.forEach(function(slide) {
				App.elements.provider.container.append(_t.slide.get(slide));
			});
			App.slides.forEach(function(x) {
				App.elements.thumbnails.container.append(
					_t.thumbnail.get(x)
				);
			});
			cacheSlides();
			cacheThumbnails();
		}

		function cacheSlides() {
			cache.slides = App.elements.provider.container.find('.item');
		}

		function cacheThumbnails() {
			cache.thumbnails = App.elements.thumbnails.container.find('.thumbnail');
		}

		function setupEvents() {
			cache.thumbnails.each(function(idx) {
				var $el = $(this);
				$el.on('click', function(ev) {
					App.elements.provider.target.data('bs.carousel').to(idx);
					cache.thumbnails.removeClass('active');
					$el.addClass('active');
					active_index = idx;
				});
			});
			App.elements.provider.target.on('slid.bs.carousel', function () {
				cache.slides.each(function(idx) {
					if ($(this).hasClass('active')) active_index = idx;
				});
			});
			cache.thumbnails.each(function(idx) {
				if (idx !== active_index) $(this).removeClass('active');
			});
		}

		// TODO: I need to figure out a way to consolidate this method with the set
		// click events that set the active slide based on the dom.
		function setActiveSlide(idx) {
			idx = Number.parseInt(idx || 0);
			App.slides.forEach(function(x) { x.active = false; });
			App.slides[idx].active = true;
		}

		function mergeProvidedSlides(slides) {
			if (Array.isArray(slides)) {
				var idx = 0;
				slides.filter(function(x) {
					return $.trim(x.image) !== '';
				}).forEach(function(x) {
					x.index = idx; idx++;
					App.slides.push($.extend({}, _t.structs.slide, x));
				});
			}
		}

		function serializedSetup() {
			/*
			 * Setup content goes through the following stages:
			 *  1. It caches/saves all containers to this object
			 *  2. It appends all slides to the appropriate containers and caches
			 *  them.
			 *  3. It sets up any events needed for the slideshow, including click
			 *  and slide.
			 */
			setupContent();
			setupSlides();
			setupEvents();
		}

		App.init = function(args) {

			args = args || {};

			$.extend(App.conf, args.conf || {});
			$.extend(App.elements.provider, args.elements || {});

			// If user wants to provide their own templates for slides, thumbnails,
			// and article text:
			_t = args.templater || new Templater();

			mergeProvidedSlides(args.slides);

			if (App.slides.length === 0) return;

			setActiveSlide(0);
			serializedSetup();

			$(App.elements.provider.target).carousel({ interval: false });

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
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 4.',
});

var article_slideshow = new ArticleSlideshow();
article_slideshow.init({ 'slides': test_slides });

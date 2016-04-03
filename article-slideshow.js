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

		App.VERSION = '0.1';

		// Slides are an array of objects.
		App.slides = [];

		// Provider elements reference slideshow elements
		// (i.e. Twitter Bootstrap)
		App.conf = {
			elements: {
				'target': '#article-slideshow-wrapper',
				containers: {
					'slide': '.carousel-inner',
					'thumbnail': '.thumbnails'
				},
			},
		};

		// cache for dom elements
		App.elements = {
			'target': null,
			containers: {
				'slide': null,
				'thumbnail': null,
			},
		};

		function logException(e) {
			if (window.console) {
				console.log(e.name + ": " + e.message);
			}
		}

		function log(msg) {
			if (window.console) {
				console.log(msg);
			}
		}

		function setupContent() {
			App.elements.target = $(App.conf.elements.target);
			App.elements.containers.slide = App.elements.target
				.find(App.conf.elements.containers.slide).first();
			App.elements.containers.thumbnail = App.elements.target
				.find(App.conf.elements.containers.thumbnail).first();
		}

		function setupSlides() {
			App.slides.forEach(function(slide) {
				App.elements.containers.slide.append(_t.slide.get(slide));
			});
			App.slides.forEach(function(x) {
				App.elements.containers.thumbnail.append(
					_t.thumbnail.get(x)
				);
			});
			cacheSlides();
			cacheThumbnails();
		}

		function cacheSlides() {
			cache.slides = App.elements.containers.slide.find('.item');
		}

		function cacheThumbnails() {
			cache.thumbnails = App.elements.containers.thumbnail.find('.thumbnail');
		}

		function setupEvents() {
			cache.thumbnails.each(function(idx) {
				var $el = $(this);
				$el.on('click', function(ev) {
					cache.thumbnails.removeClass('active');
					$el.addClass('active');
					active_index = idx;
					// Putting carousel.to() event here seems to have better performance.
					// I think the multiple events firing simultaneously might have been
					// stomping on each other in the event loop.
					App.elements.target.data('bs.carousel').to(idx);
				});
			});
			App.elements.target.on('slid.bs.carousel', function () {
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

			if (typeof $.fn.modal === 'undefined')  {
				log("Article slideshow requires bootstrap > 3.2.");
				return;
			}

			args = args || {};

			// Options able to be passed in args (see App.conf). Fallback here
			// indicates the expected type:
			args.containers = args.containers || {};
			args.slides = args.slides || [];
			App.conf.elements.target = args.target || App.conf.elements.target;
			_t = args.templater || new Templater();

			// Apply args to the object. Expects: $.extend(store-dest, defaults, options):
			App.conf.elements.containers = $.extend(
				{},
				App.conf.elements.containers,
				args.containers,
				typeof args == 'object' && args
			);

			mergeProvidedSlides(args.slides);

			if (App.slides.length === 0) return;

			setActiveSlide(0);
			serializedSetup();

			if (!App.elements.target.exists()) return;

			$('.article-slideshow').carousel({interval: false});

// 			$('#carousel a').on('click', function (ev) {
// 				if ( $(ev.currentTarget).hasClass('right')) {
// 					$('#carousel').carousel('next');
// 				}
// 				if ( $(ev.currentTarget).hasClass('left')) {
// 					$('#carousel').carousel('prev');
// 				}
// 			})

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
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 5.',
});


var article_slideshow = new ArticleSlideshow();
article_slideshow.init({
	slides: test_slides,
	target: '#article-slideshow-wrapper',
	containers: {
		thumbnail: '.thumbnails',
		slide: '.carousel-inner',
	}
});

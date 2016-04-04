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

		var image = args.image || {
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
						"<li data-target='#image-carousel'",
						" class='thumbnail" + (slide.active ? ' active' : '') + "'>",
						"<div class='cover' style='background-image: url(" + slide.image + ");'>&nbsp;</div>",
						"</li>"
					].join("\n");
			},
		};

		// Make getters for the objects.
		[image, thumbnail].forEach(function(x) {
			x.get = function(s) { return $(x.html(s)); };
		});

		return {
			'article': '',
			'image': image,
			'structs': structs,
			'thumbnail': thumbnail,
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
			'images': null,
			'thumbnails': null,
			'articles': null,
		};

		App.VERSION = '0.1';

		// Slides are an array of objects.
		App.slides = [];

		// Provider elements reference slideshow elements
		// (i.e. Twitter Bootstrap)
		App.conf = {
			elements: {
				'wrap': '#article-slideshow-wrapper',
				carousels: {
					'image': '#image-carousel',
					'article': '#article-carousel',
				},
				containers: {
					'image': '.images',
					'thumbnail': '.thumbnails',
					'article': '.articles',
				},
			},
		};

		// cache for dom elements
		App.elements = {
			'wrap': null,
			carousels: {
				'image': null,
				'article': null,
			},
			containers: {
				'image': null,
				'thumbnail': null,
				'article': null,
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

		function setupElements() {
			App.elements.wrap = $(App.conf.elements.wrap);
			App.elements.carousels.image = $(App.conf.elements.carousels.image);
			App.elements.carousels.article = $(App.conf.elements.carousels.article);
			App.elements.containers.image = App.elements.wrap
				.find(App.conf.elements.containers.image).first();
			App.elements.containers.article = App.elements.wrap
				.find(App.conf.elements.containers.article).first();
			App.elements.containers.thumbnail = App.elements.wrap
				.find(App.conf.elements.containers.thumbnail).first();
		}

		function setupSlides() {
			App.slides.forEach(function(slide) {
				App.elements.containers.image.append(_t.image.get(slide));
			});
			App.slides.forEach(function(slide) {
				App.elements.containers.thumbnail.append(
					_t.thumbnail.get(slide)
				);
			});
			// TODO: generalize the cache functions.
			cacheImages();
			cacheArticles();
			cacheThumbnails();
		}

		function cacheImages() {
			cache.slides = App.elements.containers.image.find('.item');
		}

		function cacheArticles() {
			cache.slides = App.elements.containers.article.find('.item');
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
					// stomping on each other in the event loop. Also, I need the buttons
					// to trigger two separate slideshows (one image, one article).
					App.elements.carousels.image.data('bs.carousel').to(idx);
					//App.elements.carousels.article.data('bs.carousel').to(idx);
				});
			});
			App.elements.carousels.image.on('slid.bs.carousel', function () {
				cache.slides.each(function(idx) {
					if ($(this).hasClass('active')) active_index = idx;
				});
				cache.thumbnails.each(function(idx) {
					if (idx !== active_index) $(this).removeClass('active');
				});
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
			setupElements();
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
			args.carousels = args.carousels || {};
			args.slides = args.slides || [];
			_t = args.templater || new Templater();

			App.conf.elements.wrap = args.wrap || App.conf.elements.wrap;

			// Apply args to the object. Expects: $.extend(store-dest, defaults, options):
			App.conf.elements.containers = $.extend(
				{},
				App.conf.elements.containers,
				args.containers
			);

			App.conf.elements.carousels = $.extend(
				{},
				App.conf.elements.carousels,
				args.carousels
			);

			mergeProvidedSlides(args.slides);

			if (App.slides.length === 0) return;

			setActiveSlide(0);
			serializedSetup();


			if (!App.elements.wrap.exists()) return;

			// Disable auto-slide for all slideshows (images, articles, etc):
			$('.article-slideshow').carousel({ interval: false });

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
	wrap: '#article-slideshow-wrapper',
	containers: {
		article: '.articles',
		images: '.images',
		thumbnail: '.thumbnails',
	},
	carousels: {
		image: '#image-carousel',
		article: '#article-carousel',
	},
});

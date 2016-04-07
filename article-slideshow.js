var SlideTemplater = SlideTemplater || (function($) {
	return $ === null ? null : function(args) {
		args = args || {};

		var structs = {
			'slide': {
				'index': 0,
				'active': false,
				'title': '',
				'image': '',
				'alt': '',
				'text': '',
				'caption': '',
			}
		};

		var extendSlide = function(s) {
			return  $.extend({}, structs.slide, s);
		};

		var image = args.image || {
			html: function(s) {
				var slide = extendSlide(s);
				return $.trim(slide.image) === '' ? ''
					: [
						"<div class='image item" + (slide.active ? ' active' : '') + "'>",
						"\t<img src='" + slide.image + "' alt='" + slide.alt + "'>",
						"\t<div class='carousel-caption'>" + slide.caption + "</div>",
						"</div>"
					].join("\n");
			},
		};

		var article = args.article || {
			html: function(s) {
				var slide = extendSlide(s);
				return [
						"<div class='article item" + (slide.active ? ' active' : '') + "'>",
						"\t<h2>" + slide.title + "</h2>",
						"\t<p>" + slide.text + "</p>",
						"</div>"
					].join("\n");
			},
		};

		var thumbnail = args.thumbnail || {
			html: function(s) {
				var slide = extendSlide(s);
				return $.trim(slide.image) === '' ? ''
					: [
						"<li data-target='#image-carousel'",
						" class='slide-thumb item" + (slide.active ? ' active' : '') + "'>",
						"<div class='cover' style='background-image: url(" + slide.image + ");'>&nbsp;</div>",
						"</li>"
					].join("\n");
			},
		};

		// Make getters for the objects.
		[article, image, thumbnail].forEach(function(x) {
			x.get = function(s) { return $(x.html(s)); };
		});

		return {
			'article': article,
			'image': image,
			'structs': structs,
			'thumbnail': thumbnail,
			'extendSlide': extendSlide,
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

		App.classes = {
			'item': 'item',
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
			App.elements.containers.image = App.elements.carousels.image
				.find(App.conf.elements.containers.image).first();
			App.elements.containers.article = App.elements.carousels.article
				.find(App.conf.elements.containers.article).first();
			App.elements.containers.thumbnail = App.elements.wrap
				.find(App.conf.elements.containers.thumbnail).first();
		}

		function setupSlides() {
			App.slides.forEach(function(slide) {
				App.elements.containers.image.append(_t.image.get(slide));
				App.elements.containers.thumbnail.append(_t.thumbnail.get(slide));
				App.elements.containers.article.append(_t.article.get(slide));
			});
			// TODO: generalize the cache functions.
			cacheImages();
			cacheArticles();
			cacheThumbnails();
			setActiveElementsByIndex(0);
		}

		function setupEvents() {
			cache.thumbnails.each(function(idx) {
				var $el = $(this);
				$el.on('click', function(ev) {
					// Putting carousel.to() event here seems to have better performance.
					// I think the multiple events firing simultaneously might have been
					// stomping on each other in the event loop. Also, I need the buttons
					// to trigger two separate slideshows (one image, one article).
					App.elements.carousels.image.data('bs.carousel').to(idx);
					App.elements.carousels.article.data('bs.carousel').to(idx);
					cache.thumbnails.each(setInactive);
					setActive(idx, $el);
				});
			});
			App.elements.carousels.image.on('slide.bs.carousel', function () {
				// Put events triggered by `slide` here.
			});
			App.elements.carousels.image.on('slid.bs.carousel', function () {
				cache.thumbnails.each(setInactive);
				cache.articles.each(setInactive);
				cache.images.each(function(idx) {
					if ($(this).hasClass('active')) {
						// TODO: This might be redundant, but this seems to be needed. The
						// click events seem to get the slideshows out of whack. Look into
						// this.
						App.elements.carousels.article.data('bs.carousel').to(idx);
						// Make sure items share active state:
						setActiveElementsByIndex(idx);
					}
				});
			});
			// TODO: (maybe) disable buttons when sliding.
			App.elements.wrap.find('a').each(function(idx) {
				$(this).on('click', function (ev) {
					var carousel = '';
					if ($(ev.currentTarget).hasClass('right')) {
						for (carousel in App.elements.carousels)
							App.elements.carousels[carousel].carousel('next');
					}
					if ($(ev.currentTarget).hasClass('left')) {
						for (carousel in App.elements.carousels)
							App.elements.carousels[carousel].carousel('prev');
					}
				});
			});
		}

		function cacheImages() {
			cache.images = App.elements.containers.image.find(App.classes.item);
		}

		function cacheArticles() {
			cache.articles = App.elements.containers.article.find(App.classes.item);
		}

		function cacheThumbnails() {
			cache.thumbnails = App.elements.containers.thumbnail.find(App.classes.item);
		}

		function setInactive(idx, el) {
			$(el).removeClass('active');
		}

		function setActive(idx, el) {
			$(el).addClass('active');
		}

		function setActiveElementsByIndex(idx) {
			// First element should be active initially:
			for (var prop in cache) {
				$(cache[prop]).each(setInactive); // remove all active
				setActive(idx, cache[prop][idx]); // make idx active
			}
		}

		function mergeSlides(slides) {
			if (Array.isArray(slides)) {
				var idx = 0;
				slides.filter(function(x) {
					return $.trim(x.image) !== '';
				}).forEach(function(x) {
					x.index = idx; idx++;
					App.slides.push(_t.extendSlide(x));
				});
			}
		}

		function serializedSetup() {
			/*
			 * Setup content goes through the following stages:
			 *  1. It caches/saves all containers to this object
			 *  2. It appends all slides to the appropriate containers and caches
			 *  them.
			 *  3. It sets up any events needed for the slideshow, including click,
			 *  slid, and slide.
			 */
			setupElements();
			setupSlides();
			setupEvents();
		}

		App.init = function(args) {

			if (typeof $.fn.modal === 'undefined')  {
				log("Article slideshow requires Bootstrap > 3.2.x");
				return;
			}

			args = args || {};

			// Options able to be passed in args (see App.conf). Fallback here
			// indicates the expected type:
			args.containers = args.containers || {};
			args.carousels = args.carousels || {};
			args.slides = args.slides || [];
			_t = args.templater || new SlideTemplater();

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

			mergeSlides(args.slides);
			if (App.slides.length === 0) return;
			serializedSetup();

			if (!App.elements.wrap.exists()) return;
			for (var carousel in App.elements.carousels) {
				if (!App.elements.carousels[carousel].exists()) {
					log("One of the carousels provided does not exist.");
					return;
				}
			}

			// Disable auto-slide for all slideshows (images, articles, etc):
			$('.article-slideshow').carousel({ interval: false });
		};

		return App;

	};
})(jQuery);

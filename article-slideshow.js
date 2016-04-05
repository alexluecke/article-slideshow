var Templater = Templater || (function($) {
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
						"<div class='item" + (slide.active ? ' active' : '') + "'>",
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
						" class='thumbnail" + (slide.active ? ' active' : '') + "'>",
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

		  cache.articles.each(function() { $(this).removeClass('active'); });
		  cache.images.each(function() { $(this).removeClass('active'); });
		  cache.thumbnails.each(function() { $(this).removeClass('active'); });

      for (var prop in cache) {
        $(cache[prop][0]).addClass('active');
      }
		}

		function cacheImages() {
			cache.images = App.elements.containers.image.find('.item');
		}

		function cacheArticles() {
			cache.articles = App.elements.containers.article.find('.item');
		}

		function cacheThumbnails() {
			cache.thumbnails = App.elements.containers.thumbnail.find('.thumbnail');
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
					cache.thumbnails.removeClass('active');
					$el.addClass('active');
					active_index = idx;
				});
			});
			App.elements.carousels.image.on('slide.bs.carousel', function () {
				App.slides.forEach(function(slide) {
					slide.active = false;
				});
			});
			App.elements.carousels.image.on('slid.bs.carousel', function () {
				cache.images.each(function(idx) {
					if ($(this).hasClass('active')) {
						active_index = idx;
						// TODO: This might be redundant, but this seems to be needed. The
						// click events seem to get the slideshows out of whack. Look into
						// this.
						App.elements.carousels.article.data('bs.carousel').to(idx);
					}
				});
				cache.thumbnails.each(function(idx) {
					if (idx !== active_index)
						$(this).removeClass('active');
					else
						$(this).addClass('active');
				});
			});
			App.elements.wrap.find('a').each(function(idx) {
				$(this).on('click', function (ev) {
					var carousel = '';
					if ($(ev.currentTarget).hasClass('right')) {
						for (carousel in App.elements.carousels)
							App.elements.carousels[carousel].carousel('next');
					}
					if ($(ev.currentTarget).hasClass('left')) {
						for (carousel in App.elements.carousels)
							App.elements.carousels[carousel].carousel('next');
					}
				});
			});
		}

		function mergeProvidedSlides(slides) {
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

var test_slides = [];
test_slides.push({
	'image': '  ',
	'text': 'Testing the first slide 1.',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.' +
'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
	'caption': 'Some caption here 2.',
	'title': 'Title 2',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 3.',
	'title': 'Title 3',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 4.',
	'title': 'Title 4',
});
test_slides.push({
	'image': '/wp-content/uploads/2016/02/stock-photo-19952282-bamboo-yoga.jpg',
	'text': 'Testing the first slide 5.',
	'title': 'Title 5',
});

var article_slideshow = new ArticleSlideshow();

article_slideshow.init({
	slides: test_slides,
	wrap: '#article-slideshow-wrapper',
  templater: new Templater(),
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

# Article Slide Show

## Dependencies:

- Boostrap > v3.2.x
- jQuery > v2.0.x


## Recommended:

- Font awesome > 4.5.x

## Elements

Each slideshow wrapper needs to contain the class `.article-slideshow` so that the plug-in can disable automatic sliding. This can also be done by targeting the slideshow element with the following:

    $('.carousel').carousel({ interval: false });

## Default HTML:

The structure of the slideshow might look something like the following:

    <div id="article-slideshow-wrapper" class="container">
      <div class="col-lg-6">
        <div id="image-carousel" class="article-slideshow carousel slide">
          <div class="images carousel-inner" role="listbox"><!-- leave empty --></div>
        </div>
        <div class="controls-wrap">
          <div class="controls">
            <a class="left" role="button">
              <i class="fa fa-chevron-left"></i>
              <span class="sr-only">Prev</span>
            </a>
            <ol class="thumbnails"><!-- leave empty --></ol>
            <a class="right" role="button">
              <i class="fa fa-chevron-right"></i>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div id="article-carousel" class="article-slideshow carousel">
          <div class="articles carousel-inner" role="listbox"><!-- leave empty --></div>
        </div>
      </div>
    </div>

The only important features to this HTML structure are:

- The carousels need to have the classes `article-slideshow` and `carousel`
- The carousels themselves should not be not nested

All other elements are customizable both in structure and class/id nomenclature.

## Configuration

While you can use the default classes already declared in the Article slideshow (which are exactly those listed in the example), you can also declare your own element IDs and classes if needed:

    var my_conf = {
      // Array containing all text, images, titles, etc of slide objects:
      slides: slide_array,

      // Template system for images, slides, and article text:
      templater: new Templater(),

      // Outermost element of the article slideshow:
      wrap: '#article-slideshow-wrapper',

      // Class of inner containers to append various objects:
      containers: {
        article: '.articles',
        images: '.images',
        thumbnail: '.thumbnails',
      },

      // ID's of the carousel elements:
      carousels: {
        image: '#image-carousel',
        article: '#article-carousel',
      },
    };

    var my_article_slideshow = new ArticleSlideshow();
    my_article_slideshow.init(my_conf);

Above is all possible configurable parameters.

## Templater -- make your own templates

You can define your own templates for images, articles, and thumbnails with the `Templater` class. Each template function takes a slide object (see `structs.slide` within `Templater` object for default slide structure). For example, if you wish to create and `article` template, you can do the following:

    var args = {
      article: {

        // All templates have an `html` member function that takes a slide object
        // as an argument and returns an HTML string:
        html: function(s) {
          // See Templater's structs for available slide properties:
          return "<div class='article item'><h1>" + s.text + "</h1></div>";
        },
      },
    };

    var my_templater = new Templater(args);

**Important**: All template sub-items should have the class `item`.

Possible templates are: `image`, `article`, and `thumbnail`.

## Changing animation transitions:

For faster transitions, add the following css:

	.carousel-inner .item {
		-webkit-transition: 0.4s ease-in-out left;
		-moz-transition: 0.4s ease-in-out left;
		-o-transition: 0.4s ease-in-out left;
		transition: 0.4s ease-in-out left;
	}

	.carousel-inner .active,
	.carousel-inner .next,
	.carousel-inner .prev {
		display: block;
	}

Note: You need to re-declare the active classes after the adjusted transitions.

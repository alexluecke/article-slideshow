# Article Slide Show

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

The only important elements to this structure are the following:

- Each carousel needs to have the classes `.article-slideshow` and `.carousel`
- The carousels themselves are not nested

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

    var my_article_slideshow = new ArticleSlideshow(my_conf);

## Templater -- make your own templates

You can define your own templates for images, articles, and thumbnails with the `Templater` class. Each template function takes a slide object (see `Templater().strucuts.slide` for default slide structure). For example, if you wish to create and `article` template, you can do the following:

    var templater_args = {
      article: {

        // All templates have an `html` member function that takes a slide object
        // as an argument and returns an HTML string:
        html: function(s) {
          // See Templater's structs for available slide properties:
          return "<div class='article item'><h1>" + s.text + "</h1></div>";
        },
      },
    };

    var my_templater = new Templater(image_template);

Possible templates are: `image`, `article`, and `thumbnail`.

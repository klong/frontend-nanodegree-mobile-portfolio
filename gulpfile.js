'use strict';

// Include gulp
var gulp = require('gulp');

// Include gulp plugins
var plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
});

// require npm modules
var browserSync = require('browser-sync'),
    del = require('del'),
    runSequence = require('run-sequence'),
    jshintStylish = require('jshint-stylish'),
    htmlStylish = require('htmlhint-stylish'),
    chalk = require('chalk'),
    through2 = require('through2'),
    gulpIf = require('gulp-if');

/* ////////////////////////////////////////////////////////////////////

NOTE: site variable needs to be changed to the url given by 'ngrok http 8080
after running gulp task on local machine

///////////////////////////////////////////////////////////////////////*/

var psi = require('psi'),
    site = 'http://a0a03eb7.ngrok.io/',
    key = '';

////////////////////////////////////////////////////////////////////////

var paths = {
    scripts: ['src/js/*.js', 'src/views/js/*.js'],
    styles: ['src/css/*.css', 'src/views/css/*.css'],
    images: 'src/img/**/*',
    content: ['src/*.html', 'src/views/*.html'],
    assets: 'src/assets/**/*',
    base: 'src'
}

var dist = {
    scripts: 'dist',
    styles: 'dist',
    assets: 'dist',
    content: 'dist'
}

///////////////////////////////////////////////////
// define gulp tasks

function customPlumber () {
    return plugins.plumber({
        errorHandler: function(err) {
            console.log(err.stack);
            this.emit('end');
    }
    });
}

gulp.task('browserSync:dev', function() {
    browserSync({
        server: {
            baseDir: 'src'
        },
        host: 'localhost',
        port: 8080,
        open: false,
        notify: false
    })
});

gulp.task('browserSync:dist', function() {
    browserSync({
        server: {
            baseDir: 'dist'
        },
        host: 'localhost',
        port: 8080,
        open: false,
        notify: false
    })
});

gulp.task('imagesConfig', function () {

  // Make configuration from existing HTML files
  var config = plugins.responsiveConfig('./src/views/images/*.*', {base: paths.base});

  //console.log(config);
  
  return gulp.src('src/views/images/*.*', {base: paths.base})
    // Use config as the responsive configuration
    .pipe(plugins.responsive(config, {
        // Global configuration for all images
        // The output quality for JPEG, WebP and TIFF output formats
        quality: 70,
        // Use progressive (interlace) scan for JPEG and PNG output
        progressive: true,
        // Strip all metadata
        withMetadata: false,
        // don't create enlarged output images if images are already less than the required dimensions.
        errorOnEnlargement: false,
        skipOnEnlargement: true,
        errorOnUnusedConfig: false
        }))  
    .pipe(gulp.dest(dist.images));
});

// images task

gulp.task('images', function() {
  return gulp.src(paths.images, {base: paths.base})
    .pipe(plugins.cached(plugins.imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest(dist.images))
    .pipe(browserSync.reload({
            stream: true
    }))
});

// task to create optimised image assets for site
// settings for site image generation

var pngToJpgSizesConfig = [{      
                height: 75,
                format: 'jpeg',
                rename: {suffix: '_xsmall', extname: '.jpg'}
            }, {
                height: 200,
                format: 'jpeg',
                rename: {suffix: '_small', extname: '.jpg'}
            }, {
                height: 300,
                format: 'jpeg',
                rename: {suffix: '_medium', extname: '.jpg'}
            }, {
                height: 450,
                format: 'jpeg',
                rename: {suffix: '_large', extname: '.jpg'}
            }, {
                height: 750,
                format: 'jpeg',
                rename: {suffix: '_xlarge', extname: '.jpg'}
        }];

var imgSizesConfig = [{      
                height: 75,
                rename: {suffix: '_xsmall'}
            }, {
                height: 200,
                rename: {suffix: '_small'}
            }, {
                height: 300,
                rename: {suffix: '_medium'}
            }, {
                height: 450,
                rename: {suffix: '_large'}
            }, {
                height: 750,
                rename: {suffix: '_xlarge'}
        }];

gulp.task('imagesForSite', function() {
    return gulp.src(paths.images, {base: dist.base})
        .pipe(plugins.debug({title: 'sources:'}))
        .pipe(plugins.cached('imagesForSite'))
        .pipe(plugins.debug({title: 'before gulp-responsive:'}))
        .pipe(plugins.responsive({
      '!wAlpha/*.png': pngToJpgSizesConfig,
      'wAlpha/*.png': imgSizesConfig, 
      '**/*.jpg': imgSizesConfig, 
      }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 80,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Zlib compression level of PNG output format
      compressionLevel: 6,
      // Strip all metadata
      withMetadata: false,
      errorOnEnlargement: false,
      // only make sizes from xsmall to max size without enlarging the original src image
      skipOnEnlargement: true,
      // dont error - will passs through any non-matching image files 
      errorOnUnusedConfig: false   
    }))
    .pipe(plugins.debug({title: 'after responsive:'}))
    // make an assets directory in src and dist directories
    .pipe(gulp.dest('src/assets'))
    }
);

// google page speed insights tasks

gulp.task('mobile', function () {
    return psi(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('desktop', function () {
    return psi(site, {
        //key: key,
        nokey: 'true',
        strategy: 'desktop',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
    });
});

// validate html task

gulp.task('validateHtml', function(){
    gulp.src(paths.content)
        .pipe(plugins.w3cjs())
        .pipe(through2.obj(function(file, enc, cb){
            cb(null, file);
            if (!file.w3cjs.success){
                console.log(chalk.bgRed.bold('HTML validation error(s) found'));
            }
        }));
});

// validate css task

gulp.task('validateCss', function(){
    gulp.src(paths.styles)
        .pipe(plugins.cssValidator())
        .on('error', function(err){
            console.log(chalk.bgRed.bold('CSS validation error(s) found'));
        });
});

// WATCH tasks

gulp.task('watch-content', function() {
    gulp.src(paths.content)
    .pipe(browserSync.reload({
        stream: true
    }))
})

gulp.task('watch-styles', function() {
    gulp.src(paths.styles)
    .pipe(browserSync.reload({
        stream: true
    }))
})

gulp.task('watch-scripts', function() {
    gulp.src(paths.scripts)
    .pipe(browserSync.reload({
        stream: true
    }))
})

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['watch-scripts']);
    gulp.watch(paths.content, ['watch-content']);
    gulp.watch(paths.styles, ['watch-styles']);
});


// Lint Task
gulp.task('lint', function() {
    return gulp.src(paths.scripts, {base: paths.base})
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter('jshint-stylish'))
});

// CLEAN Tasks

gulp.task('build-clean', function() {
  return del('dist/*');
});

gulp.task('cleanCss', function() {
    return gulp.src(paths.styles, {base: paths.base})
// TODO:  task using uncss causes errors
// strip out unused CSS rules for site
            .pipe(plugins.uncss({
                html: [paths.content]
            }))
            .pipe(gulp.dest(dist.styles))
            .pipe(browserSync.reload({
                    stream: true}));
});

// BUILD Tasks

gulp.task('build-scripts', function() {
    return gulp.src(paths.scripts, {base: paths.base})
            .pipe(customPlumber('Error running scripts task'))
            // Minify javascript files
            .pipe(plugins.uglify())
            .pipe(gulp.dest(dist.scripts))
            .pipe(browserSync.reload({
                stream: true
            }))
});

gulp.task('build-styles', function (){
    return gulp.src(paths.styles, {base: paths.base})
        // Minify css files
        .pipe(plugins.cssnano())
        .pipe(gulp.dest(dist.styles))
        .pipe(browserSync.reload({
                    stream: true}));
});

gulp.task('build-html', function() {

  return gulp.src(paths.content, {base: paths.base})
    // inline any js & css resources flaged 'inline' in html file
    .pipe(plugins.debug({title: 'before:'}))
    // inline css file links using 'smoosher comments' in html file
    .pipe(plugins.smoosher())
    // minify html files
    .pipe(plugins.htmlmin(
        {collapseWhitespace: true, removeComments: true, minifyJS: true, minifyCSS: true}
    ))
    // output to dist directory
    .pipe(gulp.dest(dist.content))
    .pipe(browserSync.reload({
        stream: true
    }))
});


gulp.task('build-assets', function() {
    return gulp.src(paths.assets, {base: paths.base})
    .pipe(gulp.dest(dist.assets))
});

// lint JS, validate html & CSS task

gulp.task('validate',
    ['lint', 'validateHtml', 'validateCss']
);

// build task

gulp.task('build', function(callback) {
  runSequence('build-clean',
              ['build-scripts', 'build-styles'],
              'build-html',
              'build-assets',
              callback);
});

// default task - run with command 'gulp'

gulp.task('default', ['browserSync:dev', 'watch']);


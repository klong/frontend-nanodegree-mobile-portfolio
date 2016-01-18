##Udacity Front End Developer NanoDegree
##Project 4:
##mobile portfolio - Website Performance Optimization

####What's needed before you Install?

###npm (Node.js)
your local machine must node.js installed to allow the npm package manager to run:

to check if you already have it installed open a terminal and type:

`npm -v`

 if this returns a version number (like '2.14.1'), you're fine.

 If you get an error instead,  you will have to install Node.js on to the local machine;

* #####[npm homepage](https://www.npmjs.com/)

* #####[Download a Node.js installer](https://nodejs.org/en/download/)


##Install

####clone the git repository to your local machine;

open a terminal where you want to clone to on your local machine
then type:

`git clone "https://github.com/klong/frontend-nanodegree-mobile-portfolio.git"`

navigate into the 'frontend-nanodegree-mobile-portfolio' directory

`cd frontend-nanodegree-mobile-portfolio`

####Installing the required npm packages

the easiest way to add the npm packages is to type in the terminal:

`npm install`

if you are on linux this should complete sucessfully, adding the npm packages to a new folder called `node_modules`
(I developed this on a Fedora 23 laptop)

If you are on mac OSX, I had problems with using the default `npm install` installation method

This is because of a npm package called **'gulp-responsive'** that uses a code library called **sharp** to create optimized images.

So, the best way to install on OS X is to install the library dependencies for **sharp** before running **npm install**

`brew install homebrew/science/vips --with-webp --with-graphicsmagick`

and when this long process ends;

`npm install sharp`

Then run the general `npm install` command to add the npm packages needed ;

`npm install`

Sorry, I haven't tested this build process on a windows pc. (Please let me know if it works, so I can udate this README file)

####After `npm install`  stage completes sucessfully

you will see a new direcory in the repo called `node_modules`

##Serve up the optimized `index.html` page

type:

`gulp`

you should see something like this:

![defaul_gulp_dist](https://cloud.githubusercontent.com/assets/131895/12380742/401b381e-bd72-11e5-804b-cf34ddb6f1b5.png)

**note:** the default gulp task is serving the web pages from the optimised build directory 'dist' (not from the 'src' directory').

Also, the terminal is **'watching'** so you can't type any more commands into it while the task is running.

using a **google chrome browser** go to the local web address to see the page:

http://localhost:8080/

![localhost](https://cloud.githubusercontent.com/assets/131895/12380487/0079dec8-bd6c-11e5-84f5-bc5b84b88b9f.png)


##Part 1: Optimize the Google PageSpeed Insights score for index.html

1. Open a browser and visit localhost:8080
1. Download and install [ngrok](https://ngrok.com/) to make your local server accessible remotely.

  in a new terminal type:

  `ngrok http 8080`

![ngrok](https://cloud.githubusercontent.com/assets/131895/12380574/dce9dba0-bd6d-11e5-8f7a-be409dff8072.png)
use google chrome to view the `forwarding address`

**note:** when you run it it will be given a different web address.

You can use this for input at the ;

####[google page speed insights website](https://developers.google.com/speed/pagespeed/insights/)

An example result from my ngrok address.

Mobile Speed: ****97****, User experience: 100          |  Desktop speed: ****98****
:-------------------------:|:-------------------------:
![ngrok_mobile](https://cloud.githubusercontent.com/assets/131895/12380670/68335d56-bd70-11e5-9eb4-963b109683ba.png)  |  ![ngrok_desktop](https://cloud.githubusercontent.com/assets/131895/12380669/681dc2b6-bd70-11e5-849c-4e82493b5996.png)

##`index.html` optimisations :

* created an 'offline' gulp task `imagesForSite` to create resized and optimized images in an `asset` directory within the `src` directory. This directory is copied over to the `dist` directory using the gulp task - `build`.
* minified & inlined externaly linked but critical fonts, CSS and javascript files. (see the `build-html` gulp task in `gulpfile.js`)
* used script `asyn` attribute for linked javascript files `analytics.js` and `perfmatters.js`.
* minified `index.html` (removed comments & whitespace)
* capitalizing the random-pizza names by using a `"pizzaName"` class CSS rule instead of javascript in `main.js`.


##Part 2: Optimize Frames per Second in `views/pizza.html` & `views/js/main.js`

To optimize `views/pizza.html`, you will need to modify `views/js/main.js` until your frames per second rate is 60 fps or higher.

##`pizza.html` optimisations :
* used 'offline' gulp task `imagesForSite` to build resized and optimized image assets (compressed `.jpg` and `.png` images with alpha).
* minified `pizza.html` (removed comments & whitespace), CSS and javascript files using gulp task `build`.

##`main.js` optimisations :
most of the optimizations needed to improve the frame per seconds of the `pizza.html` page are within the javascript of `main.js`. See comments in `src/views/js/main.js` for more examples.

* optimized expensive javascript operations and DOM selection calls inside for-loops within functions, to help increase the speed of both the initial `randomPizzas` and `mover` elements being added to the DOM and the  (low frames per second performance) 'janky' resizing and animation.
* reduced the number of 'mover' class objects created from 200 to a smaller amount (approx 30-50) based on the browser window size.
* used style `transformX()` to animate the `mover` class objects as it is a composite-only operation and is GPU accelerated on some browsers. Added a CSS `will-change: transform` rule to the `mover` class for further look-ahead type browser optimisations ;

##Also done as part of the project:
* used `npm` package manager and `Gulp` task runner to help automate some of the development tasks, such as, the building of optimized assets and a `dist` site, using using `ngrok` and `gulp` tasks for pagespeed insight rating, using `browser-sync` and `watch` to create a more dynamic feedback within the browser, help validate the html and CSS before submitting the project

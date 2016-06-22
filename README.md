# Membership Matrix

### To run locally

Initial set-up (assuming you have [Bundler](http://bundler.io/) installed):

    bundle install

Then, to serve the site:

    bundle exec ruby app.rb

The site will be available at http://localhost:4567/

### Note about DataTables

This project includes a custom build of the DataTables jQuery plugin. See `/public/javascript/vendor/datatables.min.js` for a download link replicating the build.

For reference, in addition to the stock DataTables scripts and styles, the following were included in the build:

* Bootstrap styling (without library)
* FixedColumns extension
* FixedHeader extension

### Running tests

First, you should make sure that mocha, chai and mocha-phantomjs
are installed, which you can do with:

    npm install

That will install those packages into `node_modules`. Then you
have two options to run the tests:

1. Open `public/tests.html` in a browser; this will run the
   tests in your browser and output the results on that page.

2. Run `npm test`; this will use PhantomJS (a headless browser)
   to run the tests from the command line.

Travis is set up to run the tests automatically. You can see the
recent [test runs on Travis](https://travis-ci.org/everypolitician/membership_matrix/builds).

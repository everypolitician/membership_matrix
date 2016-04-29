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

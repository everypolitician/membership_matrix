# Membership Matrix

### To run locally

Initial set-up (assuming you have [Bundler](http://bundler.io/) installed):

    bundle install --path vendor/bundle --binstubs vendor/bin

(The custom `--path` and `--binstubs` values will be stored in `.bundle/config` so you don’t need to specify them again when updating the gems in future with `bundle install`.)

Then, to serve the site:

    ./vendor/bin/jekyll serve

The site will be available at http://0.0.0.0:4000/membership_matrix/

### Note about DataTables

This project includes a custom build of the DataTables jQuery plugin. See `/assets/javascript/vendor/datatables.min.js` for a download link replicating the build.

For reference, in addition to the stock DataTables scripts and styles, the following were included in the build:

* Bootstrap styling (without library)
* FixedColumns extension
* FixedHeader extension

# Post editor UI prototype

### To run locally

Initial set-up (assuming you have [Bundler](http://bundler.io/) installed):

    bundle install --path vendor/bundle --binstubs vendor/bin

(The custom `--path` and `--binstubs` values will be stored in `.bundle/config` so you don’t need to specify them again when updating the gems in future with `bundle install`.)

Then, to serve the site:

    cd post-editor
    ../vendor/bin/jekyll serve

The site will be available at http://0.0.0.0:4000

require 'bundler/setup'
require 'sinatra'
require 'tilt/erb'
require 'tilt/liquid'
require 'tilt/sass'

get '/' do
  erb :layout, layout: false do
    liquid :index
  end
end

get '/css/main.css' do
  scss :main
end

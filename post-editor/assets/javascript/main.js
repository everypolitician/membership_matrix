$(function(){
  var $list = $('.list-inline');
  $list.append('<li>&bull; jQuery loaded</li>');
  if ('dropdown' in $list) {
    $list.append('<li>&bull; Bootstrap.js loaded</li>');
  }
});
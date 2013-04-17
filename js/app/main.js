define([
  './columns',
  'dgrid/Grid',
  'dojo/request',
  'xstyle/css!dgrid/css/skins/tundra.css',
  'dojo/domReady!'
], function(columns, Grid, request){

  'use strict';

  var comparisonGrid = new Grid({
    columns: columns
  }, 'grid');

  comparisonGrid.startup();

  request.get('features.json', {
    handleAs: 'json'
  }).then(function(data){
    comparisonGrid.renderArray(data);
  });

});
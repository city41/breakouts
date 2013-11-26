define([
  'put-selector/put'
], function(put){

  'use strict';

  function checkmark(value){
    return (value && '&#10003;') || '-';
  }

  function createColumn(label){
    /* jshint eqnull: true */
    return {
      label: label === 'feature' ? ' ' : label,
      sortable: false,
      renderCell: function(rowData, cellData, cellElement){
        // TODO: renderCell could probably be cleaned up some (early returns, less if branching?)
        if(Object.keys(rowData).length === 1){
          put(cellElement, '.section-header');
        }
        if(cellData == null){
          return;
        }
        var cellValue;
        if(typeof cellData === 'object'){
          if(cellData.plugin){
            cellValue = '<a href="' + cellData.plugin + '">P</a>';
          } else {
            cellValue = checkmark(cellData.value) + ' (' + cellData.info + ')';
          }
        } else if(typeof cellData === 'boolean'){
          cellValue = checkmark(cellData);
        } else {
          cellValue = cellData;
        }

        put(cellElement, {
          innerHTML: cellValue
        });
      }
    };
  }

  var columns = {
    'feature': createColumn('feature'),
    'crafty': createColumn('Crafty'),
    'frozen': createColumn('Frozen'),
    'impact': createColumn('Impact'),
    'lime': createColumn('Lime'),
    'melon': createColumn('MelonJS'),
    'platypus': createColumn('Platypus'),
    'quintus': createColumn('Quintus')
  };

  return columns;

});

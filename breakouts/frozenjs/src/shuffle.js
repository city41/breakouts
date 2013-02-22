//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
define([

], function(){

  function arrayShuffle(theArray) {
    var len = theArray.length;
    var i = len;
     while (i--) {
      var p = parseInt(Math.random()*len, 10);
      var t = theArray[i];
        theArray[i] = theArray[p];
        theArray[p] = t;
    }
  }

  return arrayShuffle;
});
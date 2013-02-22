define([

], function(){
  return function(arr, item){
    var retVal = [];
    for (var i = 0; i < arr.length; i++) {
      if(arr[i].id !== item.id){
        retVal.push(arr[i]);
      }
    }
    return retVal;
  };
});
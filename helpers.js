exports.aEach = function(array, fn, callback) {
    var completed = 0;
    if(array.length === 0) {
    	callback();
    }
    for(var i = 0; i < array.length; i++) {
      fn(array[i], function(result, err) {
          completed++;
          if(completed === array.length) {
            callback(result, err);
          }
        });
    }
};


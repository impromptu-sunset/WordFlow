app.service('ColorIndexService', function() {

  var currentColorIndex;

  return {
    get: function() {
      return currentColorIndex;
    },
    set: function(value) {
      currentColorIndex = value;
    }
  }
});
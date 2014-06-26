define(function(require) {

  var Origin = require('coreJS/app/origin');
  var ModalView = require('coreJS/modal/views/modalView');
  var ModalModel = require('coreJS/modal/models/modalModel');

  Origin.on('modal:open', function(modalObject) {
    addModalView(modalObject);
  });

  function addModalView(modalObject) {
    new ModalView({
      model: new ModalModel(modalObject)
    });
  };

});

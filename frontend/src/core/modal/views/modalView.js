define(function(require) {

  var Origin = require('coreJS/app/origin');

  var ModalView = Backbone.View.extend({

    className: 'modal',

    initialize: function() {
      this.listenTo(Origin, 'remove', this.remove);
      this.listenTo(Origin, 'device:resize', this.resetModalSize);
      this.listenTo(Origin, 'modal:close', this.closeModal);
      this.listenTo(Origin, 'modal:passThrough', this.onModalPassThrough);
      this.render();
    },

    events: {
      'click .modal-popup-prompt-button': 'onPromptButtonClicked',
      'click .modal-popup-done': 'onCloseButtonClicked'
    },

    render: function() {
      var data = this.model.toJSON();
      var template = Handlebars.templates['modal'];
      this.$el.html(template(data)).appendTo('body');
      if (this.model.get('view')) {
        this.$('.modal-popup-view-inner').append(this.model.get('view').$el);
        // Wait for append to complete...
        _.defer(
          _.bind(function(){
            this.showModal();
          }, this)
        );
      } else {
        this.showModal();
      }
      
      return this;
    },

    onModalPassThrough: function (data) {
      data.model.set('_modalProps', this.model);
      Origin.trigger(data.eventToTrigger, data.model);
      this.closeModal();
    },

    onPromptButtonClicked: function(event) {
      event.preventDefault();
      var eventToTrigger = $(event.currentTarget).attr('data-event');

      if (eventToTrigger) {
        Origin.trigger(eventToTrigger);
      }

      this.closeModal();
    },

    onCloseButtonClicked: function(event) {
      event.preventDefault();
      Origin.trigger('modal:closed');
      this.closeModal();
    },

    resetModalSize: function() {
      $('.modal-popup').removeAttr('style');
      this.resizeModal(true);
    },

    resizeModal: function(noAnimation) {
      var windowHeight = $(window).height();
      var modalHeight = this.$('.modal-popup').height();
      var animationSpeed = 400;
      if (modalHeight > windowHeight) {
        this.$('.modal-popup').css({
          'height':'100%', 
          'top':0, 
          'overflow-y': 'scroll', 
          '-webkit-overflow-scrolling': 'touch',
          'opacity': 1
        });
      } else {
        if (noAnimation) {
          var animationSpeed = 0;
        }
        this.$('.modal-popup').css({
          'margin-top': -(modalHeight/2)-50, 'opacity': 0
        }).velocity({
          'margin-top': -(modalHeight/2), 'opacity':1
        }, animationSpeed);
      }
    },

    showModal: function() {
      this.resizeModal();
      this.$('.modal-popup').show();
      this.$('.modal-shadow').fadeIn('fast');
    },

    closeModal: function (event) {
      this.$el.fadeOut('fast', _.bind(function() {
        this.remove();
      }, this));

      // Clean up our injected view if needed
      if (this.model.get('view')) {
        this.model.get('view').remove();
      }
      Origin.trigger('popup:closed');
    }

  });

  return ModalView;

});

define(function(require) {

  var Backbone = require('backbone');
  var Origin = require('coreJS/app/origin');
  var EditorOriginView = require('editorGlobal/views/editorOriginView');
  var JsonEditor = require('core/libraries/jquery.jsoneditor.min');
  var AssetManagementView = require('coreJS/assetManagement/views/assetCollectionView');

  var EditorComponentEditView = EditorOriginView.extend({

    tagName: "div",

    className: "project",

    events: {
      'click .editing-overlay-panel-title'        : 'toggleContentPanel',
      'click input[name="root[_graphic][large]"]' : 'launchAssetModal'
    },

    preRender: function() {
      this.jsoneditor = false;
      this.listenTo(Origin, 'editorComponentEditSidebar:views:save', this.saveComponent);
      this.model.set('ancestors', this.model.getPossibleAncestors().toJSON());
      this.listenTo(Origin, 'assetModal:assetSelected', this.assetSelected);
    },

    toggleContentPanel: function(event) {
      event.preventDefault();
      if (!$(event.currentTarget).hasClass('active')) { 
        this.$('.editing-overlay-panel-title').removeClass('active');
        $(event.currentTarget).addClass('active')
        this.$('.editing-overlay-panel-content').slideUp();
        $(event.currentTarget).siblings('.editing-overlay-panel-content').slideDown();
      }
    },

    postRender: function() {
      // Get the schema
      var thisComponentTypeId = this.model.get('_componentType')._id; 
      var componentType = _.find(Origin.editor.componentTypes.models, function(type){
        return type.get('_id') == thisComponentTypeId; 
      });

      var schema =  {
        "type": "object",
        "properties": componentType.get('properties')
      };

      var element = document.getElementById('component-properties');
      this.jsoneditor = new JSONEditor(element, {
        no_additional_properties: true, 
        disable_array_reorder: true,
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        form_name_root: 'root',
        schema: schema,
        startval: this.model.get('properties') 
      });

    },

    cancel: function (event) {
      event.preventDefault();
      Origin.trigger('editorSidebarView:removeEditView', this.model);
    },

    saveComponent: function() {

      var propertiesJson = this.jsoneditor.getValue();

      var model = this.model;

      model.save({
        _parentId: this.$('.component-parent').find(':selected').val(),
        _componentType: model.attributes._componentType._id, // TODO -- Not sure about the schema here
        title: this.$('.setting-title').val(),
        displayTitle: this.$('.setting-displaytitle').val(),
        body: tinyMCE.get('setting-body').getContent(),
        properties: propertiesJson},
        {
          error: function() {
            alert('An error occurred doing the save');
          },
          success: _.bind(function() {
            Origin.trigger('editingOverlay:views:hide');
            Origin.trigger('editorView:fetchData');
            Backbone.history.history.back();
            this.remove();
          }, this)
        }
      );
    },

    launchAssetModal: function(e) {
      var props = {
        title: 'Asset Manager',
        body: 'Select an Asset',
        view: new AssetManagementView(),
        triggerElement: $(e.currentTarget)
      };
      Origin.trigger('modal:open', props);
    },

    assetSelected : function(asset) {
      var modalProps = asset.get('_modalProps');
      var fieldname = modalProps.get('triggerElement').attr('name');
      var file = asset.get('path');
      var editor = this.jsoneditor.getEditor(this.fieldnameToReference(fieldname));
      editor.setValue(file);
    },

    fieldnameToReference: function (fieldname) {
      // Eg: convert root[_graphic][large] to root._graphic.large
      var reference = fieldname.replace("][", ".");
      reference = reference.replace("]", "");
      reference = reference.replace("[", ".");
      return reference;
    }
  },
  {
    template: 'editorComponentEdit'
  });

  return EditorComponentEditView;

});

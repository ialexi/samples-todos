// ==========================================================================
// Project:   Todos.tasksController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  (Document Your Controller Here)

  @extends SC.ArrayController
*/
Todos.tasksController = SC.ArrayController.create(SC.CollectionViewDelegate,
/** @scope Todos.tasksController.prototype */ {

  summary: function() {
    var len = this.get('length'), sel = this.get('selection'), ret ;

    if (len && len > 0) {
      ret = len === 1 ? "1 task" : "%@ tasks".fmt(len);
    } else ret = "No tasks";
    
    if (sel && sel > 0) {
      ret = ret + " (%@ selected)".fmt(sel.get('length'));
    }
    return ret ;
  }.property('length', 'selection').cacheable(),
  
  addTask: function() {
      var task;

      // create a new task in the store
      task = Todos.store.createRecord(Todos.Task, {
        "description": "New Task", 
        "isDone": false
      });

      // select new task in UI
      this.selectObject(task);

      // activate inline editor once UI can repaint
      this.invokeLater(function() {
        var contentIndex = this.indexOf(task);
        var list = Todos.mainPage.getPath('mainPane.middleView.contentView');
        var listItem = list.itemViewForContentIndex(contentIndex);
        listItem.beginEditing();
      });

      return YES;
    },
    
    collectionViewDeleteContent: function(view, content, indexes) {
      // destroy the records
      var records = indexes.map(function(idx) {
        return this.objectAt(idx);
      }, this);
      records.invoke('destroy');

      var selIndex = indexes.get('min')-1;
      if (selIndex<0) selIndex = 0;
      this.selectObject(this.objectAt(selIndex));
    }

}) ;

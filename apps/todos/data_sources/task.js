// ==========================================================================
// Project:   Todos.TaskDataSource
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Todos,Pomona */
sc_require('models/task');
Todos.TASKS_QUERY = SC.Query.local(Todos.Task, {
  orderBy: 'isDone,description'
});


/** @class

  Data source for Tasks

  @extends SC.DataSource
*/
Todos.TaskDataSource = SC.DataSource.extend(
/** @scope Todos.TaskDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 
  init: function(){
    // needs proxy /comet/ to dobby
    this.firenze = Pomona.Firenze.create({
      connectUrl: "/tasks/connect/%@",
      disconnectUrl: "/tasks/disconnect/%@"
    });
    
    this.firenze.connect("tasks", this, "taskReceived");
  },
  
  taskReceived: function(path, message) {
    if (message.trim() === "") return;
    var data = JSON.parse(message);
    
    // handle delete
    if (data.DELETE) {
      Todos.store.pushDestroy(Todos.Task, data.guid);
    } else Todos.store.loadRecords(Todos.Task, [data]);
  },

  fetch: function(store, query) {

    if (query === Todos.TASKS_QUERY) {
      SC.Request.getUrl('/tasks').json()
        .notify(this, 'didFetchTasks', store, query)
        .send();
      return YES;
    }

    return NO;
  },

  didFetchTasks: function(response, store, query) {
    if (SC.ok(response)) {
      store.loadRecords(Todos.Task, response.get('body').content);
      store.dataSourceDidFetchQuery(query);

    } else store.dataSourceDidErrorQuery(query, response);
  },

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {

      var url = store.idFor(storeKey);
      SC.Request.getUrl(url).json()
        .notify(this, 'didRetrieveTask', store, storeKey)
        .send();
      return YES;

    } else return NO;
  },

  didRetrieveTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var dataHash = response.get('body').content;
      store.dataSourceDidComplete(storeKey, dataHash);

    } else store.dataSourceDidError(storeKey, response);
  },
  
  createRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {

      SC.Request.postUrl('/tasks').json()
        .notify(this, this.didCreateTask, store, storeKey)
        .send(store.readDataHash(storeKey));
      return YES;

    } else return NO;
  },

  didCreateTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = response.get("body").content;
      store.dataSourceDidComplete(storeKey, data, data.guid); // update url

    } else store.dataSourceDidError(storeKey, response);
  },
  
  updateRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {
      SC.Request.putUrl(store.idFor(storeKey)).json()
        .notify(this, this.didUpdateTask, store, storeKey)
        .send(store.readDataHash(storeKey));
      return YES;

    } else return NO ;
  },
  didUpdateTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = response.get('body');
      if (data) data = data.content; // if hash is returned; use it.
      store.dataSourceDidComplete(storeKey, data) ;

    } else store.dataSourceDidError(storeKey); 
  },

  // ..........................................................
  // DESTROY RECORDS
  // 

  destroyRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {
      SC.Request.deleteUrl(store.idFor(storeKey)).json()
        .notify(this, this.didDestroyTask, store, storeKey)
        .send();
      return YES;

    } else return NO;
  },
  didDestroyTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidDestroy(storeKey);
    } else store.dataSourceDidError(response);
  }
  
}) ;

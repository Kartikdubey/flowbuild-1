'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.fgCache
 * @description
 * # fgCache
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('fgCache', function(Subscriber, $rootScope) {

    var post    = {};     // (base,UI) ready for HTTP POST
    var update  = {};     // (base,UI) ready for HTTP UPDATE
    var _delete = {};     // base ready for HTTP DELETE
    var names   = {};

    /* get - retrieve a list of names from the cahce or server */
    function get(type, name, service, callback) {

      // Initialize the retrievable caches
      if(!(type in post))   { post[type] = {}; }
      if(!(type in update)) { update[type] = {}; }
      if(!(type in _delete)){ _delete[type] = {}; }

      //  Return the object if local or get from server
      if(name in post[type]) {
        callback(null, post[type][name]);
      } else if(name in update[type]) {
        callback(null, update[type][name]);
      } else if(name in _delete[type]){
        callback(name + ' has been staged to be deleted');
      } else {
        Subscriber.httpGet('/api/'+type+'/'+name, {}, function(err, result) {
          if(err) {
            callback(err);
          } else {
            update[type][name] = service.createUI(result);
            callback(null, update[type][name]);
          }
        });
      }
    }

    function getNames(type, callback) {
      // initialize the cache
      if(!(type in post))   { post[type]   = {}; }
      if(!(type in update)) { update[type] = {}; }
      if(!(type in _delete)){ _delete[type] = {}; }
      if(!(type in names))  { names[type]  = []; }

      if(Object.keys(post[type]).length || Object.keys(_delete[type]).length) {
        names[type] = _.union(names[type], Object.keys(post[type]));
        names[type] = _.reject(names[type], function(name){
          return name in Object.keys(_delete[type]);
        });
        callback(null, names[type]);
      } else {
        Subscriber.httpGet('/api/'+type, {}, function(err, result) {
          if(err) {
            callback(null, names[type]);
          } else {
            names[type] = _.union(names[type], result.names);
            callback(null, names[type]);
           }
        });
      }
    }

    function create(type, name, service, initialValue) {
      // initialize the cache
      if(!(type in post)) { post[type] = {}; }

      post[type][name] = service.createUI(name, initialValue);
      post[type][name].dirty = true;
      $rootScope.$broadcast('assetUpdate');
      return post[type][name];
    }

    function destroy(type, name) {
      // initialize the cache
      if(!(type in post))    { post[type] = {}; }
      if(!(type in update))  { update[type] = {}; }
      if(!(type in _delete)) { _delete[type] = {}; }
      // was never saved
      if(post[type][name]) {
        delete post[type][name];
      } else if(update[type][name]) {
        _delete[type][name] = update[type][name];
        delete update[type][name];
      } else {
        _delete[type][name] = true;
      }
      $rootScope.$broadcast('dirtyCache');
      $rootScope.$broadcast('assetUpdate');
    }

    function isDirty() {
      var postDirty, updateDirty, deleteDirty;

      // If there is anything to post we are dirty
      postDirty = _.some(post, function(type) {
        return Object.keys(type).length > 0;
      });

      // If there is any update that is dirty we are dirty
      updateDirty = false;
      _.each(update, function(_update) {
        updateDirty = updateDirty || _.some(_update, function(value) {
          return value.dirty;
        });
      });

      // If there is anything to delete we are dirty
      deleteDirty = _.some(_delete, function(type) {
        return Object.keys(type).length > 0;
      });
      // If anything is dirty the cache is dirty
      return postDirty || updateDirty || deleteDirty;
    }

    function save() {
      _.each(post, function(_post, type) {
        _.each(_post, function(value, key) {
          // Set dirty to false before save
          post[type][key].dirty = false;
          var obj = post[type][key].toBase();
            Subscriber.httpPost('/api/'+type+'/'+key, obj,
                                function(err) {
              if(err) {
                // in case save fails
                $rootScope.$broadcast('dirtyCache');
                post[type][key].dirty = true;
                console.log(err.details);
              } else {
                update[type][key] = post[type][key];
                delete post[type][key];
              }
            });
        });
      });
      _.each(update, function(_update, type) {
        _.each(_update, function(value, key) {
          var obj;
          if(update[type][key].dirty) {
            //set dirty to false before save
            update[type][key].dirty = false;
            obj = update[type][key].toBase();
            Subscriber.httpUpdate('/api/'+type+'/'+key, obj,
                                  function(err) {
              if(err) {
                // in case save fails
                $rootScope.$broadcast('dirtyCache');
                update[type][key].dirty = true;
              }
            });
          }
        });
      });
      _.each(_delete, function(__delete, type) {
        _.each(__delete, function(value, key) {
          Subscriber.httpDelete('/api/'+type+'/'+key, {},
                                function(err) {
            if(err) {
              $rootScope.$broadcast('dirtyCache');
              console.log(err.details);
            } else {
              delete _delete[type][key];
            }
          });
        });
      });
    }

    function clear() {
      post = {};
      update = {};
      _delete = {};
    }

    return {
      get: get,
      getNames: getNames,
      create: create,
      destroy: destroy,
      isDirty: isDirty,
      save: save,
      clear: clear
    };
  });

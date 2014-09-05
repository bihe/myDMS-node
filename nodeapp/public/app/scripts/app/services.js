'use strict';

/* Services */

/**
 * simple state service just to hold the state of some scope entries
 */
mydmsApp.factory('stateService', [function(formData) {
  function StateService() {
    this.state = {};
    this.init = false;
  }

  StateService.prototype = {
    getInit: function() {
      return this.init;
    },

    get: function() {
      return this.state;
    },

    set: function(formData) {
      this.init = true;
      this.state = formData;
    }
  };

  var stateService = new StateService();
  return stateService;

}]);

/**
 * Backend service encapsulates all interaction with the backend service
 */
mydmsApp.factory('backendService', ['$http', function($http) {
  
  // save a dcouemnt create/update
  function _saveDocument(postData, type) {
    return $http({
      url: './api/1.0/document/',
      method: type,
      data: postData,
      headers: {'Content-Type': 'application/json'}
    });
  }

  return {
    /**
     * retrieve all documents
     * @returns the angularjs promise object 
     */
    getDocuments: function() {
      return $http.get('./api/1.0/documents');
    },

    /**
     * retrieve all senders
     * @returns the angularjs promise object 
     */
    getSenders: function() {
      return $http.get('./api/1.0/senders');
    },

    /**
     * retrieve all tags
     * @returns the angularjs promise object 
     */
    getTags: function() {
      return $http.get('./api/1.0/tags');
    },

    /**
     * search for documents 
     * @param searchObject {object} - search terms for documents
     * @param selectedTags {object} - selected tags object
     * @param page {int} - the result-page to fetch
     * @param skip {int} - skip the number of results
     * @param maxResults {int} - the max number of results to return per page
     * @returns the angularjs promise object 
     */
    searchDocuments: function(searchObject, selectedTags, page, skip, maxResults) {
      var query = '';
      if(searchObject.term) {
        query += '&t=' + searchObject.term;
      }
      if(searchObject.dateFrom) {
        query += '&df=' + searchObject.dateFrom;
      }
      if(searchObject.dateTo) {
        query += '&dt=' + searchObject.dateTo;
      }
      if(searchObject.sender) {
        query += '&sender=' + searchObject.sender._id;
      }
      if(searchObject.tag) {
        query += '&tag=' + searchObject.tag._id;
      }
      query += '&limit=' + maxResults;
      query += '&skip=' + skip;

      return $http.get('./api/1.0/documents?a=b' + query);
    },

    /**
     * handle settings entries
     * @param postData {object} - the data to transmit to the backend service
     * @returns the angularjs promise object 
     */
    processSettings: function(postData) {
      return $http({
        url: './api/1.0/settings/',
        method: 'POST',
        data: postData,
        headers: {'Content-Type': 'application/json'}
      });
    },

    /**
     * fetch a specific document
     * @param id {objectId} - id of the document
     * @returns the angularjs promise object 
     */
    getDocumentById: function(id) {
      return $http.get('./api/1.0/document/' + id);
    },

    /**
     * update a given document
     * @param postData {object} - the data to transmit to the backend service
     * @returns the angularjs promise object 
     */
    updateDocument: function(postData) {
      return _saveDocument(postData, 'PUT');
    },

    /**
     * update a given document
     * @param postData {object} - the data to transmit to the backend service
     * @returns the angularjs promise object 
     */
    createDocument: function(postData) {
      return _saveDocument(postData, 'POST');
    },

    /**
     * delete the document with the given id
     * @param id {ObjectId} the id of the document
     * @returns the angularjs promise object 
     */
    deleteDocument: function(id) {
      return $http.delete('./api/1.0/document/' + id);
    }
  };
}]);
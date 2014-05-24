  'use strict';


function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * @see http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
 */
function hashCode(str){
  var hash = 0, i, char;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 *
 * @see http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

angular.module('mydmsApp')
    .directive('activeMenu', ['$translate', function($translate) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs, controller) {
                var language = attrs.activeMenu;

                scope.$watch(function() {
                    return $translate.use();
                }, function(selectedLanguage) {
                    if (language === selectedLanguage) {
                        element.addClass('active');
                    } else {
                        element.removeClass('active');
                    }
                });
            }
        };
    }])
    .directive('activeLink', ['$location', function(location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs, controller) {
                var clazz = attrs.activeLink;
                var path = attrs.href;
                path = path.substring(1); //hack because path does bot return including hashbang
                scope.location = location;
                scope.$watch('location.path()', function(newPath) {
                    if (path === newPath) {
                        element.addClass(clazz);
                    } else {
                        element.removeClass(clazz);
                    }
                });
            }
        };
    }])
    // found here: http://stackoverflow.com/questions/10931315/how-to-preventdefault-on-anchor-tags-in-angularjs
    .directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                    elem.on('click', function(e){
                        e.preventDefault();
                        if(attrs.ngClick){
                            scope.$eval(attrs.ngClick);
                        }
                    });
                }
            }
        };
    })
    // found here: https://github.com/paolodm/angular-selectize/blob/master/angular-selectize.js
    .directive('selectize', ['$timeout', '$http', '_', function($timeout, $http, _) {
        return {
            // Restrict it to be an attribute in this case
            restrict: 'A',
            scope: {
              selectedObject: '='
            },
            // responsible for registering DOM listeners as well as updating the DOM
            link: function(scope, element, attrs) {
                var currentData, found, text, item, index, list;
                // the magic is to wait!!
                // until the necessary scope-objects are loaded. Once done start the selectize logic
                scope.$watch('selectedObject', function(value){
                    if (!value) return;

                    $timeout(function() {
                        $(element).selectize({
                            valueField: '_id',
                            labelField: 'name',
                            searchField: 'name',
                            persist: false,
                            create: function(input) {
                                var id = 0;
                                id = getRandomInt(1, 99);
                                id *= hashCode(input);
                                if(id > 0) {
                                    id *= (-1);    
                                }
                                return {
                                    _id: id,
                                    name: input
                                };
                            },
                            render: {
                                item: function(item, escape) {
                                    var s = attrs.label;
                                    s = replaceAll('{name}', item.name, s);
                                    return s;
                                }
                            },
                            load: function(query, callback) {
                                if (!query.length) return callback();

                                $http.get(attrs.remote + encodeURIComponent(query))
                                .success(function(data) {
                                  currentData = data;
                                  callback(data);
                                })
                                .error(function(data, status, headers, config) {
                                  // called asynchronously if an error occurs
                                  // or server returns response with an error status.
                                  callback();
                                });
                            },
                            onInitialize: function() {
                                var self = this;
                                if(scope.selectedObject) {
                                    // preset the elements!
                                    _.forEach(scope.selectedObject, function(o) {
                                        self.options[o._id] = o;
                                        self.addItem(o._id);                                    
                                    });
                                }
                            },
                            onItemAdd: function(value, $item) {
                                item = _.find(currentData, function(i) {
                                    return i._id === value;
                                });
                                text = $item.attr('data-text');

                                if(!item && value <= -1) {
                                    item = {name: text, _id: value};
                                }
                                
                                if(item) {
                                    scope.$apply(function () {
                                        
                                        if(!scope.selectedObject) {
                                            scope.selectedObject = [];
                                        }

                                        // check if the entry was already added to the list
                                        found = _.find(scope.selectedObject, function(o) {
                                            return o._id === value;
                                        });
                                        if(!found) {
                                            scope.selectedObject.push(item);                               
                                        }
                                    });  
                                }
                            },
                            onItemRemove: function(value) {
                                console.log(value);

                                scope.$apply(function () {
                                    
                                    // check if the entry was already added to the list
                                    found = _.find(scope.selectedObject, function(o) {
                                        return o._id === value;
                                    });
                                    if(found) {
                                        index = scope.selectedObject.indexOf(found);
                                        if(index > -1) {
                                            list = scope.selectedObject.splice(index, 1);
                                        }                                   
                                    }
                                });  
                            }
                        });
                    });

                });
                
            }
        };
    }]);

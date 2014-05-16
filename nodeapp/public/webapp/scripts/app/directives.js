'use strict';


function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
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
    .directive('selectize', ['$timeout', '$http', function($timeout, $http) {
        return {
            // Restrict it to be an attribute in this case
            restrict: 'A',
            scope: {
              selectedObject: '=',
              callbackNew: '&'
            },
            // responsible for registering DOM listeners as well as updating the DOM
            link: function(scope, element, attrs) {
                $timeout(function() {
                    $(element).selectize({
                        valueField: '_id',
                        labelField: 'name',
                        searchField: 'name',
                        persist: false,
                        create: function(input) {
                            return {
                                _id: input,
                                name: input
                            }
                        },
                        render: {
                            item: function(item, escape) {
                                var s = attrs.label;
                                s = replaceAll('{_id}', item._id, s);
                                s = replaceAll('{name}', item.name, s);
                                return s;
                            }
                        },
                        load: function(query, callback) {
                            if (!query.length) return callback();

                            $http.get(attrs.remote + encodeURIComponent(query))
                            .success(function(data) {
                              callback(data);
                            })
                            .error(function(data, status, headers, config) {
                              // called asynchronously if an error occurs
                              // or server returns response with an error status.
                              callback();
                            });
                        },
                        onItemAdd: function(value, $item) {
                            console.log($item);

                            scope.$apply(function () {
                                var text = $item.attr('data-text');
                                scope.selectedObject = { title: text, originalObject: { _id: value, name: text}};
                                scope.callbackNew({text: text});
                            });
                        },
                        onItemRemove: function(value) {
                            console.log(value);
                        }
                    });
                });
            }
        };
    }]);

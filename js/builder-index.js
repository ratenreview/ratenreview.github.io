var builderApp = angular.module('epam.builder', [
    'builder', 'angular.filter'
]);

builderApp.controller('ReviewApproveCtrl', ['$scope', 'Restangular', 'ServiceUrlFactory', '$location',
                                            function ($scope, Restangular, serviceUrlFactory, $location) {
	$scope.wishlistServiceUrl = serviceUrlFactory.wishlistServiceUrl;
	
	if (serviceUrlFactory.defaultHeaders !== null){
	    Restangular.setDefaultHeaders(serviceUrlFactory.defaultHeaders);
	}
	
	Restangular.setBaseUrl($scope.wishlistServiceUrl);
   
    var params = {
        'reviewsStatus': 'unapproved'
    };
    
    if ($location.$$absUrl.contains('referrer')) {
    	$scope.groupByProduct = true;
    	$('#toggleidsm').attr('checked','checked');
    }
    
    Restangular.all("reviews").getList(params).then(function (response) {
        $scope.reviews = Restangular.stripRestangular(response);
    });
    
    $scope.approve = function (index) {
        var review = $scope.reviews.splice(index, 1)[0];
        review.status = "approved";
        Restangular.all("reviews/" + review.id).customPUT(review).then(function (response) {
            console.log('approved');
        });
    };

    $scope.remove = function (index) {
        var review = $scope.reviews.splice(index, 1)[0];
        Restangular.all("reviews/" + review.id).customDELETE().then(function (response) {
            console.log('removed');
        });
    };
    
    $scope.goToProductReviews = function(productName, reviews) {    	
    	$scope.productId = retrieveProductId(productName, reviews);    	
    	Builder.linkManager().currentLocation().path($scope.productId).open(true);
    }
    
    var retrieveProductId = function(productName, reviews) {
    	for (idx in reviews) {
    		if (reviews[idx].productName === productName) {
    			return reviews[idx].productId;
    		}
    	}
    };
}]);

builderApp.controller('ProductReviewsController', ['$scope', 'Restangular', 'ServiceUrlFactory',
                                                   function($scope, Restangular, serviceUrlFactory) {
	$scope.wishlistServiceUrl = serviceUrlFactory.wishlistServiceUrl;
	$scope.productId = Builder.currentWidget.settings.productId;
	
	Restangular.setDefaultHeaders({ 'hybris-tenant': 'ratereview2'});
	Restangular.setBaseUrl($scope.wishlistServiceUrl);
	
	var parameters = {
		'productId': $scope.productId,
		'reviewsStatus': 'unapproved'
	};
	
	var tryRedirectHome = function(productReviews) {
		if (productReviews.length == 0) {
			Builder.linkManager().currentProject().path("approveReviewsv2").open();
		}
	};
	
	Restangular.all("reviews").getList(parameters).then(function (response) {
        $scope.productReviews = Restangular.stripRestangular(response);
        
        if ($scope.productReviews) {
            $scope.productName = $scope.productReviews[0].productName;
            $scope.productUrl = $scope.productReviews[0].productUrl;
        }
    });
	
	$scope.approve = function (index) {
        var review = $scope.productReviews.splice(index, 1)[0];
        review.status = "approved";
        Restangular.all("reviews/" + review.id).customPUT(review).then(function (response) {
        	tryRedirectHome($scope.productReviews);
        });
    };

    $scope.remove = function (index) {
        var review = $scope.productReviews.splice(index, 1)[0];
        Restangular.all("reviews/" + review.id).customDELETE().then(function (response) {
        	tryRedirectHome($scope.productReviews);
        });
    };
	
	$scope.goToReviewSummary = function() { 
		Builder.linkManager().currentProject().path("approveReviewsv2").addReferrer().open(true);
	};
}]);

builderApp.controller('ReviewsConfigurationCtrl', ['$scope', 'Restangular', 'ServiceUrlFactory', '$location',
                                            function ($scope, Restangular, serviceUrlFactory, $location) {
    
    var toggleSaveButtonState = function(id, originValue, newValue) {
        $scope.saveButtonDisabled = (originValue === newValue) || 
                                    $scope.originConfig[id] === newValue;
    }
    
    $scope.wishlistServiceUrl = serviceUrlFactory.wishlistServiceUrl;
    $scope.saveButtonDisabled = true;
    $scope.toggleConfigCheckbox = function(id) {
        toggleSaveButtonState(id, $scope.configuration[id], !$scope.configuration[id]);
        $scope.configuration[id] = !$scope.configuration[id];
    };
    $scope.toggleConfigRadio = function(id, value) {
        toggleSaveButtonState(id, $scope.configuration[id], value);
        $scope.configuration[id] = value;
    };
    $scope.onStopWordsListChange = function(id, value) {
        $scope.saveButtonDisabled = $scope.originConfig[id] == value;
    }
    
    if (serviceUrlFactory.defaultHeaders !== null){
        Restangular.setDefaultHeaders(serviceUrlFactory.defaultHeaders);
    }
    
    Restangular.setBaseUrl($scope.wishlistServiceUrl);
    
    Restangular.one('configuration').get().then(function(response) {
        $scope.configuration = Restangular.stripRestangular(response);
        $scope.originConfig = angular.copy($scope.configuration);
    });
    
    $scope.save = function() {
        Restangular.all('configuration').customPUT($scope.configuration)
            .then(function() {
                $scope.saveButtonDisabled = true;
                $scope.originConfig = angular.copy($scope.configuration);
            });
    };
    
    $scope.reset = function() {
        $scope.configuration = angular.copy($scope.originConfig);
        $scope.saveButtonDisabled = true;
    };
}]);

builderApp.controller('CommentsApproveCtrl', ['$scope', 'Restangular', 'ServiceUrlFactory', '$location',
                                            function ($scope, Restangular, serviceUrlFactory, $location) {
    
    $scope.wishlistServiceUrl = serviceUrlFactory.wishlistServiceUrl;
    
    if (serviceUrlFactory.defaultHeaders !== null){
        Restangular.setDefaultHeaders(serviceUrlFactory.defaultHeaders);
    }
    
    Restangular.setBaseUrl($scope.wishlistServiceUrl);
    
    Restangular.all('comments').getList({
        commentStatus : 'unapproved'
    }).then(function (response) {
        $scope.comments = Restangular.stripRestangular(response);
    });
    
    $scope.approve = function (index) {
        var comment = $scope.comments.splice(index, 1)[0];
        comment.status = "APPROVED";
        Restangular.all("comments/" + comment.id).customPUT(comment).then(function (response) {
            
        });
    };

    $scope.remove = function (index) {
        var comment = $scope.comments.splice(index, 1)[0];
        Restangular.all("comments/" + comment.id).customDELETE().then(function (response) {
            
        });
    };
}]);

builderApp.directive('ratings', function () {
    return {
        restrict: 'E',
        templateUrl: 'templates/ratings.html',
        replace: true,
        scope: {
            reviewScore: '@?',
            max: '@?'
        },
        controller: ['$scope', function ($scope) {
            if (!$scope.reviewScore) {
                $scope.reviewScore = 0;
            }
            if (!$scope.max) {
                $scope.max = 5;
            }

            function updateStars() {
                $scope.stars = [];
                for (var i = 0; i < $scope.max; i++) {
                    $scope.stars.push({
                        filled: i < $scope.reviewScore
                    });
                }
            }

            updateStars();
        }]
    };
});
builderApp.factory('ServiceUrlFactory', function() {
    //  to use LOCAL builder
    //  1. uncomment this
      return {
              wishlistServiceUrl: 'http://localhost:9379', 
              defaultHeaders: {'hybris-tenant': 'ratereview2'}
      }
    //  2. comment this:
    
//        return {
//            wishlistServiceUrl: 'https://api.yaas.io/epam/rate-review/v2'
//        }
});



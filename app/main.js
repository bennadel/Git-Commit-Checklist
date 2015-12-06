
// Use strict for the entire application.
"use strict";

// Define the module for the application.
angular
	.module( "Checklist", [ "ng" ] )
	.factory( "config", configFactory )
;


// I provide injectable configuration settings for the application.
function configFactory() {

	return({
		firebaseUrl: "https://git-deploy-checklist.firebaseIO.com/deployments/"
	});

}

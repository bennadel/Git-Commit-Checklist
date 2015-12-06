angular
	.module( "Checklist" )
	.directive( "gdcChecklist", gdcChecklistComponent )
;

// I provide the checklist verification component.
function gdcChecklistComponent( $document ) {

	// Create an instance of our custom HTML element to help enable CSS styling in 
	// some older browsers.
	$document[ 0 ].createElement( "gdc-checklist" );

	// Return the directive configuration object.
	return({
		controller: "checklist.ChecklistController",
		controllerAs: "vm",
		restrict: "E",
		scope: {},
		templateUrl: "./app/checklist/checklist.directive.htm"
	});

}
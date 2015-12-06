angular
	.module( "Checklist" )
	.directive( "gdcIntake", gdcIntakeComponent )
;

// I provide the intake form component.
function gdcIntakeComponent( $document ) {

	// Create an instance of our custom HTML element to help enable CSS styling in 
	// some older browsers.
	$document[ 0 ].createElement( "gdc-intake" );

	// Return the directive configuration object.
	return({
		controller: "intake.IntakeController",
		controllerAs: "vm",
		restrict: "E",
		scope: {},
		templateUrl: "./app/intake/intake.directive.htm"
	});

}

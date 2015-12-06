angular
	.module( "Checklist" )
	.controller( "MainLayoutController", MainLayoutController )
;

// I control the main application layout.
function MainLayoutController( $scope, $location ) {

	var vm = this;

	// I determine which sub-level component is being rendered.
	vm.subview = null;

	// I listen for the location changes to update the subview rendering.
	$scope.$on( "$locationChangeSuccess", handleLocationChange );


	// ---
	// PRIVATE METHODS.
	// ---


	// I handle the location change event.
	function handleLocationChange( event ) {

		vm.subview = ( $location.path().slice( 1 ) === "" )
			? "intake"
			: "checklist"
		;

	}

}
angular
	.module( "Checklist" )
	.controller( "checklist.ChecklistController", ChecklistController )
;

// I control the deployment checklist component.
function ChecklistController( $scope, $location, $log, firebaseService, deploymentService, _ ) {

	var vm = this;

	// I hold the form values for the ng-model bindings.
	vm.form = {
		authorFilter: ""
	};

	// I hold the aggregate state of the staging and production environments.
	vm.staging = "pending";
	vm.production = "pending";

	// I hold the commits that are being verified in the current deployment.
	vm.commits = [];

	// Parse the deploymentID for the current deployment.
	// --
	// NOTE: This could ordinarily be pulled from the routeParams collection; however,
	// due to the simplicity of the URL schema, I am excluding the ngRoute module and
	// am just pulling this right out of the location.
	var deploymentID = $location.path().slice( 1 );



	// Listen for changes on the deployment node.
	// --
	// TODO: MOVE THIS OUT OF THE CONTROLLER. THIS IS THE LAST THING THAT KNOWS ABOUT
	// FIREBASE IN THIS PLACE, OUTSIDE OF THE SERVICES. I THINK THIS MIGHT DOVETAIL 
	// NICELY WITH FLUX / REDUX, BUT DON'T KNOW ENOUGH ABOUT IT YET.
	firebaseService
		.ref( deploymentID )
		.on( 
			"value",
			function changeModel( snapshot ) {

				$scope.$applyAsync(
					function asyncDigest() {

						handleRemoteValue( snapshot.val() );

					}
				);

			}
		)
	;



	// Expose public methods.
	vm.toggleStatusInProduction = toggleStatusInProduction;
	vm.toggleStatusInStaging = toggleStatusInStaging;
	vm.toggleTestingInProduction = toggleTestingInProduction;
	vm.toggleTestingInStaging = toggleTestingInStaging;


	// ---
	// PUBLIC METHODS.
	// ---


	// I toggle the pass / fail status for the given commit in production.
	function toggleStatusInProduction( commit ) {

		var nextTesting = "active";
		var nextStatus = _.cycle( [ "pending", "pass", "fail" ], commit.production.status );

		deploymentService
			.updateCommitInProduction( deploymentID, commit.hash, nextTesting, nextStatus )
			.then(
				function handleResolve() {

					$log.info( "Production commit [ %s ] updated.", commit.hash );

				}
			)
		;

	}


	// I toggle the pass / fail status for the given commit in staging.
	function toggleStatusInStaging( commit ) {

		var nextTesting = "active";
		var nextStatus = _.cycle( [ "pending", "pass", "fail" ], commit.staging.status );

		deploymentService
			.updateCommitInStaging( deploymentID, commit.hash, nextTesting, nextStatus )
			.then(
				function handleResolve() {

					$log.info( "Staging commit [ %s ] updated.", commit.hash );

				}
			)
		;

	}


	// I toggle the testing state for the given commit in production.
	function toggleTestingInProduction( commit ) {

		var nextTesting = _.cycle( [ "inactive", "active" ], commit.production.testing );
		var nextStatus = commit.production.status;

		// If the testing got reset, move the status back to a pending state.
		if ( nextTesting === "inactive" ) {

			nextStatus = "pending";

		}

		deploymentService
			.updateCommitInProduction( deploymentID, commit.hash, nextTesting, nextStatus )
			.then(
				function handleResolve() {

					$log.info( "Production commit [ %s ] updated.", commit.hash );

				}
			)
		;

	}


	// I toggle the testing state for the given commit in staging.
	function toggleTestingInStaging( commit ) {

		var nextTesting = _.cycle( [ "inactive", "active" ], commit.staging.testing );
		var nextStatus = commit.staging.status;

		// If the testing got reset, move the status back to a pending state.
		if ( nextTesting === "inactive" ) {

			nextStatus = "pending";

		}

		deploymentService
			.updateCommitInStaging( deploymentID, commit.hash, nextTesting, nextStatus )
			.then(
				function handleResolve() {

					$log.info( "Staging commit [ %s ] updated.", commit.hash );

				}
			)
		;

	}


	// ---
	// PRIVATE METHODS.
	// ---


	// I calculate and return the aggregate status for the given environment based 
	// on the given commit.
	// --
	// * If ALL COMMITS pass, the environment passes. 
	// * If ANY COMMIT fails, the environment fails.
	function getEnvironmentStatus( environment, commits ) {

		var isAllPassing = _.every(
			commits,
			function operator( commit ) {

				return( commit[ environment ].status === "pass" );

			}
		);

		// If all commits are passing, nothing else to check - the environment is
		// passing on the current deployment.
		if ( isAllPassing ) {

			return( "pass" );

		}

		var isAnyFailing = _.any(
			commits,
			function operator( commit ) {

				return( commit[ environment ].status === "fail" );

			}
		);

		// If any of the commits failed, nothing else to check - the environment is
		// failing on the current deployment.
		if ( isAnyFailing ) {

			return( "fail" );

		}

		// If we made it this far, the environment is still in a pending state for
		// the current deployment.
		return( "pending" );

	}


	// I handle value events from the Firebase node.
	function handleRemoteValue( deployment ) {

		// If the deployment value is null, the data in this deployment is no longer 
		// available - redirect the user back to the home screen.
		if ( ! deployment ) {

			return( $location.path( "/" ) );

		}

		// Remotely, the commits are indexed by hash. However, locally they will be 
		// easier to work with if they are in an array. Let's convert the object to a
		// sort-ordered array.
		vm.commits = _.sortBy( _.values( deployment.commits ), "sort" );
		
		// Recalculate the environment status based on the aggregate commit status.
		vm.staging = getEnvironmentStatus( "staging", vm.commits );
		vm.production = getEnvironmentStatus( "production", vm.commits );

	}

}

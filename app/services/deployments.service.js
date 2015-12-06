angular
	.module( "Checklist" )
	.factory( "deploymentService", deploymentServiceFactory )
;

// I provide methods for creating and updating deployments.
function deploymentServiceFactory( $rootScope, $q, firebaseService ) {

	// Return the public API.
	return({
		createDeployment: createDeployment,
		updateCommitInProduction: updateCommitInProduction,
		updateCommitInStaging: updateCommitInStaging
	});


	// ---
	// PUBLIC METHODS.
	// ---


	// I create a new deployment for the given commits. Returns a promise that resolves
	// and notifies with the new deployment ID.
	function createDeployment( commits ) {

		var deferred = $q.defer();

		var deployment = {
			count: commits.length,
			commits: {},
			createdAt: now()
		};

		// Convert the array of commits to a hash-keyed commit object.
		commits.forEach(
			function iterator( commit, i ) {

				deployment.commits[ commit.hash ] = {
					hash: commit.hash,
					author: commit.author,
					subject: commit.subject,
					sort: i,
					staging: {
						testing: "inactive",
						status: "pending"
					},
					production: {
						testing: "inactive",
						status: "pending"
					}
				};

			}
		);

		var deploymentID = ( now() + salt() + commits[ 0 ].hash );

		notifyAsync( deferred, deploymentID );

		firebaseService
			.ref( deploymentID )
			.set( 
				deployment,
				createGenericDoneHandler( deferred, deploymentID )
			)
		;

		return( deferred.promise );

	}


	// I update the given commit configuration for the production environment. Returns
	// a promise that resolves with the deploymentID.
	function updateCommitInProduction( deploymentID, commitHash, newTesting, newStatus ) {

		var deferred = $q.defer();

		firebaseService
			.ref( deploymentID + "/commits/" + commitHash + "/production/" )
			.update(
				{
					testing: newTesting,
					status: newStatus 
				},
				createGenericDoneHandler( deferred, deploymentID )
			)
		;

		return( deferred.promise );

	}


	// I update the given commit configuration for the staging environment. Returns
	// a promise that resolves with the deploymentID.
	function updateCommitInStaging( deploymentID, commitHash, newTesting, newStatus ) {

		var deferred = $q.defer();

		firebaseService
			.ref( deploymentID + "/commits/" + commitHash + "/staging/" )
			.update(
				{
					testing: newTesting,
					status: newStatus 
				},
				createGenericDoneHandler( deferred, deploymentID )
			)
		;

		return( deferred.promise );

	}


	// ---
	// PRIVATE METHODS.
	// ---


	// I create a generic done-handler for a Firebase interaction that needs to either
	// reject with the Firebase error or resolve with the given resolve value.
	function createGenericDoneHandler( deferred, resolveValue ) {

		return( handleDone );

		function handleDone( error ) {

			if ( error ) {

				deferred.reject( error );

			} else if ( arguments.length === 2 ) {

				deferred.resolve( resolveValue );

			} else {

				deferred.resolve();

			}

			deferred = error = null;

		}

	}


	// I trigger the notify the event on the given deferred value.
	// --
	// NOTE: This has to be done later in the $digest otherwise the calling context
	// will not have had a chance to bind a listener (and the event won't get triggered).
	function notifyAsync( deferred, value ) {

		$rootScope.$evalAsync(
			function notifyDeferred() {

				deferred.notify( value );

			}
		);

	}


	// I return the current Unix time in milliseconds.
	function now() {

		return( new Date().getTime() );

	}


	// I return a random value between 0 and 999,999.
	function salt() {

		return( Math.floor( Math.random() * 999999 ) );

	}

}
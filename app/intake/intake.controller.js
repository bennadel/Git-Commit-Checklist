angular
	.module( "Checklist" )
	.controller( "intake.IntakeController", IntakeController )
;

// I control the commit-log intake form.
function IntakeController( $scope, $location, $log, deploymentService ) {

	var vm = this;

	// I hold the form values for the ng-model bindings.
	vm.form = {
		commitLog: ""
	};

	// Expose public methods.
	vm.loadSampleData = loadSampleData;
	vm.processForm = processForm;


	// ---
	// PUBLIC METHODS.
	// ---


	// I load sample data into the intake form. This is both helpful in building the
	// app as well as in demonstrating its features.
	function loadSampleData() {

		// If we already have data in the form, do not overwrite it.
		if ( vm.form.commitLog ) {

			return;

		}

		var sampleLog = [
			"55ea0c3d117f9d245a925d6d8afa1ff4ee5143d2 [Sarah Smith] Fix bug in login form for plus-style addressing.",
			"5c67dc5fea2f8dff7a6d4093fd52aff4ecc07cd3 [Kim Smith] Removed erroneous padding from error modal.",
			"0c143bb723cf6abc8a482257aa4feff4ea1c72b7 [Ben Nadel] Delete Redis keys for invalid sessions.",
			"c9568ac85fe11eca9af0008b7f551ff4e49cb40b [Ben Nadel] Reverting hotfix commits."
		];

		vm.form.commitLog = sampleLog.join( "\n" );

	}


	// I parse the raw commit log data into an array of objects.
	function parseCommits( input ) {

		var matches = null;

		// Group 1: Hash.
		// Group 2: Author.
		// Group 3: Subject.
		var commits = [];
		var commitPattern = /^([0-9a-f]+) \[([^\]]+)] (.+)$/gim;

		while ( matches = commitPattern.exec( input ) ) {

			commits.push({
				hash: matches[ 1 ] ,
				author: matches[ 2 ],
				subject: matches[ 3 ]
			});

		}

		return( commits );

	}


	// I process the intake form used to start a new deployment.
	function processForm() {

		// Parse the commit data into a data structure that we can use in the
		// checklist component.
		var commits = parseCommits( vm.form.commitLog );

		// If we could not parse and commits, bail out.
		if ( ! commits.length ) {

			alert( "Your commit data doesn't follow the required pattern." );
			return;

		}

		deploymentService
			.createDeployment( commits )
			.then(
				function handleResolve( deploymentID ) {

					$log.info( "Deployment pushed to remote server successfully." );

				},
				function handleReject( error ) {

					alert( "Oops, something went wrong." )
					$log.error( error );

				},
				function handleNotify( deploymentID ) {

					// The promise is notified with the deployment ID before the data is
					// actually saved to the remote service. In order to provide immediate
					// feedback to the user, we're going to go ahead and forward the user
					// to the deployment checklist before we actually get confirmation of 
					// the save.
					$location.path( "/" + deploymentID );

				}
			)
			.finally(
				function handleFinally() {

					vm.form.commitLog = "";

				}
			)
		;

	}

}
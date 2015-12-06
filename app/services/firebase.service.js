angular
	.module( "Checklist" )
	.factory( "firebaseService", firebaseServiceFactory )
;

// I provide the Firebase service as an injectable.
function firebaseServiceFactory( $window, config ) {

	var Firebase = $window.Firebase;

	// Return the public API.
	return({
		ref: createRef,
		Firebase: Firebase
	});


	// ---
	// PUBLIC METHODS.
	// ---


	// I create a new Firebase reference at the given path.
	function createRef( path ) {

		return( new Firebase( config.firebaseUrl + normalizePath( path ) ) );

	}


	// ---
	// PRIVATE METHODS.
	// ---


	// I normalize the paths so that they never start with a leading slash, but always
	// end with a trailing slash.
	function normalizePath( path ) {

		// Strip off leading of trailing slashes.
		path = path.replace( /^\/+|\/+$/g, "" );

		// Append a trailing slash, but only if the path has a length. If the path is
		// empty, we want to expose the root node.
		if ( path ) {

			path = ( path + "/" );

		} 

		return( path );

	}

}
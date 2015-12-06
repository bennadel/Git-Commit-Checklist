angular
	.module( "Checklist" )
	.factory( "_", lodashFactory )
;

// I expose and augment the Lodash factory.
function lodashFactory( $window ) {

	var _ = $window._;

	// Delete it from the global space so no one tries to circumvent injection.
	delete( $window._ );

	// Expose more methods.
	_.cycle = cycle;

	return( _ );


	// ---
	// PUBLIC METHODS.
	// ---


	// I return the next item, after the current value, in the given collection. If the
	// the current value cannot be found in the collection, it is returned.
	function cycle( collection, current ) {

		var index = _.indexOf( collection, current );

		// If the current value wasn't found, return it.
		if ( index === -1 ) {

			return( current );

		}

		// If the next item is beyond the bounds of the collection, loop back.
		if ( ++index >= collection.length ) {
			
			index = 0;

		}

		return( collection[ index ] );

	}

}
test( "jQuery.when2", function() {

	expect( 61 );

	// Some other objects
	jQuery.each({
		"an empty string": "",
		"a non-empty string": "some string",
		"zero": 0,
		"a number other than zero": 1,
		"true": true,
		"false": false,
		"null": null,
		"undefined": undefined,
		"a plain object": {}
	}, function( message, value ) {
		ok(
			jQuery.isFunction(
				jQuery.when2( [ value ] ).done(function( resolveValue ) {
					deepEqual( this, [ window ], "Context is [ the global object ] with " + message );
					strictEqual( resolveValue, value, "Test the promise was resolved with " + message );
				}).promise
			),
			"Test " + message + " triggers the creation of a new Promise"
		);

		// When resolving on first success, we get a non-list context and done function
		// is called with an index (always zero here) and the resolved value.
		jQuery.when2( [ value ], { resolveOnFirstSuccess: true } ).done(function( index, resolveValue ) {
			deepEqual( this, window, "Context is the global object with resolveOnFirstSuccess with " + message );
			strictEqual( index, 0, "Test the resolved deferred index is with " + message );
			strictEqual( resolveValue, value, "Test the promise was resolved immediately with " + message );
		});
	});

	ok(
		jQuery.isFunction(
			jQuery.when2().done(function( resolveValue ) {
				strictEqual( this, window, "Test the promise was resolved with window as its context" );
				strictEqual( resolveValue, undefined, "Test the promise was resolved with no parameter" );
			}).promise
		),
		"Test calling when2 with no parameter triggers the creation of a new Promise"
	);

	var cache,
		context = {};

	jQuery.when2( [ jQuery.Deferred().resolveWith( context ) ] ).done(function() {
		deepEqual( this, [ context ], "when2( [ promise ] ) propagates context" );
	});

	jQuery.each([ 1, 2, 3 ], function( k, i ) {

		jQuery.when2([ cache || jQuery.Deferred(function() {
				this.resolve( i );
			})
		]).done(function( value ) {

			strictEqual( value, 1, "Function executed" + ( i > 1 ? " only once" : "" ) );
			cache = value;
		});

	});
});

test( "jQuery.when2 - done (all)", function() {

	expect( 3 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ] )
	.done(function( a, b ) {
		deepEqual( [ a, b ], [ 1, 2 ], "resolve/resolve => resolve" );
		strictEqual( this[ 0 ], defer1.promise(), "resolve/resolve 1st context OK" );
		strictEqual( this[ 1 ], defer2.promise(), "resolve/resolve 2nd context OK" );
	});

	defer1.resolve( 1 );
	defer2.resolve( 2 );
});

test( "jQuery.when2 - done (resolveOnFirstSuccess)", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { resolveOnFirstSuccess: true } )
	.done(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 1 ], "resolve/resolve => resolve" );
		strictEqual( this, defer1.promise(), "resolve/resolve context OK" );
	});

	defer1.resolve( 1 );
	defer2.resolve( 2 );
});

test( "jQuery.when2 - done (resolveOnFirstSuccess) other order", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { resolveOnFirstSuccess: true } )
	.done(function( index, value ) {
		deepEqual( [ index, value ], [ 1, 2 ], "resolve/resolve => resolve" );
		strictEqual( this, defer2.promise(), "resolve/resolve context OK" );
	});

	defer2.resolve( 2 );
	defer1.resolve( 1 );
});

test( "jQuery.when2 - done scalar/resolve (resolveOnFirstSuccess)", function() {

	expect( 2 );

	var defer = jQuery.Deferred().resolve( 1 );

	jQuery.when2( [ 3, defer ],
		      { resolveOnFirstSuccess: true } )
	.done(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 3 ], "scalar/resolve => resolve" );
		strictEqual( this, window, "resolve/resolve context OK" );
	});
});

test( "jQuery.when2 - done scalar/resolve later (resolveOnFirstSuccess)", function() {

	expect( 2 );

	var defer = jQuery.Deferred();

	jQuery.when2( [ defer, 3 ],
		      { resolveOnFirstSuccess: true } )
	.done(function( index, value ) {
		deepEqual( [ index, value ], [ 1, 3 ], "scalar/resolve => resolve" );
		strictEqual( this, window, "resolve/resolve context OK" );
	});

	defer.resolve( 1 );
});

test( "jQuery.when2 - fail pending/reject", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ] )
	.fail(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 1 ], "pending/reject => fail" );
		strictEqual( this, defer1.promise(), "pending/reject context" );
	});

	defer1.reject( 1 );
});

test( "jQuery.when2 - fail pending/reject (rejectOnFirstError true)", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: true } )
	.fail(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 1 ], "pending/reject => fail" );
		strictEqual( this, defer1.promise(), "pending/reject context" );
	});

	defer1.reject( 1 );
});

test( "jQuery.when2 - fail resolve/reject", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ] )
	.fail(function( index, value ) {
		deepEqual( [ index, value ], [ 1, 2 ], "resolve/reject => fail" );
		strictEqual( this, defer2.promise(), "resolve/reject context" );
	});

	defer1.resolve( 1 );
	defer2.reject( 2 );
});

test( "jQuery.when2 - fail resolve/reject (rejectOnFirstError true)", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: true } )
	.fail(function( index, value ) {
		deepEqual( [ index, value ], [ 1, 2 ], "resolve/reject => fail" );
		strictEqual( this, defer2.promise(), "resolve/reject context" );
	});

	defer1.resolve( 1 );
	defer2.reject( 2 );
});

test( "jQuery.when2 - fail resolve/reject (rejectOnFirstError true, resolveOnFirstSuccess true)", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: true, resolveOnFirstSuccess: true } )
	.done(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 1 ], "resolve/reject => done" );
		strictEqual( this, defer1.promise(), "resolve/reject context" );
	})
	.fail(function() {
		ok( false, "Fail called when it shouldn't have been.");
	});

	defer1.resolve( 1 );
	defer2.reject( 2 );
});

test( "jQuery.when2 - fail reject/resolve (rejectOnFirstError true, resolveOnFirstSuccess true)", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: true, resolveOnFirstSuccess: true } )
	.fail(function( index, value ) {
		deepEqual( [ index, value ], [ 0, 1 ], "reject/resolve => done" );
		strictEqual( this, defer1.promise(), "reject/resolve context" );
	})
	.done(function() {
		ok( false, "Done called when it shouldn't have been.");
	});

	defer1.reject( 1 );
	defer2.resolve( 2 );
});

test( "jQuery.when2 - fail (rejectOnFirstError false) reject/resolve", function() {

	expect( 3 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred();

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: false } )
	.done(function( a, b ) {
		deepEqual( [ a, b ], [ 1, 2 ], "reject/resolve => done" );
		strictEqual( this[0], defer1.promise(), "reject/resolve context 1" );
		strictEqual( this[1], defer2.promise(), "reject/resolve context 2" );
	});

	defer1.reject( 1 );
	defer2.resolve( 2 );
});

test( "jQuery.when2 - progress notify/notify", function() {

	expect( 4 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred(),
		count = 0;

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: false } )
	.progress(function( index, value ) {
		if ( count === 0 ) {
			deepEqual( [ index, value ], [ 0, 1 ], "notify 1 => progress" );
			strictEqual( this, defer1.promise(), "notify context 1" );
			count++;
		} else if ( count === 1 ){
			deepEqual( [ index, value ], [ 1, 2 ], "notify 2 => progress" );
			strictEqual( this, defer2.promise(), "notify context 2" );
			count++;
		} else {
			ok( false, "Progress called too many times" );
		}
	});

	defer1.notify( 1 );
	defer2.notify( 2 );
});

test( "jQuery.when2 - progress no notify after resolve", function() {

	expect( 2 );

	var defer1 = jQuery.Deferred(),
		defer2 = jQuery.Deferred(),
		count = 0;

	jQuery.when2( [ defer1, defer2 ],
		      { rejectOnFirstError: false } )
	.progress(function( index, value ) {
		if ( count === 0 ) {
			deepEqual( [ index, value ], [ 0, 1 ], "notify 1 => progress" );
			strictEqual( this, defer1.promise(), "notify context 1" );
			count++;
		} else {
			ok( false, "Progress called too many times." );
		}
	});

	defer1.notify( 1 );
	defer1.resolve( 1 );
	defer2.resolve( 2 );
	defer2.notify( 2 );
});

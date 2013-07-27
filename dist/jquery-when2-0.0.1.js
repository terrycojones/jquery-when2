jQuery.when2 = function( subordinates, options ) {
    var i = 0,
    core_slice = [].slice,
    resolveValues = subordinates ? core_slice.call( subordinates ) : [],
    length = resolveValues.length,
    resolveContexts = length ? new Array( length ) : window,
    remaining = length,
    promiseArgCount = 0,
    resolveOnFirstSuccess = options && options.resolveOnFirstSuccess,
    failOnFirstError = !options || options.failOnFirstError,

    // the master Deferred.
    deferred = jQuery.Deferred(),

    doneFunc = function( i ) {
        return function( value ) {
            if ( deferred.state() === "pending" ) {
                --remaining;
                resolveContexts[ i ] = this;
                resolveValues[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                if ( resolveOnFirstSuccess ) {
                    deferred.resolveWith( this, [ i, resolveValues[i] ] );
                } else if (remaining === 0) {
                    deferred.resolveWith( resolveContexts, resolveValues );
                }
            }
        };
    },

    failFunc = function( i ) {
        if ( failOnFirstError ) {
            return function( value ) {
                if ( deferred.state() === "pending" ) {
                    value = arguments.length > 1 ? core_slice.call( arguments ) : value;
                    deferred.rejectWith( this, [ i, value ]);
                }
            };
        } else {
            return function( value ) {
                if ( deferred.state() === "pending" ) {
                    resolveContexts[ i ] = this;
                    resolveValues[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
                    if ( !( --remaining ) ) {
                        deferred.resolveWith( resolveContexts, resolveValues );
                    }
                }
            };
        }
    },

    progressFunc = function( i ) {
        return function( value ) {
            if ( deferred.state() === "pending" ) {
                value = arguments.length > 1 ? core_slice.call( arguments ) : value;
                deferred.notifyWith( this, [ i, value ] );
            }
        };
    };

    // add listeners to Deferred subordinates; treat others as resolved
    for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
            promiseArgCount++;
            resolveValues[ i ].promise()
                .done( doneFunc( i ) )
                .fail( failFunc( i ) )
                .progress( progressFunc( i ) );
        } else {
            if ( deferred.state() === "pending" && resolveOnFirstSuccess ) {
                deferred.resolveWith( window, [ i, resolveValues[i] ] );
            }
            resolveContexts[ i ] = window;
            --remaining;
        }
    }

    if ( deferred.state() === "pending" && promiseArgCount === 0) {
        deferred.resolveWith( resolveContexts, resolveValues );
    }

    return deferred.promise();
};

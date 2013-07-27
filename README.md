jquery-when2
============

This package adds a `jQuery.when2` function to
[jQuery](http://jquery.com/). The aim is to provide is a more flexible
(than [jQuery.when](http://api.jquery.com/jQuery.when/)) command for
working with jQuery Deferred objects.

Given a set of deferreds to monitor, `when2` returns a deferred that can
either:

1. resolve on the first success,
1. fail on the first error (the `jQuery.when` behavior), or
1. resolve when all results (successes or errors) have been collected.

You specify the behavior you want by passing an option to `when2`.

API differences from `jQuery.when`
==================================

* `when2` must be called with a list as its first argument.
* An `options` Javascript object may be passed as a second argument.
* If `options.resolveOnFirstSuccess` is `true`, the deferred returned by
  `when2` will resolve as soon as any of the passed deferreds
  resolves. In this case, `.done` callbacks will be passed `index` and `value`
  args, where `index` is the index of the deferred that fired. If
  non-deferreds are in the arguments to `when2`, the first one seen will
  trigger the resolve (not very useful, but consistent).
* If `options.failOnFirstError` is `false`, the deferred returned by
  `when2` will never fail. It will collect the results from all the
  deferreds and pass them all back. The caller gets to figure out which
  values (if any) are errors.
* If no options are given (or `options.failOnFirstError` is `true`), `fail`
  will be called on the deferred returned by `when2` on the first error
  (this is the behavior of `jQuery.when`). The args passed to `fail` will
  be `index` and `value`, indicating which deferred was rejected.
* Any `.progress` callbacks added to the returned deferred are also called
  with `index` and `value` arguments so you can tell which deferred made
  progress.

Usage
=====

Download your choice of the code `dist/jquery-when2-*.js` and include it in
your HTML after including jQuery. Then you have the following possiblitites:

```javascript
// Behave like $.when: wait for all deferreds to finish and then resolve.
// Reject immediately if any passed deferred rejects.
$.when2([defer1, defer2, ...])
.done(function(){
    // Results from all deferreds are in 'arguments'.
})
.fail(function(index, error){
    // The deferred given by 'index' was rejected with the given error.
});
```

```javascript
// Same as above, but a little more explicit.
$.when2([defer1, defer2, ...], {failOnFirstError: true})
.done(function(){
    // Results from all deferreds are in 'arguments'.
})
.fail(function(index, error){
    // The deferred given by 'index' was rejected with the given error.
});
```

```javascript
// Don't reject if an underlying deferred rejects, keep collecting
// results and pass them all back to '.done' callbacks. You get
// to figure out which results are errors (if any).
$.when2([defer1, defer2, ...], {failOnFirstError: false})
.done(function(){
    // Results from all deferreds, including errors, are in 'arguments'
})
.fail(function(){
    // This can never happen with 'failOnFirstError = true'.
});
```

```javascript
// Resolve the returned deferred as soon as any of the
// passed deferreds is resolved.
$.when2([defer1, defer2, ...], {resolveOnFirstSuccess: true})
.done(function(index, result){
    // The deferred given by index fired with the given result.
});
```

```javascript
// Get progress information from all the passed deferreds. Once the
// returned deferred has resolved, no further progress events are fired.
$.when2([defer1, defer2, ...])
.progress(function(index, value){
    // The deferred given by 'index' reported a progress value.
});
```


Development notes
=================

You should install `grunt` and `jshint`:

    $ npm install -g grunt jshint

To run the tests, either open `test/index.html` in your browser, or run

```shell
$ grunt qunit
Running "qunit:files" (qunit) task
Testing test/index.html ...............OK
>> 93 assertions passed (54ms)

Done, without errors.
```

The code borrows heavily from `jQuery.when`.

I copied some of the [jQuery.when
tests](https://github.com/jquery/jquery/blob/master/test/unit/deferred.js),
but some were too complicated to get right for `when2` so I ended up adding
a bunch of small tests as well.

Note that `when2` always makes a new deferred. This differs from the `when`
approach, which re-use the single deferred it is given if it only has one
argument. This was necessary in order to be able to return `index`,
`result` arguments in this case.

It might be possible to implement `jQuery.when` in terms of
`jQuery.when2`. I tried that originally, but ran into difficulty so
decided to leave it for later (or never).

It would be easy to add convenience functions like
`jQuery.whenAnySuccess` or `jQuery.whenAllResolvedOrRejected` that just
called `when2` with the correct option.

The approach mirrors what you can do with
[Twisted](http://twistedmatrix.com)'s
[DeferredList](http://twistedmatrix.com/documents/current/api/twisted.internet.defer.DeferredList.html),
which gives you the same 3 behaviors: fire on first callback, fire on first
errback, fire when everything is done (errors or not).

A slightly radical possible enhancement would be to co-opt the `.progress`
callback and use it to instead relay `resolve` info (each call having an
index & a value to show which of the passed deferreds had resolved).  A
flag in `options` could request that behavior. It's a perversion but it's
easy to think of ways in which that could be useful.

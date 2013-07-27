jquery-when2
============

A more flexible `jQuery.when` command for working with jQuery Deferred objects

This adds a `jQuery.when2` function. The code borrows heavily from `jQuery.when`. The main differences from `jQuery.when` are:

* `when2` must be called with a list as its first argument.
* An options object may be passed as a second argument.
* If `options.resolveOnFirstSuccess` is `true`, the deferred returned by `when2` will be resolved as soon as any of the passed deferreds resolves. In this case, done callbacks will be passed `index` and `value` args, where `index` is the index of the deferred that fired. If non-deferreds are in the arguments to `when2`, the first one seen will trigger the resolve (not very useful, but consistent).
* If `options.failOnFirstError` is `false`, the deferred returned by `when2` will never fail. It will collect the results from all the deferreds and pass them all back. The caller gets to figure out which values (if any) are errors.
* If no options are given (or `options.failOnFirstError` is `true`), `fail` will be called on the deferred returned by `when2` on the first error (this is the behavior of `jQuery.when`). The args passed to `fail` will be `index` and `value`, indicating which deferred was rejected.
* Any `.progress` callbacks added to the returned deferred are also called with `index` and `value` arguments so you can tell which deferred made progress.  Once the `when2` returned deferred has fired, no further progress events are fired.
* `when2` always makes a new deferred (instead of trying to re-use the single deferred it is given if it only has one argument).
* It might be possible to implement `jQuery.when` in terms of `jQuery.when2`. I tried that originally, but ran into difficulty so decided to leave it for later (or never).
* It would be easy to add convenience functions like `jQuery.whenAnySuccess` or `jQuery.whenAllResolvedOrRejected` that just called `when2` with the correct option.

Usage
=====

Download a copy of `dist/jquery-when2-*.js` and include it in your HTML after including jQuery.

```javascript
// Behave like $.when: wait for the deferred to finish and then resolve
// and reject immediately if any error occurs.
$.when2([defer1, defer2])
```

Development
===========

You should install `grunt` and `jshint`:

    $ npm install -g grunt jshint

To run the tests, either open `test/index.html` in your browser, or run

    $ grunt qunit

I copied some of the `jQuery.when` tests, but some were too complicated to
get right for `when2` so I ended up adding a bunch of small tests as well.

Notes
=====

The approach mirrors what you can do with Twisted's DeferredList (see
http://twistedmatrix.com/documents/current/api/twisted.internet.defer.DeferredList.html),
which gives you the same 3 behaviors: fire on first callback, fire on first
errback, fire when everything is done (errors or not).

A slightly radical possible future thing to add would be to co-opt the
`.progress` callback and use it to instead relay `resolve` info (each call
having an index & a value to show which of the passed deferreds had
resolved). A flag in `options` could request that behavior. It's a
perversion but it's easy to think of ways in which that could be useful.

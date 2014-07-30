//    DOS: De-coupled Object Subscribable (pub/sub, with value check, to break infinite loops), 
//  see future article on jsguy.com!
//  This allows de-coupled updating of elements and models in a widget, similar to KO, AngularJS, etc...
//	Differences: 
//
//	1. We don't dictate the use of templates, or how things are rendered, you can use any templaing system you like
//	2. We encourage progressive enhancement and unobtrusiveness instead of a mix of templates and obtrusiveness
//
var DOS = function (args) {
	var self = this,
		subs = [],
		value = args.value,
		prevValue,
		//	Send notifications to subscribers
		notify = function (value) {
			var i;
			for (i = 0; i < subs.length; i += 1) {
				subs[i].func.apply(subs[i].context, [value]);
			}
		};

	//  Set a value - trigger notifications
	//  Will only trigger when the value has actually changed - this prevents infinite loops
	self.set = function (val) {
		value = val;
		if (prevValue !== value) {
			prevValue = value;
			notify(value);
		}
	};

	self.trigger = function (val) {
		notify((val !== undefined) ? val : value);
	};

	self.get = function () {
		return value;
	};

	self.subscribe = function (func, context) {
		subs.push({ func: func, context: context || self });
	};
};

//	Create a new subscribable object
var dos = function(args) {
	var options = args || {};
	return new DOS(options);
};

(function($){
	//	Very basic DOM binder
	//	Note: Using jQuery as it's easy - we could use any binding library or none at all if we wished...
	$.fn.dosBind = function(viewModel) {
		$(this).each(function(vidx, vele) {
			$('[data-dos]', vele).each(function(idx, ele){
				//	Parse bound values, use semi-colons, not commas - why not?
				var boundList = $(ele).data('dos').split(";"), i, props = {};
				$(boundList).each(function(idx,text) {
					var prop = text.split(":");
					props[$.trim(prop[0])] = $.trim(prop[1]);
				});

				//	Bind properties
				for(i in props) {if(props.hasOwnProperty(i)){
					(function(key, prop) {
						//	Handle value and text
						if(key === 'value') {
							//	Set the initial value as per field, unless a value has already been set
							viewModel[prop].set($(ele).val());
							//	Subscribe to the elements change value function
							$(ele).change(function(){
								viewModel[prop].set($(ele).val());
							});
							//	Subscribe to the value's change function
							viewModel[prop].subscribe(function(){
								$(ele).val(viewModel[prop].get());
							});
						} else if (key === 'text') {
							//	Subscribe to the models value function
							viewModel[prop].subscribe(function(){
								$(ele).text(viewModel[prop].get());
							});
						}
					}(i, props[i]));
				}}

			});

		});
	};
}(window.$));

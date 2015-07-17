/**
 * Author: Tony Brix, Tony@Brix.ninja
 * License: MIT http://www.opensource.org/licenses/mit-license.php
 * Description: 
 */
;
(function ($, window, undefined) {
	"use strict";
	var pluginName = "fixedheader";
	$[pluginName] = function (el, options) {
		var plugin;
		if ($(el).data(pluginName)) {
			plugin = $(el).data(pluginName);
		} else {
			// To avoid scope issues, use 'plugin' instead of 'this'
			// to reference this class from internal events and functions.
			plugin = this;

			// Access to jQuery and DOM versions of element
			plugin.$el = $(el);
			plugin.el = el;
		}

		if (typeof (options) === "object" || options === undefined) {
			plugin._init(options);
		} else if (typeof (options) === "string" && options.substring(0, 1) !== "_" && typeof plugin[options] === "function") {
			plugin[options].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			throw "Invalid Arguments";
		}
	};

	var pluginPrototype = {
		_defaults: {
		},
		_init: function (options) {
			var plugin = this;
			if (plugin.$el.data(pluginName)) {
				throw "Already Initialized";
			}

			plugin.options = $.extend({}, plugin._defaults, options);

			//table needs a div parent that can be set to { position: relative; }
			//PENDING: maybe wrap $el with a div instead of changing parents position
			plugin.$parent = plugin.$el.parent().css({
				position: "relative"
			});
			//clone table
			plugin.$fixedheader = $("<div class='fixedheader'/>").append(plugin.$el.clone(true));

			//hide everything but header
			plugin.$fixedheader.css({
				position: "absolute",
				top: plugin.$el.position().top,
				left: plugin.$el.position().left,
				overflow: "hidden",
				height: $("thead", plugin.$el).height() + 1
			});

			//integrate tablesort plugin
			if (plugin.$el.hasClass("tablesort")) {
				plugin.$el.on("beforeSort.tablesort", function (e, column, direction) {
					$("th", plugin.$fixedheader).removeClass("tablesort-asc tablesort-desc");
					$("th." + column, plugin.$fixedheader).addClass("tablesort-" + direction);
				});
			}

			//append new header and set par
			plugin.$parent.append(plugin.$fixedheader);

			$(window).on("scroll.fixedheader resize.fixedheader", function () {
				plugin._checkPosition();
			});

			// Add a reverse reference to the DOM object
			plugin.$el.data(pluginName, plugin);
		},
		_checkPosition: function () {
			var plugin = this;
			var top = $(window).scrollTop() - plugin.$el.offset().top;
			plugin.$fixedheader.css({
				top: (top > 0 ? top : 0) + plugin.$el.position().top
			});
		},
		_destroy: function () {
			var plugin = this;
			plugin.$fixed.remove();
			plugin.$parent.css({position: ""});
			$(window).off(".fixedheader");

			delete plugin.$el.data()[pluginName];
		}

		// Sample Function
		// 
		// Can be accessed with $(...).pluginName("functionName", parameter1, parameter2, ...);
		// functionName: function(paramater1, parameter2, ...){
		//
		// };
		// 
		// Functions with "_" prefix are private and can only be accessed within this plugin
		// _functionName: function(parameters){
		// 
		// };
		//
	};

	$[pluginName].prototype = pluginPrototype;

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			(new $[pluginName](this, options));
		});
	};

	//add stylesheet before other style sheets to allow overloading
	$(function () {
		var $style = $("<style class='" + pluginName + "-stylesheet'>" +
				"" +
				"</style>");
		var $styles = $("head link[rel='stylesheet'], head style");
		if ($styles.length > 0) {
			$styles.eq(0).before($style);
		} else {
			$("head").append($style);
		}
	});

})(jQuery, window);

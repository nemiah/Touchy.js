/*
 *
 *  This file is part of Touchy.js.

 *  Touchy.js is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.

 *  Touchy.js is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  2013, Rainer Furtmeier - Rainer@Furtmeier.IT
 */

var Touchy = {
	jQuery: $,
	svgX: [28,22.398, 19.594,14, 28,5.602, 22.398,0, 14,8.402, 5.598,0, 0,5.602, 8.398,14, 0,22.398, 5.598,28, 14,19.598, 22.398,28],
	trigger: "click",
	
	wheel: function(element, options){
		Touchy.jQuery(element).on(Touchy.trigger, function(event){
			Touchy.wheelOnFire(event, options);
		});
	},
			
	wheelOnFire: function(event, options){
		var circles = options.data;

		var length = 1; //close button
		for(var propertyName in circles)
			length++;

		var winkel = Math.PI * 1.9 / length;
		var radiusBig = 100;
		var radiusSmall = (2 * Math.PI * radiusBig) / length / 2.3;
		
		var width = radiusBig * 2 + radiusSmall * 2 + 10;
		var height = width;
		
		var s = Snap(width, height);
		Touchy.jQuery(s.node).css("position","absolute");
		
		if(event.clientX){
			var posX = event.clientX - width / 2;
			var posY = event.clientY - height / 2;
		}
		
		else if(event.changedTouches[event.changedTouches.length - 1]){
			var posX = event.changedTouches[event.changedTouches.length - 1].clientX - width / 2;
			var posY = event.changedTouches[event.changedTouches.length - 1].clientY - height / 2;
		}
		
		if(posX < 10)
			posX = 10;
		if(posY < 10)
			posY = 10;
		
		if(posX + width > Touchy.jQuery(window).width())
			posX = Touchy.jQuery(window).width() - width - 10;
		
		if(posY + height > Touchy.jQuery(window).height())
			posY = Touchy.jQuery(window).height() - height - 10;
		
		Touchy.jQuery(s.node).css("position","absolute").css("top", posY).css("left", posX);
		
		
		var startX = radiusBig + radiusSmall + 5;
		var startY = radiusBig + radiusSmall + 5;
		
		var currentValue = null;
		if(typeof options.value === "function")
			currentValue = options.value();
		
		var i = Touchy.drawWheel(s, [startX, startY], circles, radiusBig, radiusSmall, winkel, currentValue);
		
		
		var x = Math.cos(i * winkel - (Math.PI / 4)) * radiusBig;
		var y = Math.sin(i * winkel - (Math.PI / 4)) * radiusBig;


		var g = Touchy.drawCancel(s, [startX + x, startY + y]);
		Touchy.animateCircle(g, radiusSmall, radiusSmall + 5);
		
		window.setTimeout(function(lc){
			lc.animate({r: radiusSmall}, 150);
		}, i * 80, g.select("circle"));
		
		
		Touchy.jQuery(s.node).find("g").on(Touchy.trigger, function(event){
			event.preventDefault();
			event.stopPropagation();

			var value = Touchy.jQuery(event.target).parent().get(0).touchyValue;
			if(typeof value !== "undefined"){
				var lastValue = Touchy.jQuery(this).parent().find(".touchy-wheel-value").get(0);
				if(lastValue)
					Snap(lastValue).attr({"class": "touchy-wheel-circle"});
				
				Snap(this).select("circle").attr({"class": "touchy-wheel-circle touchy-wheel-value"});
				options.selection(value);
			}
			
			var current = this;
			var i = 0;
			Touchy.jQuery(this).parent().find("g").each(function(v, k){
				if(current.isEqualNode(k))
					return true;
				
				if(Snap(k).select("text"))
					Snap(k).select("text").animate({"fill-opacity": 0}, 100, null, function(){ this.remove(); });
				
				Snap(k).select("circle").animate({r: 0}, 100 + i * 100, null, function(){ this.remove(); });
				i++;
			});

			Snap(current).parent().select("circle").animate({"fill-opacity": 0}, 100);

			window.setTimeout(function(){
				Snap(current).select("circle").animate({r: 0}, 200, null, function(){
					this.parent().parent().remove();
					this.remove();
				});
				
				if(Snap(current).select("text"))
					Snap(current).select("text").animate({"fill-opacity": 0}, 100, null, function(){ });
			}, 500);

			return false;
		});
	},
	
	drawWheel: function(s, center, values, radiusBig, radiusSmall, winkel, currentValue){
		var startX = center[0];
		var startY = center[1];
		
		
		var bigC = s.circle(startX, startY, radiusBig + radiusSmall + 5);
		bigC.attr({"fill-opacity": 0, "class": "touchy-wheel-background"});
		bigC.animate({"fill-opacity": .5}, 700);
		
		
		var i = 0;
		for(var key in values){
			var x = Math.cos(i * winkel - (Math.PI / 4)) * radiusBig;
			var y = Math.sin(i * winkel - (Math.PI / 4)) * radiusBig;


			var g = Touchy.drawCircle(s, [startX + x, startY + y], key, values[key], currentValue == key);
			
			Touchy.animateCircle(g, radiusSmall, radiusSmall + 5);


			window.setTimeout(function(lc){
				lc.animate({r: radiusSmall}, 150);
			}, i * 80, g.select("circle"));

			window.setTimeout(function(lt){
				lt.animate({
					"fill-opacity": 1
				}, 200);
			}, i * 100 + 200, g.select("text"));

			i++;
		}
		
		return i;
	},
	
	drawCancel: function(s, center){
		var x = center[0];
		var y = center[1];
		
		var c = s.circle(x, y, 0);
		c.attr({"class": "touchy-wheel-circle", "fill-opacity": 1});

		g = s.g(c);
		g.attr({"class": "touchy-wheel-cancel", "fill-opacity": 0});
		
		return g;
	},
			
	drawCircle: function(s, center, value, label, isSelected){
		var x = center[0];
		var y = center[1];
		
		var c = s.circle(x, y, 0);
		c.attr({"class": "touchy-wheel-circle"+(isSelected ? " touchy-wheel-value" : ""), "fill-opacity": 1});

		var tt = s.text(-100, -100, label);
		var t = s.text(x - (tt.getBBox().width / 2), y + (tt.getBBox().height / 4), label);
		t.attr({ "fill-opacity": 0, "class": "touchy-wheel-text" });
		tt.remove();

		var g = s.g(c, t);
		g.node.touchyValue = value;
		
		return g;
	},
			
	animateCircle: function(g, radiusDefault, radiusOver){
		g.mouseover(function(){
			this.select("circle").animate({r: radiusOver}, 100);
		});

		g.touchstart(function(){
			this.select("circle").animate({r: radiusOver}, 100);
		});


		g.mouseout(function(){
			this.select("circle").animate({r: radiusDefault}, 100);
		});

		g.touchend(function(){
			this.select("circle").animate({r: radiusDefault}, 100);
		});


		g.touchcancel(function(){
			this.select("circle").animate({r: radiusDefault}, 100);
		});
	}
};
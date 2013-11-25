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
			
	wheel: function(element, options, triggerOn){
		if(typeof triggerOn === "undefined")
			triggerOn = "click";
		
		Touchy.jQuery(element).on(triggerOn, function(event){
			Touchy.wheelOnFire(event, options);
		});
	},
			
	wheelOnFire: function(event, options){
		var circles = options.data;

		var length = 0;
		for(var propertyName in circles)
			length++;

		var winkel = Math.PI * 1.9 / length;
		var radiusBig = 100;
		var radiusSmall = (2 * Math.PI * radiusBig) / length / 2.3;
		
		var width = radiusBig * 2 + radiusSmall * 2 + 10;
		var height = width;
		
		var s = Snap(width, height);
		Touchy.jQuery(s.node).css("position","absolute");
		
		var posX = event.clientX - width / 2;
		var posY = event.clientY - height / 2;
		
		if(posX < 10)
			posX = 10;
		if(posY < 10)
			posY = 10;
		
		Touchy.jQuery(s.node).css("position","absolute").css("top", posY).css("left", posX);
		
		
		var startX = radiusBig + radiusSmall + 5;
		var startY = radiusBig + radiusSmall + 5;
		
		var bigC = s.circle(startX, startY, radiusBig);
		bigC.attr({"fill-opacity": 0, "class": "touchy-wheel-background"});
		bigC.animate({"fill-opacity": .5}, 700);
		
		var i = 0;
		for(var value in circles){
			var x = Math.cos(i * winkel - (Math.PI / 4)) * radiusBig;
			var y = Math.sin(i * winkel - (Math.PI / 4)) * radiusBig;

			var c = s.circle(startX + x, startY + y, 0);
			c.attr({"class": "touchy-wheel-circle", "fill-opacity": 1});

			var tt = s.text(-100, -100, circles[value]);
			var t = s.text(startX + x - (tt.getBBox().width / 2), startY + y + (tt.getBBox().height / 4), circles[value]);
			t.attr({ "fill-opacity": 0, "class": "touchy-wheel-text" });
			tt.remove();


			g = s.g(c, t);
			g.node.touchyValue = value;
			
			
			g.mouseover(function(){
				this.select("circle").animate({r: radiusSmall + 5}, 100);
			});
			
			g.touchstart(function(){
				this.select("circle").animate({r: radiusSmall + 5}, 100);
			});


			g.mouseout(function(){
				this.select("circle").animate({r: radiusSmall}, 100);
			});

			g.touchend(function(){
				this.select("circle").animate({r: radiusSmall}, 100);
			});
			

			g.touchcancel(function(){
				this.select("circle").animate({r: radiusSmall}, 100);
			});

			Touchy.jQuery(g.node).on("click touchend", function(event){
				event.preventDefault();
				event.stopPropagation();
				//console.log(Touchy.jQuery(event.target).parent().get(0).touchyValue);
				options.selection(Touchy.jQuery(event.target).parent().get(0).touchyValue);
				
				var current = this;
				var i = 0;
				Touchy.jQuery(this).parent().find("g").each(function(v, k){
					if(current.isEqualNode(k))
						return true;
					
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
					Snap(current).select("text").animate({"fill-opacity": 0}, 100, null, function(){ });
				}, 500);
				
				return false;
			});

			window.setTimeout(function(lc){
				lc.animate({r: radiusSmall}, 150);
			}, i * 80, c);

			window.setTimeout(function(lt){
				lt.animate({
					"fill-opacity": 1
				}, 200);
			}, i * 100 + 200, t);

			i++;
		}
	}
};
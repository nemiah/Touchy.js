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
	current: null,
	
	wheel: function(element, options){
		Touchy.jQuery(element).on(Touchy.trigger, function(event){
			event.preventDefault();
			event.stopPropagation();
					
			Touchy.fire.wheel(event, options);
			
			return false;
		});
	},
	
	fire: {
		wheel: function(event, options){
			if(typeof options.hasCancel === "undefined")
				options.hasCancel = true;
			
			options.rotateLimit = 7;
			
			if(typeof options.radiusBig === "undefined")
				options.radiusBig = 100;
			
			if(typeof options.radiusSmall === "undefined")
				options.radiusSmall = (2 * Math.PI * options.radiusBig) / Touchy.calc.elements(options, true) / 2.3;

				
			if(typeof options.radiusSmallHover === "undefined")
				options.radiusSmallHover = options.radiusSmall + 5;

			var width = options.radiusBig * 2 + options.radiusSmallHover * 2;
			var height = width;
			
			if(typeof options.position === "undefined")
				options.position = Touchy.calc.position(event, width, height);
			
			
			if(typeof options.winkel === "undefined")
				options.winkel = Math.PI * 1.9 / Touchy.calc.elements(options, true);
			
			options.drag = {};
			
			var s = Touchy.draw.wheel(width, height, options);

			options.paper = s;

			Touchy.current = options;
			
			Touchy.event.wheel(s, options);
		}
	},
	
	event: {
		wheel: function(s, options){
				Touchy.current.drag.skip = 0;
				
				Touchy.jQuery(s.node).find("g").on(Touchy.trigger, function(event){
					event.preventDefault();
					event.stopPropagation();

					var value = Touchy.jQuery(event.target).parent().get(0).touchyValue;
					if(typeof value !== "undefined"){
						var lastValue = Touchy.jQuery(this).parent().find(".touchy-wheel-value").get(0);
						if(lastValue)
							Snap(lastValue).attr({"class": "touchy-wheel-circle"});

						Snap(this).select("circle").attr({"class": "touchy-wheel-circle touchy-wheel-value"});
						Touchy.current.selection(value, Touchy.current.data[value]);
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

					Touchy.jQuery(window).off("mousemove", Touchy.event.movemouse);
					Touchy.jQuery(s.node).find("g").off("touchmove", Touchy.event.movetouch);
				});



				Touchy.jQuery(s.node).find("g").on("mouseover", function(event){
					Snap(this).select("circle").animate({r: Touchy.current.radiusSmallHover}, 100);
				});

				Touchy.jQuery(s.node).find("g").on("mouseout", function(event){
					Snap(this).select("circle").animate({r: Touchy.current.radiusSmall}, 100);
				});
				

				Touchy.jQuery(s.node).find("g").on("mousedown", function(event){
					if(!event.originalEvent)
						return;
					
					var trans = Snap.parseTransformString(Snap(event.currentTarget).transform());
					
					Touchy.current.drag.startAt = [trans[0][1], trans[0][2]];
					Touchy.current.drag.startAtAbs = [event.originalEvent.clientX, event.originalEvent.clientY];
					
					
					if(typeof Touchy.current.drag.bow === "undefined"){
						Touchy.current.drag.bow = 0;
						Touchy.current.drag.bowLast = 0;
					}
					
					Touchy.current.drag.mouseDown = true;
				});
				
				
				Touchy.jQuery(window).on("mouseup", function(event){
					Touchy.current.drag.bowLast += Touchy.current.drag.bow;
					
					Touchy.current.drag.mouseDown = false;
				});
				
				
				Touchy.jQuery(s.node).find("g").on("touchstart", function(event){
					if(!event.originalEvent)
						return;
					
					if(!event.originalEvent.touches)
						return;
					
					var trans = Snap.parseTransformString(Snap(event.currentTarget).transform());
					
					Touchy.current.drag.startAt = [trans[0][1], trans[0][2]];
					Touchy.current.drag.startAtAbs = [event.originalEvent.touches[0].clientX, event.originalEvent.touches[0].clientY];
					
					
					if(typeof Touchy.current.drag.bow === "undefined"){
						Touchy.current.drag.bow = 0;
						Touchy.current.drag.bowLast = 0;
					}
					
				
					/*var l1 = Touchy.current.paper.line(Touchy.current.center[0], Touchy.current.center[1], Touchy.current.drag.startAt[0], Touchy.current.drag.startAt[1]);
					l1.attr({"stroke": "black"});

					var l2 = Touchy.current.paper.line(Touchy.current.center[0], Touchy.current.center[1], Touchy.current.drag.startAt[0], Touchy.current.drag.startAt[1]);
					l2.attr({"stroke": "red"});

					Touchy.current.firstLine = l1;
					Touchy.current.secondLine = l2;*/
					
					
					Snap(this).select("circle").animate({r: Touchy.current.radiusSmallHover}, 100);
				});


				Touchy.jQuery(s.node).find("g").on("touchend", function(event){
					Snap(this).select("circle").animate({r: Touchy.current.radiusSmall}, 100);
					Touchy.current.drag.bowLast += Touchy.current.drag.bow;
					/*if(Touchy.current.firstLine){
						Touchy.current.firstLine.remove();
						Touchy.current.secondLine.remove();
					}*/
				});
				
				if(Touchy.calc.elements(options, false) <= options.rotateLimit)
					return;
				
				Touchy.jQuery(window).on("mousemove", Touchy.event.movemouse);
				Touchy.jQuery(s.node).find("g").on("touchmove", Touchy.event.movetouch);
				
				
			},
			
			movetouch: function(event){
				event.preventDefault();
				event.stopPropagation();

				if(Touchy.current.drag.skip < 3){
					Touchy.current.drag.skip++;
					return;
				}

				Touchy.current.drag.skip = 0;

				var options = Touchy.current;

				var dx = event.originalEvent.touches[0].clientX - options.drag.startAtAbs[0];
				var dy = event.originalEvent.touches[0].clientY - options.drag.startAtAbs[1];


				var AB_x = options.drag.startAt[0] - options.center[0];
				var AB_y = options.drag.startAt[1] - options.center[1];

				var CD_x = options.drag.startAt[0] + dx - options.center[0];
				var CD_y = options.drag.startAt[1] + dy - options.center[1];

				Touchy.event.movegeneric(options, AB_x, AB_y, CD_x, CD_y);
			},
			
			movemouse: function(event){
				if(!Touchy.current.drag.mouseDown)
					return;

				if(Touchy.current.drag.skip < 3){
					Touchy.current.drag.skip++;
					return;
				}

				Touchy.current.drag.skip = 0;

				event.preventDefault();
				event.stopPropagation();

				var options = Touchy.current;

				var dx = event.originalEvent.clientX - options.drag.startAtAbs[0];
				var dy = event.originalEvent.clientY - options.drag.startAtAbs[1];


				var AB_x = options.drag.startAt[0] - options.center[0];
				var AB_y = options.drag.startAt[1] - options.center[1];

				var CD_x = options.drag.startAt[0] + dx - options.center[0];
				var CD_y = options.drag.startAt[1] + dy - options.center[1];

				Touchy.event.movegeneric(options, AB_x, AB_y, CD_x, CD_y);
			},
					
			movegeneric: function(options, AB_x, AB_y, CD_x, CD_y){
				var ort = ((AB_x * CD_x) + (AB_y * CD_y)) / (Math.sqrt(Math.pow(AB_x, 2) + Math.pow(AB_y, 2)) * Math.sqrt(Math.pow(CD_x, 2) + Math.pow(CD_y, 2)));
				var bow = Math.acos(ort);

				var leftyRighty = CD_y * AB_x - AB_y * CD_x;

				var sign = leftyRighty ? leftyRighty < 0 ? -1 : 1 : 0;

				bow = bow * sign;

				options.drag.bow = bow;
				bow = bow + options.drag.bowLast;

				/*options.secondLine.attr({
					"x2": options.drag.startAt[0] + dx, 
					"y2": options.drag.startAt[1] + dy});*/


				for(var j = 0; j < options.elements.length; j++){
					var rot = j * options.winkel - (Math.PI / 4) + bow;
					//var rot = rot - ((rot % (Math.PI * 2)) * (Math.PI * 2));
					//console.log(options.drag.maxPi);
					//if(baserot > options.drag.maxPi)
					//	rot = options.drag.maxPi;
					
					var x = Math.cos(rot) * options.radiusBig;
					var y = Math.sin(rot) * options.radiusBig;

					var g = options.elements[j].g;

					var t = new Snap.Matrix();
					t.translate(options.center[0] + x, options.center[1] + y);
					g.transform(t);

				}
			}
	},
	
	calc: {
		elements: function(options, includeOperations){
			var length = ((includeOperations && options.hasCancel) ? 1 : 0);
			for(var propertyName in options.data)
				length++;
			
			if(includeOperations && length > options.rotateLimit)
				length = options.rotateLimit + (options.hasCancel ? 1 : 0);
			
			return length;
		},
		
		value: function(options){
			var currentValue = null;
			if(typeof options.value === "function")
				currentValue = options.value();

			return currentValue;
		},
		
		position: function(event, width, height){
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

			posY += Touchy.jQuery(window).scrollTop();

			if(posX + width > Touchy.jQuery(window).width())
				posX = Touchy.jQuery(window).width() - width - 10;

			if(posY + height > Touchy.jQuery(window).height())
				posY = Touchy.jQuery(window).height() - height - 10;

			return [posX, posY];
		}
	},
	
	draw: {
		wheel: function(width, height, options){
			var pos = options.position;

			var s = Snap(width, height);
			Touchy.jQuery(s.node).css("position","absolute").css("top", pos[1]).css("left", pos[0]);


			var startX = options.radiusBig + options.radiusSmallHover;
			var startY = startX;

			options.center = [startX, startY];

			var bigC = s.circle(startX, startY, options.radiusBig + options.radiusSmallHover);
			bigC.attr({"fill-opacity": 0, "class": "touchy-wheel-background"});
			bigC.animate({"fill-opacity": .5}, 700);

			options.elements = [];

			var i = 0;
			for(var key in options.data){
				var bow = (i < options.rotateLimit - 1 ? i : options.rotateLimit - 1) * options.winkel - (Math.PI / 4);
				var x = Math.cos(bow) * options.radiusBig;
				var y = Math.sin(bow) * options.radiusBig;

				var g = Touchy.draw.circle(s, [startX + x, startY + y], key, options.data[key], Touchy.calc.value(options) == key);
				
				options.elements.push({"g" : g});
				
				if(typeof options.drag.minPi === "undefined")
					options.drag.minPi = bow;
				
				options.drag.maxPi = bow;
				
				i++;
			}
			
			if(i > options.rotateLimit)
				i = options.rotateLimit;
			
			for(var j = 0; j < options.elements.length; j++){
				var g = options.elements[j].g;

				window.setTimeout(function(lc){
					lc.animate({r: options.radiusSmall}, 150);
				}, j * 80, g.select("circle"));

				window.setTimeout(function(lt){
					lt.animate({
						"fill-opacity": 1
					}, 200);
				}, j * 100 + 200, g.select("text"));
			}

			if(options.hasCancel){
				var x = Math.cos(i * options.winkel - (Math.PI / 4)) * options.radiusBig;
				var y = Math.sin(i * options.winkel - (Math.PI / 4)) * options.radiusBig;

				var g = Touchy.draw.cancel(s, [startX + x, startY + y]);
				//Touchy.animate.circle(g, options.radiusSmall, options.radiusSmallHover);

				window.setTimeout(function(lc){
					lc.animate({r: options.radiusSmall}, 150);
				}, i * 80, g.select("circle"));
			}
			
			return s;
		},
				
		cancel: function(s, center){
			var x = center[0];
			var y = center[1];

			var c = s.circle(x, y, 0);
			c.attr({"class": "touchy-wheel-circle", "fill-opacity": 1});

			g = s.g(c);
			g.attr({"class": "touchy-wheel-cancel", "fill-opacity": 0});

			return g;
		},
				
		circle: function(s, center, value, label, isSelected){
			var c = s.circle(0, 0, 0);
			c.attr({"class": "touchy-wheel-circle"+(isSelected ? " touchy-wheel-value" : ""), "fill-opacity": 1});

			var tt = s.text(-100, -100, label);
			var t = s.text(0 - (tt.getBBox().width / 2), 0 + (tt.getBBox().height / 4), label);
			t.attr({ "fill-opacity": 0, "class": "touchy-wheel-text" });
			tt.remove();

			var g = s.g(c, t);
			g.node.touchyValue = value;
			
			var t = new Snap.Matrix();
			t.translate(center[0], center[1]);
			g.transform(t);
				
			return g;
		}
	}
};
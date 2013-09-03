var DangoWorld = new(function () {

	var worldRect = {x: 0,y: 0,width: window.innerWidth,height: window.innerHeight};
	var canvas;
	var context;
	var dangoFamily = [];
	var dango;
	var screenX = window.screenX;
	var screenY = window.screenY;
	var mouseX = worldRect.width * 0.5;
	var mouseY = worldRect.height * 0.5;
	var mouseIsDown = false;
	var timer = 0;
	var gravity = {x: 0,y: 1.2};
	var splitting = {dangoA: -1,dangoB: -1};
	var skins = [{
		fillStyle: "rgba(0,200,250,1.0)",
		strokeStyle: "rgba(255,255,255,1.0)",
		lineWidth: 6,
		fusion: false,
		debug: false
	},
	{
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 0,
		fusion: false,
		debug: true
	},
	{
		fillStyle: "rgba(0,0,0,0.1)",
		strokeStyle: "rgba(255,255,255,1.0)",
		lineWidth: 6,
		fusion: false,
		debug: false
	},
	{
		fillStyle: "rgba(255,60,60,1.0)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 3,
		fusion: false,
		debug: false
	},
	{
		fillStyle: "rgba(255,60,60,0.5)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 3,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "rgba(0,0,0,0.1)",
		strokeStyle: "rgba(255,255,255,0.5)",
		lineWidth: 6,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 0,
		fusion: true,
		debug: true
	},
	{
		fillStyle: "rgba(0,200,250,0.5)",
		strokeStyle: "rgba(255,255,255,1.0)",
		lineWidth: 6,
		fusion: true,
		debug: false
	}];
	/* var skins = [{
		fillStyle: "rgba(0,200,250,1.0)",
		strokeStyle: "#ffffff",
		lineWidth: 5,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 0,
		fusion: true,
		debug: true
	},
	{
		fillStyle: "rgba(0,0,0,0.1)",
		strokeStyle: "rgba(255,255,255,1.0)",
		lineWidth: 6,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "rgba(255,60,60,1.0)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 2,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "rgba(255,255,0,1.0)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 4,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "rgba(255,255,255,1.0)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 4,
		fusion: true,
		debug: false
	},
	{
		fillStyle: "rgba(0,0,0,1.0)",
		strokeStyle: "rgba(0,0,0,1.0)",
		lineWidth: 4,
		fusion: true,
		debug: false
	}]; */

	this.initialize = function (){
		if ((canvas = document.getElementById('world')) && canvas.getContext){
			context = canvas.getContext("2d");
			document.addEventListener("mousemove", documentMouseMoveHandler, false);
			canvas.addEventListener("mousedown", documentMouseDownHandler, false);
			canvas.addEventListener("dblclick", documentMouseDblclickHandler, false);
			document.addEventListener("mouseup", documentMouseUpHandler, false);
			document.addEventListener("keydown", documentKeyDownHandler, false);
			canvas.addEventListener("touchstart", documentTouchStartHandler, false);
			canvas.addEventListener("touchmove", documentTouchMoveHandler, false);
			canvas.addEventListener("touchend", documentTouchEndHandler, false);
			window.addEventListener("resize", windowResizeHandler, false);
			canvas.addEventListener('mousewheel', documentMouseScrollHandler, false);
			createDango({
				x: worldRect.width * 0.15,
				y: worldRect.height * Math.random() * 0.2
			}, {
				x: 0,
				y: 0
			},
			0
			);
			createDango({
				x: worldRect.width * 0.85,
				y: worldRect.height * Math.random() * 0.2
			}, {
				x: 0,
				y: 0
			},
			0
			);
			windowResizeHandler();
			setInterval(loop, 1000 / 60);
		}
	}
  
	function createDango(position, velocity, skin){
		var d = new Dango;
		d.position.x = position.x;
		d.position.y = position.y;
		d.velocity.x = velocity.x;
		d.velocity.y = velocity.y;
		d.skin = skin;
		d.generateNodes();
		dangoFamily.push(d);
	}

  function documentMouseMoveHandler(event) {
    mouseX = event.clientX - (window.innerWidth - worldRect.width) * 0.5;
    mouseY = event.clientY - (window.innerHeight - worldRect.height) * 0.5
  }

  function documentMouseDownHandler(event) {
    event.preventDefault();
    mouseIsDown = true;
    drag();
  }

  function documentMouseUpHandler() {
    mouseIsDown = false;
    if (dango) {
      dango.dragNodeIndex = -1;
      dango = null
    }
  }
  
  function documentMouseScrollHandler(event) {
    event.preventDefault();
	var delta = 0;
	if (event.wheelDelta){//IE/Opera
		delta = event.wheelDelta/120;
		//In Opera 9, delta differs in sign as compared to IE.
		if (window.opera)
			delta = -delta;
	}
	else if (event.detail){//Mozilla case
			 //sign of delta is different than in IE and delta is multiple of 3
			delta = -event.detail/3;
	}
	if(delta<0)
		changeDangoRadius(10);
	else if(delta>0)
		changeDangoRadius(-10);
		
  }

  function documentTouchStartHandler(event) {
    if (event.touches.length == 1) {
      event.preventDefault();
      mouseIsDown = true;
      mouseX = event.touches[0].pageX - (window.innerWidth - worldRect.width) * 0.5;
      mouseX = event.touches[0].pageY - (window.innerHeight - worldRect.height) * 0.5;
	  //double touch
      (new Date).getTime() - timer < 300 ? chop() : drag();
      timer = (new Date).getTime()
    }
  }

  function documentTouchMoveHandler(event) {
    if (event.touches.length == 1) {
      event.preventDefault();
      mouseX = event.touches[0].pageX - (window.innerWidth - worldRect.width) * 0.5;
      mouseY = event.touches[0].pageY - (window.innerHeight - worldRect.height) * 0.5
    }
  }

  function documentTouchEndHandler() {
    mouseIsDown = false;
    if(dango){
      dango.dragNodeIndex = -1;
      dango = null
    }
  }

  function documentMouseDblclickHandler(){
    chop();
  }
  
  function killDango(){
	var d = dangoFamily[nearest(dangoFamily, {x: mouseX,y: mouseY})];
	if(d != null)
		d.killed = true;
  }

  function drag() {
    dango = dangoFamily[nearest(dangoFamily, {x: mouseX,y: mouseY})];
	if(dango != null)
		dango.dragNodeIndex = nearest(dango.nodes, {x: mouseX,y: mouseY})
  }

  function chop(){
    var mouse = {x: mouseX,y: mouseY};
    var d = dangoFamily[nearest(dangoFamily, mouse)];
	if(d != null)
		distanceBetween(d.position, mouse) < d.radius + 30 && d.quality > 8 && dangoFamily.push(d.split())
  }

  function documentKeyDownHandler(event) {
    switch (event.keyCode) {
    case 40:
		killDango();
      break;
    case 38:
      createDango({
			x: worldRect.width * 0.5,
			y: worldRect.height * Math.random() * 0.2
		}, {
			x: 0,
			y: 0
		},
		0
		);
      break;
    case 37:
      changeDangoSkin(-1);
      event.preventDefault();
      break;
    case 39:
      changeDangoSkin(1);
      event.preventDefault();
      break;
	case 107: //+ num
		changeDangoRadius(10);
		event.preventDefault();
		break;
	case 109: //- num
		changeDangoRadius(-10);
		event.preventDefault();
		break;
    }
  }

  function changeDangoSkin(change) {
	var d = dangoFamily[nearest(dangoFamily, {x: mouseX,y: mouseY})];
    d.skin += change;
    d.skin = d.skin < 0 ? skins.length - 1 : d.skin;
    d.skin = d.skin > skins.length - 1 ? 0 : d.skin;
  }

  function changeDangoRadius(offset){
	var d = dangoFamily[nearest(dangoFamily, {x: mouseX,y: mouseY})];
	var oldRadius = d.radius;
	d.radius += offset;
	d.radius = Math.max(40, Math.min(d.radius, 280));
	d.radius != oldRadius && d.updateNormals();
  }

  function nearest(elements, position) {
    for (var i = 9999, n = 9999, d = -1, j = 0, l = elements.length; j < l; j++){
      n = distanceBetween(elements[j].position, {x: position.x,y: position.y});
      if (n < i) {
        i = n;
        d = j;
      }
    }
    return d;
  }

  function windowResizeHandler() {
    worldRect.width = window.innerWidth;
    worldRect.height = window.innerHeight;
    canvas.width = worldRect.width;
    canvas.height = worldRect.height;
    worldRect.x = 3;
    worldRect.y = 3;
    worldRect.width -= 6;
    worldRect.height -= 6
  }

  function loop() {
    var  i, j, n, d;
    for (n=dangoFamily.length, i=0; i < n; i++) {
      d = dangoFamily[i];
      context.clearRect(d.dirtyRegion.left - 80, d.dirtyRegion.top - 80, d.dirtyRegion.right - d.dirtyRegion.left + 160, d.dirtyRegion.bottom - d.dirtyRegion.top + 160);
      d.dirtyRegion.reset();
	  /* if(d.killed){
			console.log('dango: ',dangoFamily[i+1]);
			console.log('kill:'+i+' ',dangoFamily.splice(i, 1));
		} */
    }
	for(i=0;i<dangoFamily.length;i++) if(dangoFamily[i].killed) dangoFamily.splice(i, 1);
    if (splitting.dangoA != -1 && splitting.dangoB != -1) {
      i = splitting.dangoA;
      n = splitting.dangoB;
      d = getTime();
      if (dangoFamily[i] && dangoFamily[n]) 
		if (d - dangoFamily[i].lastSplitTime > 500 && d - dangoFamily[n].lastSplitTime > 500) {
			if(skins[dangoFamily[i].skin].fusion && skins[dangoFamily[n].skin].fusion){
				dangoFamily[i].merge(dangoFamily[n]);
				if (dango == dangoFamily[n] && mouseIsDown) 
					dango = dangoFamily[i];
				dangoFamily.splice(n, 1);
			}
			else{//collision
				dangoFamily[i].strike(dangoFamily[n]);
			}
      }
      splitting.dangoA = -1;
      splitting.dangoB = -1
    }
    if (dango) {
      dango.velocity.x += (mouseX - dango.position.x) * 0.01;
      dango.velocity.y += (mouseY + 100 - dango.position.y) * 0.01
    }
    i = 0;
    for (n = dangoFamily.length; i < n; i++) {
      d = dangoFamily[i];
      for (j = 0; j < n; j++) {
        var odango = dangoFamily[j];
        if (odango != d) 
			if (distanceBetween({x: d.position.x,y: d.position.y}, {x: odango.position.x,y: odango.position.y}) < (d.radius + odango.radius)){
				splitting.dangoA = d.position.x > odango.position.x ? i : j;
				splitting.dangoB = d.position.x > odango.position.x ? j : i;
			}
      }
      d.velocity.x += (window.screenX - screenX) * (0.04 + Math.random() * 0.1);
      d.velocity.y += (window.screenY - screenY) * (0.04 + Math.random() * 0.1);
      j = {
        x: 1.035,
        y: 1.035
      };
      if (d.position.x > worldRect.x + worldRect.width) {
        d.velocity.x -= (d.position.x - worldRect.width) * 0.04;
        j.y += 0.035
      } else if (d.position.x < worldRect.x) {
        d.velocity.x += Math.abs(worldRect.x - d.position.x) * 0.04;
        j.y += 0.035
      }
      if (d.position.y + d.radius * 0.25 > worldRect.y + worldRect.height) {
        d.velocity.y -= (d.position.y + d.radius * 0.25 - worldRect.height) * 0.04;
        j.x += 0.015
      } else if (d.position.y < worldRect.y) {
        d.velocity.y += Math.abs(worldRect.y - d.position.y) * 0.04;
        j.x += 0.015
      }
      d.velocity.x += gravity.x;
      d.velocity.y += gravity.y;
      d.velocity.x /= j.x;
      d.velocity.y /= j.y;
      d.position.x += d.velocity.x;
      d.position.y += d.velocity.y;
      var r, pos, node, joint;
      j = 0;
      for (odango = d.nodes.length; j < odango; j++) {
        node = d.nodes[j];
        node.ghost.x = node.position.x;
        node.ghost.y = node.position.y
      }
      if (d.nodes[d.dragNodeIndex]) {
        d.rotation.target = Math.atan2(mouseY - d.position.y - d.radius * 4, mouseX - d.position.x);
        d.rotation.current += (d.rotation.target - d.rotation.current) * 0.2;
        d.updateNormals()
      }
      j = 0;
      for (odango = d.nodes.length; j < odango; j++) {
        node = d.nodes[j];
        node.normal.x += (node.normalTarget.x - node.normal.x) * 0.05;
        node.normal.y += (node.normalTarget.y - node.normal.y) * 0.05;
        pos = {
          x: d.position.x,
          y: d.position.y
        };
        for (r = 0; r < node.joints.length; r++) {
          joint = node.joints[r];
          var T = joint.node.ghost.y - node.ghost.y - (joint.node.normal.y - node.normal.y);
          joint.strain.x += (joint.node.ghost.x - node.ghost.x - (joint.node.normal.x - node.normal.x) - joint.strain.x) * 0.3;
          joint.strain.y += (T - joint.strain.y) * 0.3;
          pos.x += joint.strain.x * joint.strength;
          pos.y += joint.strain.y * joint.strength
        }
        pos.x += node.normal.x;
        pos.y += node.normal.y;
        r = getArrayIndexByOffset(d.nodes, d.dragNodeIndex, -1);
        joint = getArrayIndexByOffset(d.nodes, d.dragNodeIndex, 1);
        if (d.dragNodeIndex != -1 && (j == d.dragNodeIndex || d.nodes.length > 8 && (j == r || j == joint))) {
          r = j == d.dragNodeIndex ? 0.7 : 0.5;
          pos.x += (mouseX - pos.x) * r;
          pos.y += (mouseY - pos.y) * r
        }
        node.position.x += (pos.x - node.position.x) * 0.1;
        node.position.y += (pos.y - node.position.y) * 0.1;
        node.position.x = Math.max(Math.min(node.position.x, worldRect.x + worldRect.width), worldRect.x);
        node.position.y = Math.max(Math.min(node.position.y, worldRect.y + worldRect.height), worldRect.y);
        d.dirtyRegion.inflate(node.position.x, node.position.y)
      }
      if (!skins[d.skin].debug) {
        context.beginPath();
        context.fillStyle = skins[d.skin].fillStyle;
        context.strokeStyle = skins[d.skin].strokeStyle;
        context.lineWidth = skins[d.skin].lineWidth
      }
      node = getArrayElementByOffset(d.nodes, 0, -1);
      pos = getArrayElementByOffset(d.nodes, 0, 0);
      context.moveTo(node.position.x + (pos.position.x - node.position.x) / 2, node.position.y + (pos.position.y - node.position.y) / 2);
      j = 0;
      for (odango = d.nodes.length; j < odango; j++) {
        node = getArrayElementByOffset(d.nodes, j, 0);
        pos = getArrayElementByOffset(d.nodes, j, 1);
        if (skins[d.skin].debug) {
			context.beginPath();
			context.lineWidth = 1;
			if(skins[d.skin].fusion)
				context.strokeStyle = "rgba(170,170,170,0.5)";
			else
				context.strokeStyle = "#aaa";
			for (r = 0; r < node.joints.length; r++) {
				joint = node.joints[r];
				context.moveTo(node.position.x, node.position.y);
				context.lineTo(joint.node.position.x, joint.node.position.y)
			}
			context.stroke();
			context.beginPath();
			if(skins[d.skin].fusion)
				context.fillStyle = j == 0 ? "rgba(0,255,0,0.5)"  : j == d.dragNodeIndex ? "rgba(255,0,0,0.5)" : "rgba(17,17,17,0.5)";
			else 
				context.fillStyle = j == 0 ? "#00ff00"  : j == d.dragNodeIndex ? "ff0000" : "#111111";
			context.arc(node.position.x, node.position.y, 5, 0, Math.PI * 2, true);
			context.fill();
        } else context.quadraticCurveTo(node.position.x, node.position.y, node.position.x + (pos.position.x - node.position.x) / 2, node.position.y + (pos.position.y - node.position.y) / 2)
      }
      context.stroke();
      context.fill()
	  //Eyes
	  var top = d.nodes[0];
	  var bottom = d.nodes[Math.floor(d.nodes.length/2)];
	  var right = d.nodes[Math.ceil(d.nodes.length/4)];
	  var left = d.nodes[Math.floor(d.nodes.length/4*3)];
	  if(top != null && bottom != null && right != null && left != null){
		  var vect1 = {x: bottom.position.x-top.position.x ,y: bottom.position.y-top.position.y};
		  var vect2 = {x: right.position.x-top.position.x ,y: right.position.y-top.position.y};
		  var vect3 = {x: left.position.x-top.position.x ,y: left.position.y-top.position.y};
		  var el = {
				x: top.position.x+vect3.x*0.5,
				y: top.position.y+vect3.y*0.5,
			};
		var er = {
				x: top.position.x+vect2.x*0.5,
				y: top.position.y+vect2.y*0.5,
			};
		  context.save();
		  context.strokeStyle = skins[d.skin].fillStyle.stroke;
		  context.beginPath();
		  context.lineWidth = skins[d.skin].lineWidth;
		  context.lineJoin = 'round';
		  context.moveTo(el.x, el.y);
		  context.lineTo(el.x+vect1.x*0.2, el.y+vect1.y*0.2);
		  context.closePath();
		  context.stroke();
		  context.beginPath();
		  context.moveTo(er.x, er.y);
		  context.lineTo(er.x+vect1.x*0.2, er.y+vect1.y*0.2);
		  context.closePath();
		  context.stroke();
		  context.restore();
	  }
    }
    screenX = window.screenX;
    screenY = window.screenY
  }
});

function Region() {
  this.top = this.left = 999999;
  this.bottom = this.right = 0
}
Region.prototype.reset = function () {
  this.top = this.left = 999999;
  this.bottom = this.right = 0
};
Region.prototype.inflate = function (b, e) {
  this.left = Math.min(this.left, b);
  this.top = Math.min(this.top, e);
  this.right = Math.max(this.right, b);
  this.bottom = Math.max(this.bottom, e)
};

function Dango(){
  this.position = {x: 0,y: 0};
  this.velocity = {x: 0,y: 0};
  this.radius = 85;
  this.nodes = [];
  this.rotation = {current: 0,target: 0};
  this.dragNodeIndex = -1;
  this.lastSplitTime = 0;
  this.quality = 8;
  this.skin = 0;
  this.killed = false;
  this.dirtyRegion = new Region
}

Dango.prototype.generateNodes = function (){
  this.nodes = [];
  var i, n;
  for (i = 0; i < this.quality; i++){
    n = {
      normal: {
        x: 0,
        y: 0
      },
      normalTarget: {
        x: 0,
        y: 0
      },
      position: {
        x: this.position.x,
        y: this.position.y
      },
      ghost: {
        x: this.position.x,
        y: this.position.y
      },
      angle: 0
    };
    this.nodes.push(n)
  }
  this.updateJoints();
  this.updateNormals();
};
Dango.prototype.updateJoints = function () {
  for (var i = 0; i < this.quality; i++) {
    var n = this.nodes[i];
    n.joints = [];
    /* n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, -1), 0.4));
    n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, 1), 0.4));
    if (this.quality > 4) {
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, -2), 0.4));
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, 2), 0.4))
    }
    if (this.quality > 8) {
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, -3), 0.4));
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, 3), 0.4))
    }
	if (this.quality > 16) {
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, -4), 0.4));
      n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, 4), 0.4))
    } */
	var offset = Math.floor(Math.pow(this.quality,0.5));
	n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i,  - offset), 0.4));
	n.joints.push(new Joint(getArrayElementByOffset(this.nodes, i, offset), 0.4));
  }
};
Dango.prototype.updateNormals = function () {
  var i, j, n;
  for (i = 0; i < this.quality; i++) {
    n = this.nodes[i];
    if (this.dragNodeIndex != -1) {
      j = i - Math.round(this.dragNodeIndex);
      j = j < 0 ? this.quality + j : j
    } else j = i;
    n.angle = j / this.quality * Math.PI * 2 + this.rotation.target;
    n.normalTarget.x = Math.cos(n.angle) * this.radius;
    n.normalTarget.y = Math.sin(n.angle) * this.radius;
    if (n.normal.x == 0 && n.normal.y == 0) {
      n.normal.x = n.normalTarget.x;
      n.normal.y = n.normalTarget.y
    }
  }
};
Dango.prototype.split = function () {
  var r = this.radius / 10,
      n = Math.round(this.nodes.length * 0.5),
      rad = this.radius * 0.5,
      dango = new Dango;
  dango.position.x = this.position.x;
  dango.position.y = this.position.y;
  dango.nodes = [];
  for (var s = 0; s++ < n;) dango.nodes.push(this.nodes.shift());
  var z = n = 0;
  for (s = 0; s < this.nodes.length; s++) n += this.nodes[s].position.x;
  for (s = 0; s < dango.nodes.length; s++) z += dango.nodes[s].position.x;
  dango.velocity.x = z > n ? r : -r;
  dango.velocity.y = this.velocity.y;
  dango.radius = rad;
  dango.quality = dango.nodes.length;
  dango.skin = this.skin;
  this.velocity.x = n > z ? r : -r;
  this.radius = rad;
  this.quality = this.nodes.length;
  this.dragNodeIndex = -1;
  this.updateJoints();
  this.updateNormals();
  dango.dragNodeIndex = -1;
  dango.updateJoints();
  dango.updateNormals();
  dango.lastSplitTime = getTime();
  this.lastSplitTime = getTime();
  return dango
};
Dango.prototype.merge = function (dango){
  this.velocity.x *= 0.5;
  this.velocity.y *= 0.5;
  this.velocity.x += dango.velocity.x * 0.5;
  for (this.velocity.y += dango.velocity.y * 0.5; dango.nodes.length;) this.nodes.push(dango.nodes.shift());
  this.quality = this.nodes.length;
  this.radius += dango.radius;
  this.dragNodeIndex = dango.dragNodeIndex != -1 ? dango.dragNodeIndex : this.dragNodeIndex;
  this.updateNormals();
  this.updateJoints()
};
Dango.prototype.strike = function (dango){
  this.updateNormals();
  this.updateJoints();
};

function Joint(node, strength) {
  this.node = node;
  this.strength = strength;
  this.strain = {x: 0,y: 0}
}

function getArrayIndexByOffset(array, index, offset) {
  if (array[index + offset]) return index + offset;
  if (index + offset > array.length - 1) return index - array.length + offset;
  if (index + offset < 0) return array.length + (index + offset)
}

function getArrayElementByOffset(array, index, offset) {
  return array[getArrayIndexByOffset(array, index, offset)]
}

function getTime() {
  return (new Date).getTime();
}

function distanceBetween(p1, p2){
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.sqrt(dx*dx + dy*dy);
}
DangoWorld.initialize();
/*
 * CutJS viewer for p2.js
 */

Cut.p2 = function(world, options) {
  return new Cut.P2(world, options);
};

Cut.P2 = function(world, options) {
  Cut.P2.prototype._super.apply(this, arguments);

  var self = this;
  this.world = world;

  options = options || {};

  this.debug = options.debug || false;

  this.ratio = options.ratio || 128;

  this.maxSubSteps = options.maxSubSteps || 3;
  this.timeStep = options.timeStep || 1 / 60;

  this.lineWidth = "lineWidth" in options ? Cut._function(options.lineWidth)
      : Cut._function(0.025);
  this.lineColor = "lineColor" in options ? Cut._function(options.lineColor)
      : Cut._function("#000000");
  this.fillColor = "fillColor" in options ? Cut._function(options.fillColor)
      : Cut._function(Cut.P2.randomColor);

  world.on("addBody", function(e) {
    self.addRenderable(e.body);

  }).on("removeBody", function(e) {
    self.removeRenderable(e.body);

  }).on("addSpring", function(e) {
    self.addRenderable(e.spring);

  }).on("removeSpring", function(e) {
    self.removeRenderable(e.spring);
  });

  this.drawContacts = false;
  this.toggleContact = function(toggle) {
    if (arguments.length) {
      this.drawContacts = toggle;
    } else {
      this.drawContacts = !this.drawContacts;
    }
    return this;
  };

  // Add initial bodies
  for (var i = 0; i < world.bodies.length; i++) {
    this.addRenderable(world.bodies[i]);
  }
  for (var i = 0; i < world.springs.length; i++) {
    this.addRenderable(world.springs[i]);
  }

  this.tick(function() {
    this.step();
  });

  this.tempv = p2.vec2.fromValues(0, 0);
};

Cut.P2.prototype = new Cut(Cut.Proto);
Cut.P2.prototype._super = Cut;
Cut.P2.prototype.constructor = Cut.P2;

Cut.P2.prototype.step = function(t) {
  this.world.step(this.timeStep, t, this.maxSubSteps);

  for (var i = 0; i < this.world.bodies.length; i++) {
    var body = this.world.bodies[i];
    if (body.ui) {
      body.ui.pin({
        offsetX : body.position[0],
        offsetY : -body.position[1],
        rotation : -body.angle
      });
    }
  }
  for (var i = 0; i < this.world.springs.length; i++) {
    var spring = this.world.springs[i];

    spring.getWorldAnchorA(this.tempv);
    var ax = this.tempv[0];
    var ay = this.tempv[1];

    spring.getWorldAnchorB(this.tempv);
    var bx = this.tempv[0];
    var by = this.tempv[1];

    // Spring position is the mean point between the anchors
    var x = (ax + bx) / 2;
    var y = (ay + by) / 2;

    // Compute distance vector between anchors, in screen coords
    var dx = ax - bx;
    var dy = ay - by;

    var a = Math.atan2(dx, dy) + Math.PI / 2;

    var s = Cut.Math.length(dx, dy) / spring.restLength;

    spring.ui.pin({
      offsetX : x,
      offsetY : -y,
      scaleX : s,
      rotation : a
    });
  }
};

Cut.P2.prototype.addRenderable = function(obj) {

  if (!this.debug && typeof obj.ui !== "undefined") {
    obj.ui && obj.ui.appendTo(this);
    return;
  }

  obj.ui = Cut.create().appendTo(this);

  if (obj instanceof p2.Body && obj.shapes.length) {
    if (obj.concavePath && !this.debugPolygons) {
      var cutout = this.drawConvex(obj.concavePath);
      Cut.image(cutout).appendTo(obj.ui).pin({
        handle : 0.5,
        offsetX : obj.shapeOffsets[i] ? obj.shapeOffsets[i][0] : 0,
        offsetY : -(obj.shapeOffsets[i] ? obj.shapeOffsets[i][1] : 0),
        rotation : -obj.shapeAngles[i] || 0
      });

    } else {
      for (var i = 0; i < obj.shapes.length; i++) {
        var shape = obj.shapes[i];

        var cutout = null;
        if (shape instanceof p2.Circle) {
          cutout = this.drawCircle(shape.radius);

        } else if (shape instanceof p2.Particle) {
          cutout = this.drawCircle(2 * this.lineWidth(), {
            lineColor : "",
            fillColor : this.lineColor()
          });

        } else if (shape instanceof p2.Plane) {
          cutout = this.drawPlane(-10, 10, 10);

        } else if (shape instanceof p2.Line) {
          cutout = this.drawLine(shape.length);

        } else if (shape instanceof p2.Rectangle) {
          cutout = this.drawRectangle(shape.width, shape.height);

        } else if (shape instanceof p2.Capsule) {
          cutout = this.drawCapsule(shape.length, shape.radius);

        } else if (shape instanceof p2.Convex) {
          if (shape.vertices.length) {
            cutout = this.drawConvex(shape.vertices);
          }
        }
        Cut.image(cutout).appendTo(obj.ui).pin({
          handle : 0.5,
          offsetX : obj.shapeOffsets[i] ? obj.shapeOffsets[i][0] : 0,
          offsetY : -(obj.shapeOffsets[i] ? obj.shapeOffsets[i][1] : 0),
          rotation : -obj.shapeAngles[i] || 0
        });
      }
    }

  } else if (obj instanceof p2.Spring) {
    var cutout = this.drawSpring(obj.restLength);
    Cut.image(cutout).appendTo(obj.ui).pin({
      handle : 0.5
    });
  }

};

Cut.P2.prototype.removeRenderable = function(obj) {
  obj.ui && (obj.ui.drop ? obj.ui.drop() : obj.ui.remove());
};

Cut.P2.prototype.drawLine = function(length, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth * 2, lineColor = options.lineColor, fillColor = options.fillColor;

  return Cut.Out.drawing(length + 2 * lineWidth, lineWidth, this.ratio,
      function(ctx, ratio) {
        ctx.scale(ratio, ratio);

        ctx.moveTo(lineWidth, lineWidth / 2);
        ctx.lineTo(lineWidth + length, lineWidth / 2);

        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = lineColor;
        ctx.stroke();
      });

};

Cut.P2.prototype.drawRectangle = function(w, h, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  var width = w + 2 * lineWidth;
  var height = h + 2 * lineWidth;

  return Cut.Out.drawing(width, height, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);
    ctx.beginPath();
    ctx.rect(lineWidth, lineWidth, w, h);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
  });
};

Cut.P2.prototype.drawCircle = function(radius, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  var width = radius * 2 + lineWidth * 2;
  var height = radius * 2 + lineWidth * 2;

  return Cut.Out.drawing(width, height, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    ctx.moveTo(radius + lineWidth, radius + lineWidth);
    ctx.lineTo(lineWidth, radius + lineWidth);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
  });
};

Cut.P2.prototype.drawCapsule = function(len, radius, options) {

  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  var width = len + 2 * radius + 2 * lineWidth;
  var height = 2 * radius + 2 * lineWidth;

  return Cut.Out.drawing(width, height, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);

    ctx.beginPath();
    ctx.moveTo(radius + lineWidth, lineWidth);
    ctx.lineTo(len + radius + lineWidth, lineWidth);
    ctx.arc(len + radius + lineWidth, radius + lineWidth, radius, -Math.PI / 2,
        Math.PI / 2);
    ctx.lineTo(radius + lineWidth, 2 * radius + lineWidth);
    ctx.arc(radius + lineWidth, radius + lineWidth, radius, Math.PI / 2,
        -Math.PI / 2);
    ctx.closePath();
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
  });
};

Cut.P2.prototype.drawSpring = function(length, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  length = Math.max(length, lineWidth * 10);

  var N = 12;
  var dx = length / N;
  var dy = 0.2 * length;

  return Cut.Out.drawing(length, dy * 2, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.lineJoin = "round";

    ctx.moveTo(0, dy);
    for (var i = 1; i < N; i++) {
      var x = dx * i;
      var y = dy;
      if (i <= 1 || i >= N - 1) {
        // Do nothing
      } else if (i % 2 === 0) {
        y -= dy / 2;
      } else {
        y += dy / 2;
      }
      ctx.lineTo(x, y);
    }
    ctx.lineTo(length, dy);

    ctx.stroke();
  });
};

Cut.P2.prototype.drawPlane = function(x0, x1, max, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  return Cut.Out.drawing(max * 2, max * 2, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);

    if (fillColor) {
      ctx.beginPath();
      ctx.rect(0, max, 2 * max, 2 * max);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.closePath();
    }

    ctx.beginPath();
    ctx.moveTo(0, max);
    ctx.lineTo(2 * max, max);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = lineColor;
    ctx.setLineDash && ctx.setLineDash([ 0.12, 0.06 ]);
    ctx.mozDash = [ 0.12, 0.06 ];

    ctx.stroke();
  });

};

Cut.P2.prototype.drawConvex = function(verts, options) {
  options = this.options(options);
  var lineWidth = options.lineWidth, lineColor = options.lineColor, fillColor = options.fillColor;

  if (!verts.length) {
    return;
  }

  var width = 0, height = 0;
  for (var i = 0; i < verts.length; i++) {
    var v = verts[i], x = v[0], y = -v[1];
    width = Math.max(Math.abs(x), width);
    height = Math.max(Math.abs(y), height)
  }

  var cutout = Cut.Out.drawing(2 * width + 2 * lineWidth, 2 * height + 2
      * lineWidth, this.ratio, function(ctx, ratio) {
    ctx.scale(ratio, ratio);

    ctx.beginPath();
    for (var i = 0; i < verts.length; i++) {
      var v = verts[i], x = v[0] + width + lineWidth, y = -v[1] + height
          + lineWidth;
      if (i == 0)
        ctx.moveTo(x, y);
      else
        ctx.lineTo(x, y);
    }

    if (verts.length > 2) {
      ctx.closePath();
    }

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.closePath();
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = lineColor;
    ctx.stroke();
  });

  return cutout;
};

Cut.P2.prototype.options = function(options) {
  options = typeof options === "object" ? options : {};
  options.lineWidth = options.lineWidth || this.lineWidth();
  options.lineColor = options.lineColor || this.lineColor();
  options.fillColor = options.fillColor || this.fillColor();
  return options;
};

Cut.P2.randomColor = function() {
  var red = Cut.Math.random(192, 256) | 0;
  var green = Cut.Math.random(192, 256) | 0;
  var blue = Cut.Math.random(192, 256) | 0;
  return "#" + red.toString(16) + green.toString(16) + blue.toString(16);
};
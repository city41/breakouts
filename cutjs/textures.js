var PPU = 160; // pixel per (physics engine) unit

Cut.addTexture({
  name : "logo",
  imagePath : "logo.png",
  imageRatio : PPU,
  ratio : 1 / PPU,
  cutouts : [
    { name : "logo", x : 0, y : 0, width : 130, height : 200 }
  ]
});

Cut.addTexture({
  name : "bg",
  imagePath : "bg_prerendered.png",
  imageRatio : PPU,
  ratio : 1 / PPU,
  cutouts : [
    { name : "prerendered", x : 0, y : 0,  width : 320, height : 416 }
  ]
});

Cut.addTexture({
  name : "tiles",
  imagePath : "tiles.png",
  imageRatio : PPU,
  ratio : 1 / PPU,
  cutouts : [
    { name : "bb_0",      x : 0,   y : 0,   width : 32,  height : 16 },
    { name : "bb_1",      x : 32,  y : 0,   width : 32,  height : 16 },
    { name : "bb_2",      x : 64,  y : 0,   width : 32,  height : 16 },
    { name : "bb_3",      x : 96,  y : 0,   width : 32,  height : 16 },

    { name : "bo_0",      x : 0,   y : 16,  width : 32,  height : 16 },
    { name : "bo_1",      x : 32,  y : 16,  width : 32,  height : 16 },
    { name : "bo_2",      x : 64,  y : 16,  width : 32,  height : 16 },
    { name : "bo_3",      x : 96,  y : 16,  width : 32,  height : 16 },

    { name : "br_0",      x : 0,   y : 32,  width : 32,  height : 16 },
    { name : "br_1",      x : 32,  y : 32,  width : 32,  height : 16 },
    { name : "br_2",      x : 64,  y : 32,  width : 32,  height : 16 },
    { name : "br_3",      x : 96,  y : 32,  width : 32,  height : 16 },

    { name : "bg_0",      x : 0,   y : 48,  width : 32,  height : 16 },
    { name : "bg_1",      x : 32,  y : 48,  width : 32,  height : 16 },
    { name : "bg_2",      x : 64,  y : 48,  width : 32,  height : 16 },
    { name : "bg_3",      x : 96,  y : 48,  width : 32,  height : 16 },

    { name : "ball_0",    x : 48,  y : 64,  width : 16,  height : 16 },
    { name : "ball_1",    x : 64,  y : 64,  width : 16,  height : 16 },
    { name : "ball_2",    x : 80,  y : 64,  width : 16,  height : 16 },
    { name : "ball_3",    x : 96,  y : 64,  width : 16,  height : 16 },
    { name : "ball_4",    x : 112, y : 64,  width : 16,  height : 16 },

    { name : "paddleFull",x : 0,   y : 64,  width : 48,  height : 16 },
    { name : "paddleMini",x : 0,   y : 80,  width : 32,  height : 16 },

    { name : "+",         x : 96,  y : 96,  width : 16,  height : 16 },
    { name : "-",         x : 112, y : 96,  width : 16,  height : 16 },

    { name : "tri",       x : 0,   y : 96,  width : 32,  height : 48 },
    { name : "two",       x : 32,  y : 96,  width : 32,  height : 48 },
    { name : "one",       x : 64,  y : 96,  width : 32,  height : 48 },
  ]
});

Cut.addTexture({
  name : "font",
  factory : function(name) {
    var prefix = "_";
    if (name.substring(0, prefix.length) === prefix) {
      var d = name.substr(prefix.length, 1);
      return Cut.Out.drawing(prefix + d, 32 / PPU, 16 / PPU, 300, function(ctx, ratio) {
        ctx.scale(ratio / PPU, ratio / PPU);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#000";
        ctx.measureText && this.cropX((ctx.measureText(d).width + 0.01) / PPU);
        ctx.textBaseline = "top";
        ctx.fillText(d, 0, 0);
      });
    }
  }
});

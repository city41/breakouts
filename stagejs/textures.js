var PPU = 160; // pixel per (physics engine) unit

Stage({
  image : {
    url : "graphic/logo.png",
    ratio : PPU
  },
  ppu : 1 / PPU,
  textures : {
    "logo" : { x : 0, y : 0, width : 130, height : 200 }
  }
});

Stage({
  name : "bg",
  image : {
    url : "graphic/bg_prerendered.png",
    ratio : PPU
  },
  ppu : 1 / PPU,
  textures : {
    "prerendered" : { x : 0, y : 0,  width : 320, height : 416 }
  }
});

Stage({
  image : {
    url : "graphic/tiles.png",
    ratio : PPU
  },
  ppu : 1 / PPU,
  textures : {
    "b" : [
      { x : 0,   y : 0,   width : 32,  height : 16 },
      { x : 32,  y : 0,   width : 32,  height : 16 },
      { x : 64,  y : 0,   width : 32,  height : 16 },
      { x : 96,  y : 0,   width : 32,  height : 16 }
    ],

    "o" : [
      { x : 0,   y : 16,  width : 32,  height : 16 },
      { x : 32,  y : 16,  width : 32,  height : 16 },
      { x : 64,  y : 16,  width : 32,  height : 16 },
      { x : 96,  y : 16,  width : 32,  height : 16 }
    ],

    "r" : [
      { x : 0,   y : 32,  width : 32,  height : 16 },
      { x : 32,  y : 32,  width : 32,  height : 16 },
      { x : 64,  y : 32,  width : 32,  height : 16 },
      { x : 96,  y : 32,  width : 32,  height : 16 }
    ],

    "g" : [
      { x : 0,   y : 48,  width : 32,  height : 16 },
      { x : 32,  y : 48,  width : 32,  height : 16 },
      { x : 64,  y : 48,  width : 32,  height : 16 },
      { x : 96,  y : 48,  width : 32,  height : 16 }
    ],

    "ball"  : [
      { x : 48,  y : 64,  width : 16,  height : 16 },
      { x : 64,  y : 64,  width : 16,  height : 16 },
      { x : 80,  y : 64,  width : 16,  height : 16 },
      { x : 96,  y : 64,  width : 16,  height : 16 },
      { x : 112, y : 64,  width : 16,  height : 16 }
    ],

    "paddleFull" : { x : 0,   y : 64,  width : 48,  height : 16 },
    "paddleMini" : { x : 0,   y : 80,  width : 32,  height : 16 },

    "+" : { x : 96,  y : 96,  width : 16,  height : 16 },
    "-" : { x : 112, y : 96,  width : 16,  height : 16 },

    "tri" : { x : 0,   y : 96,  width : 32,  height : 48 },
    "two" : { x : 32,  y : 96,  width : 32,  height : 48 },
    "one" : { x : 64,  y : 96,  width : 32,  height : 48 },
  }
});

Stage({
  textures : {
    "font" : function(d) {
      return Stage.canvas(function(ctx) {
        var ratio = 300;
        this.size(10 / PPU, 16 / PPU, ratio);
        ctx.scale(ratio / PPU, ratio / PPU);
        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "top";
        ctx.fillText(d, 0, 0);
      });
    }
  }
});

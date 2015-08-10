Entropy.Entity({
    name: "WallLeft",
    create: function (game, material) {
        var plane = new p2.Body({
            position : [-14.4, 0],
            angle: -Math.PI / 2,
        });

        var planeShape = new p2.Plane();

        planeShape.material = game.materials.wallMaterial;

        plane.addShape(planeShape);
        
        game.world.addBody(plane);

        this.add("Body", plane);
    }
});
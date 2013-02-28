define([
  'dcl',
  'frozen/box2d/joints/Prismatic'
], function(dcl, Prismatic){

  return dcl(Prismatic, {
    bodyId1: 'paddle',
    bodyId2: 'leftWall',
    id: 'pJoint'
  });

});
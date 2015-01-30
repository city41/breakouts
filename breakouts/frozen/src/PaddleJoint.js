define([
  'dcl',
  'frozen/box2d/joints/Prismatic'
], function(dcl, Prismatic){

  'use strict';

  return dcl(Prismatic, {
    bodyId1: 'paddle',
    bodyId2: 'leftWall',
    id: 'pJoint'
  });

});
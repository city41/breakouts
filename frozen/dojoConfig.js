var dojoConfig = {
  baseUrl: './',
  packages: [
    {
      name: 'dojo',
      location: 'deps/dojo'
    },
    {
      name: 'dcl',
      location: 'deps/dcl',
      main: 'dcl'
    },
    {
      name: 'frozen',
      location: 'deps/frozen/src',
      main: 'GameCore'
    },
    {
      name: 'lodash',
      location: 'deps/lodash',
      main: 'lodash'
    },
    {
      name: 'game',
      location: 'src',
      main: 'game'
    },
    {
      name: 'sounds',
      location: 'resources/sfx'
    }
  ],
  deps: ['game'],
  async: true
};
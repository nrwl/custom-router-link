module.exports = {
  name: 'link-extended',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/link-extended/',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

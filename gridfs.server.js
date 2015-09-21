var path = Npm.require('path');
var mongodb = Npm.require('mongodb');
var ObjectID = Npm.require('mongodb').ObjectID;
var Grid = Npm.require('gridfs-stream');
var DevNull = Npm.require('dev-null');
//var Grid = Npm.require('gridfs-locking-stream');

var chunkSize = 1024*1024*2; // 256k is default GridFS chunk size, but performs terribly for largish files

/**
 * @public
 * @constructor
 * @param {String} name - The store name
 * @param {Object} options
 * @param {Function} [options.beforeSave] - Function to run before saving a file from the server. The context of the function will be the `FS.File` instance we're saving. The function may alter its properties.
 * @param {Number} [options.maxTries=5] - Max times to attempt saving a file
 * @returns {FS.StorageAdapter} An instance of FS.StorageAdapter.
 *
 * Creates a GridFS store instance on the server. Inherits from FS.StorageAdapter
 * type.
 */

FS.Store.GridFSReadOnly = function(name, options) {
  var self = this;
  options = options || {};

  var gridfsName = name;
  var mongoOptions = options.mongoOptions || {};

  if (!(self instanceof FS.Store.GridFSReadOnly))
    throw new Error('FS.Store.GridFSReadOnly missing keyword "new"');

  if (!options.mongoUrl) {
    options.mongoUrl = process.env.MONGO_URL;
    // When using a Meteor MongoDB instance, preface name with "cfs_gridfs."
    gridfsName = "cfs_gridfs." + name;
  }

  if (!options.mongoOptions) {
    options.mongoOptions = { db: { native_parser: true }, server: { auto_reconnect: true }};
  }

  if (options.chunkSize) {
    chunkSize = options.chunkSize;
  }

  return new FS.StorageAdapter(name, options, {

    typeName: 'storage.gridfs',
    fileKey: function(fileObj) {
      // We should not have to mount the file here - We assume its taken
      // care of - Otherwise we create new files instead of overwriting
      var key = {
        _id: null,
        filename: null
      };

      // If we're passed a fileObj, we retrieve the _id and filename from it.
      if (fileObj) {
        var info = fileObj._getInfo(name, {updateFileRecordFirst: false});
        key._id = info.key || null;
        key.filename = info.name || fileObj.name({updateFileRecordFirst: false}) || (fileObj.collectionName + '-' + fileObj._id);
      }

      // If key._id is null at this point, createWriteStream will let GridFS generate a new ID
      return key;
    },
    createReadStream: function(fileKey, options) {
      options = options || {};

      // Init GridFS
      var gfs = new Grid(self.db, mongodb);

      // Set the default streamning settings
      var settings = {
        _id: new ObjectID(fileKey._id),
        root: gridfsName
      };

      // Check if this should be a partial read
      if (typeof options.start !== 'undefined' && typeof options.end !== 'undefined' ) {
        // Add partial info
        settings.range = {
          startPos: options.start,
          endPos: options.end
        };
      }

      FS.debug && console.log('GRIDFS', settings);

      return gfs.createReadStream(settings);

    },
    createWriteStream: function() {
      return DevNull();
    },
    remove: function(fileKey, callback) {
      callback();
    },

    // Not implemented
    watch: function() {
      throw new Error("GridFS storage adapter does not support the sync option");
    },

    init: function(callback) {
      mongodb.MongoClient.connect(options.mongoUrl, mongoOptions, function (err, db) {
        if (err) { return callback(err); }
        self.db = db;
        callback(null);
      });
    }
  });
};

Package.describe({
  name: "ekuiter:gridfs-read-only",
  version: "0.0.33",
  summary: "Read-only GridFS storage adapter for CollectionFS",
  git: "https://github.com/ekuiter/meteor-gridfs-read-only"
});

Npm.depends({
  mongodb: "1.4.35",
  "gridfs-stream": "0.5.3",
  "dev-null": "0.1.1"
});

Package.onUse(function(api) {
  api.versionsFrom("1.0");

  api.use(["cfs:base-package@0.0.30", "cfs:storage-adapter@0.2.1"]);
  api.addFiles("gridfs.server.js", "server");
  api.addFiles("gridfs.client.js", "client");
});
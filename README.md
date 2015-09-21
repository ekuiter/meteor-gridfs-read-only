# ekuiter:gridfs-read-only

## In a nutshell

Usage example:

    FS.TempStore.Storage = new FS.Store.GridFSReadOnly("_tempstore", { internal: true });
    
    Images = new FS.Collection("images", {
      stores: [
        new FS.Store.GridFSReadOnly("small"),
        new FS.Store.GridFSReadOnly("medium"),
        new FS.Store.GridFSReadOnly("large")
      ]
    });

## Background

This package provides read-only access to a MongoDB GridFS storage.

This proves useful if you have, say, two Meteor apps:

- a backend where you can upload / edit / remove images using the normal GridFS adapter
  ([cfs:gridfs](https://atmospherejs.com/cfs/gridfs))
- a frontend where those images can then be viewed / downloaded using this read-only adapter

If both apps access the same `MONGO_URL` and use cfs:gridfs, your frontend app will detect whenever you upload
a file in your backend and try to upload it as well (sounds strange, but I found this to be true). In this case,
both the back- and frontend will store (redundant) data in GridFS. Removing files is affected too: You end up
with data garbage in GridFS.

To prevent this from happening, just prevent the frontend from writing to GridFS. To do this you can use this
package. It just removes the writing / removing functionality from the cfs:gridfs package - reading / downloading works
normally.

Just add the package:

    meteor add ekuiter:gridfs-read-only

Then replace every `new FS.Store.GridFS(...)` in your frontend app with `new FS.Store.GridFSReadOnly(...)`.
I found it useful to make the TempStore read-only too - add this line somewhere before you use any `FS` classes:

    FS.TempStore.Storage = new FS.Store.GridFSReadOnly("_tempstore", { internal: true });
    
I hope CollectionFS will add support for multiple apps to the core eventually. Until that, this might help you out :)

(Notice that this approach might work with other adapters than GridFS too (like S3 or Dropbox) - I haven't tested it though.)
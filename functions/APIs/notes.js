const { db } = require("../util/admin");

exports.getAllNotes = (request, response) => {
  db.collection("notes")
    .where("userId", "==", request.user.username)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let notes = [];
      data.forEach((doc) => {
        notes.push({
          noteId: doc.id,
          body: doc.data().body,
          title: doc.data().title,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(notes);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.postOneNote = (request, response) => {
  if (request.body.body.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  const newNoteItem = {
    body: request.body.body,
    title: request.body.title,
    userId: request.user.username,
    createdAt: new Date().toISOString(),
  };

  db.collection("notes")
    .add(newNoteItem)
    .then((doc) => {
      const responseNoteItem = newNoteItem;
      responseNoteItem.id = doc.id;
      return response.json(responseNoteItem);
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.deleteNote = (request, response) => {
  const document = db.doc(`/notes/${request.params.noteId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Note not found" });
      }
      if (doc.data().userId !== request.user.username) {
        return response.status(403).json({ error: "UnAuthorized" });
      }
      return document.delete();
    })
    .then(() => {
      response.json({ message: "Delete successfull" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.editNote = (request, response) => {
  if (request.body.noteId || request.body.createdAt) {
    response.status(403).json({ message: "Not allowed to edit" });
  }
  let document = db.collection("notes").doc(`${request.params.noteId}`);
  document
    .update(request.body)
    .then(() => {
      response.json({ message: "Updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({
        error: err.code,
      });
    });
};

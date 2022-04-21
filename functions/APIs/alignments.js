const { db } = require("../util/admin");
const moment = require("moment");

exports.createAlignment = (request, response) => {
  if (request.body.name.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }
  if (moment(request.body.firstDate) < moment()) {
    return response
      .status(400)
      .json({ body: "First date can't be in the past" });
  }

  const newAlignmentItem = {
    name: request.body.name,
    description: request.body.description,
    teamQuestions: request.body.teamQuestions,
    privateQuestions: request.body.privateQuestions,
    cadence: request.body.cadence,
    day: request.body.day,
    time: request.body.time,
    firstDate: request.body.firstDate,
    duration: request.body.duration,
    teamId: request.body.teamId,
    userId: request.user.username,
    createdAt: moment().toISOString(),
  };

  let newSession = {};
  let alignmentId;

  db.collection("alignments")
    .add(newAlignmentItem)
    .then((doc) => {
      const responseAlignmentItem = newAlignmentItem;
      responseAlignmentItem.id = doc.id;
      alignmentId = doc.id;
      return responseAlignmentItem;
    })
    .then((response) => {
      newSession = {
        name: response.name,
        description: response.description,
        teamQuestions: response.teamQuestions,
        privateQuestions: response.privateQuestions,
        startDate: response.firstDate,
        endDate: moment(response.firstDate)
          .add(response.duration, "hours")
          .toISOString(),
        teamId: response.teamId,
        alignmentId: response.id,
        userId: request.user.username,
        completed: [],
        createdAt: new Date().toISOString(),
        users: [],
      };
      return db.doc(`/teams/${response.teamId}`).get();
    })
    .then((doc) => {
      newSession.users = doc.data().users;
      return db.collection("sessions").add(newSession);
    })
    .then((doc) => {
      newSession.id = doc.id;
      return newSession.id;
    })
    .then((sessionId) => {
      let list = [sessionId];
      return db
        .collection("alignments")
        .doc(alignmentId)
        .update({ sessions: list });
    })
    .then(() => {
      return response.json(newSession);
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.getAlignments = (request, response) => {
  db.collection("alignments")
    .where("teamId", "==", request.params.teamId)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let alignments = [];
      data.forEach((doc) => {
        alignments.push({
          alignmentId: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(alignments);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.getSessionsOfTeam = (request, response) => {
  db.collection("sessions")
    .where("teamId", "==", request.params.teamId)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let sessions = [];
      data.forEach((doc) => {
        sessions.push({
          sessionId: doc.id,
          name: doc.data().name,
          completed: doc.data().completed,
          startDate: moment(doc.data().startDate).format("MMM Do YY"),
          alignmentId: doc.data().alignmentId,
          privateQuestions: doc.data().privateQuestions,
          teamQuestions: doc.data().teamQuestions,
        });
      });
      return response.json(sessions);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.createSession = (request, response) => {
  let newSession = {};

  if (moment(request.body.date) < moment()) {
    return response.status(400).json({ body: "Date can't be in the past" });
  }

  db.doc(`/alignments/${request.params.alignmentId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Alignment not found" });
      }
      return doc;
    })
    .then((doc) => {
      newSession = {
        name: doc.data().name,
        description: doc.data().description,
        teamQuestions: doc.data().teamQuestions,
        privateQuestions: doc.data().privateQuestions,
        startDate: moment(request.body.date).add(doc.data().time, "hours"),
        endDate: moment(request.body.date)
          .add(doc.data().time, "hours")
          .add(doc.data().duration, "hours"),
        teamId: doc.data().teamId,
        completed: [],
        createdAt: new Date().toISOString(),
      };
      return db.collection("sessions").add(newSession);
    })
    .then((doc) => {
      const responseSession = newSession;
      responseSession.id = doc.id;
      return response.json(responseSession);
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.deleteAlignment = (request, response) => {
  const document = db.doc(`/alignments/${request.params.alignmentId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Alignment not found" });
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

exports.editAlignment = (request, response) => {
  if (request.body.alignmentId || request.body.createdAt) {
    response.status(403).json({ message: "Not allowed to edit" });
  }
  let document = db
    .collection("alignments")
    .doc(`${request.params.alignmentId}`);
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

exports.editSession = (request, response) => {
  let body = request.body;
  let document = db.collection("sessions").doc(`${request.params.sessionId}`);
  document
    .update(body)
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

exports.getSessions = (request, response) => {
  db.collection("sessions")
    .where("users", "array-contains", request.user.username)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let sessions = [];
      data.forEach((doc) => {
        sessions.push({
          sessionId: doc.id,
          name: doc.data().name,
          completed: doc.data().completed,
          endDate: doc.data().endDate,
          startDate: doc.data().startDate,
          teamId: doc.data().teamId,
          alignmentId: doc.data().alignmentId,
        });
      });
      return response.json(sessions);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.getSession = (request, response) => {
  db.collection("sessions")
    .doc(`${request.params.sessionId}`)
    .get()
    .then((doc) => {
      return response.json(doc.data());
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

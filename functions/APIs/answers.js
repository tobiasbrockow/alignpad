const { db } = require("../util/admin");

exports.answerQuestion = (request, response) => {
  if (request.body.body.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  const newAnswerItem = {
    body: request.body.body,
    userId: request.user.username,
    sessionId: request.params.sessionId,
    teamId: request.params.teamId,
    type: request.params.t,
    questionNum: request.params.n,
    createdAt: new Date().toISOString(),
  };

  db.collection("answers")
    .add(newAnswerItem)
    .then((doc) => {
      const responseAnswerItem = newAnswerItem;
      responseAnswerItem.id = doc.id;
      return response.json(responseAnswerItem);
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.getQuestions = (request, response) => {
  db.collection("sessions")
    .doc(request.params.sessionId)
    .get()
    .then((doc) => {
      let q = {};
      q.privateQuestions = doc.data().privateQuestions;
      q.teamQuestions = doc.data().teamQuestions;
      return response.json(q);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.getAllAnswers = (request, response) => {
  let isManager = false;

  db.doc(`/users/${request.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        for (let x of doc.data().teamManager) {
          if (x === request.params.teamId) {
            isManager = true;
          }
        }
      }
      return db
        .collection("answers")
        .where("teamId", "==", request.params.teamId)
        .orderBy("createdAt", "desc")
        .get();
    })
    .then((data) => {
      let answers = [];
      data.forEach((doc) => {
        if (isManager === true) {
          answers.push({
            body: doc.data().body,
            type: doc.data().type,
            questionNum: doc.data().questionNum,
            userId: doc.data().userId,
            sessionId: doc.data().sessionId,
          });
        } else {
          if (doc.data().type === "team") {
            answers.push({
              body: doc.data().body,
              type: doc.data().type,
              questionNum: doc.data().questionNum,
              userId: doc.data().userId,
              sessionId: doc.data().sessionId,
            });
          }
        }
      });
      return response.json(answers);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

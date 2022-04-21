const { admin, db } = require("../util/admin");

exports.createTeam = (request, response) => {
  if (request.body.teamName.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  const newTeamItem = {
    name: request.body.teamName,
    users: [request.user.username],
    manager: [request.user.username],
    userId: request.user.username,
    createdAt: new Date().toISOString(),
  };

  db.collection("teams")
    .add(newTeamItem)
    .then((doc) => {
      teamId = doc.id;
      return db.doc(`/users/${request.user.username}`).update({
        teams: admin.firestore.FieldValue.arrayUnion(teamId),
        teamManager: admin.firestore.FieldValue.arrayUnion(teamId),
      });
    })
    .then(() => {
      return response.json({ message: "Team created successfully" });
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.getTeams = (request, response) => {
  db.collection("teams")
    .where("users", "array-contains", request.user.username)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let teams = [];
      data.forEach((doc) => {
        teams.push({
          name: doc.data().name,
          id: doc.id,
        });
      });
      return response.json(teams);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.addUserToTeam = (request, response) => {
  const email = request.body.email;
  const teamId = request.body.teamId;
  const isManager = request.body.isManager;
  let userList = [];
  let userId = "";

  db.collection("teams")
    .doc(teamId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Team not found" });
      }
      userList = doc.data().users;
    })
    .then((response) => {
      if (response === undefined) {
        return db.collection("users").where("email", "==", email).get();
      }
    })
    .then((data) => {
      let list = [];
      data.forEach((doc) => {
        list.push({
          id: doc.id,
        });
      });
      if (list[0] === undefined) {
        return response
          .status(400)
          .json({ email: "No user found with this email" });
      }
      userId = list[0].id;
      return list[0].id;
    })
    .then((id) => {
      return db.doc(`/users/${id}`).update({
        teams: admin.firestore.FieldValue.arrayUnion(teamId),
      });
    })
    .then(() => {
      if (isManager === true) {
        return db.doc(`/users/${userId}`).update({
          teamManager: admin.firestore.FieldValue.arrayUnion(teamId),
        });
      } else {
        return undefined;
      }
    })
    .then(() => {
      userList.push(userId);
      return db.doc(`/teams/${teamId}`).update({
        users: userList,
      });
    })
    .then(() => {
      if (isManager === true) {
        return db.doc(`/teams/${teamId}`).update({
          manager: admin.firestore.FieldValue.arrayUnion(userId),
        });
      } else {
        return undefined;
      }
    })
    .then(() => {
      return response.json({ message: "User added successfully" });
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

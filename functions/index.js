const functions = require("firebase-functions");
const app = require("express")();

const auth = require("./util/auth");

const {
  getAllNotes,
  postOneNote,
  deleteNote,
  editNote,
} = require("./APIs/notes");

app.put("/note/:noteId", auth, editNote);
app.delete("/note/:noteId", auth, deleteNote);
app.post("/note", auth, postOneNote);
app.get("/notes", auth, getAllNotes);

const {
  answerQuestion,
  getQuestions,
  getAllAnswers,
} = require("./APIs/answers");

app.post("/answer/:sessionId/:t/:n/:teamId", auth, answerQuestion);
app.get("/questions/:sessionId", auth, getQuestions);
app.get("/answers/:teamId", auth, getAllAnswers);

const {
  createAlignment,
  deleteAlignment,
  getAlignments,
  editAlignment,
  createSession,
  getSessions,
  getSessionsOfTeam,
  editSession,
  getSession,
} = require("./APIs/alignments");

app.put("/alignment/:alignmentId", auth, editAlignment);
app.delete("/alignment/:alignmentId", auth, deleteAlignment);
app.get("/alignments/:teamId", auth, getAlignments);
app.post("/alignment", auth, createAlignment);
app.post("/session/:alignmentId", auth, createSession);
app.get("/sessions", auth, getSessions);
app.get("/sessions/:teamId", auth, getSessionsOfTeam);
app.put("/session/:sessionId", auth, editSession);
app.get("/session/:sessionId", auth, getSession);

const { createTeam, addUserToTeam, getTeams } = require("./APIs/teams");

app.post("/team", auth, createTeam);
app.post("/team/add", auth, addUserToTeam);
app.get("/teams", auth, getTeams);

const { createCompany, addUserToCompany } = require("./APIs/companies");

app.post("/company", auth, createCompany);
app.post("/company/add", auth, addUserToCompany);

const {
  loginUser,
  signUpUser,
  uploadProfilePhoto,
  getUserDetail,
  updateUserDetails,
  getUsersOfTeam,
} = require("./APIs/users");

app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.post("/user/image", auth, uploadProfilePhoto);
app.get("/user", auth, getUserDetail);
app.post("/user", auth, updateUserDetails);
app.get("/users/:teamId", auth, getUsersOfTeam);

exports.api = functions.https.onRequest(app);

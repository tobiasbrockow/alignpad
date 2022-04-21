const { admin, db } = require("../util/admin");

exports.createCompany = (request, response) => {
  if (request.body.name.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  const newCompanyItem = {
    name: request.body.name,
    userId: request.user.username,
    createdAt: new Date().toISOString(),
  };

  db.collection("companies")
    .add(newCompanyItem)
    .then((doc) => {
      companyId = doc.id;
      return db.doc(`/users/${request.user.username}`).update({
        companies: admin.firestore.FieldValue.arrayUnion(companyId),
      });
    })
    .then(() => {
      return response.json({ message: "Company created successfully" });
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.addUserToCompany = (request, response) => {
  const email = request.body.email;
  const companyId = request.body.companyId;

  db.collection("companies")
    .doc(companyId)
    .get()
    .then((data) => {
      if (!data.exists) {
        return response.status(404).json({ error: "Company not found" });
      }
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
      return list[0].id;
    })
    .then((id) => {
      return db.doc(`/users/${id}`).update({
        companies: admin.firestore.FieldValue.arrayUnion(companyId),
      });
    })
    .then(() => {
      return response.json({ message: "User added successfully" });
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

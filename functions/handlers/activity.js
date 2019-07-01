const { db } = require("../util/admin");
const { validateActivityData } = require("../util/authenticators");

exports.getAllActivity = (req, res) => {
  db.collection("/activity")
    .get()
    .then(data => {
      let activity = [];
      data.forEach(doc => {
        activity.push({
          createdAt: doc.data().createdAt,
          createdBy: doc.data().createdAt,
          time: doc.data().time,
          name: doc.data().name,
          phoneNum: doc.data().phoneNum,
          subject: doc.data().subject,
          followUp: doc.data().followUp,
          done: doc.data().done,
          activityId: doc.id
        });
      });
      console.log(activity);
      return res.json(activity);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getUserActivity = (req, res) => {
  db.collection("activity")
    .where("createdBy", "==", req.user.handle)
    .orderBy("createdAt", "asc")
    .get()
    .then(data => {
      let activity = [];
      data.forEach(doc => {
        activity.push({
          customer: doc.data().customer,
          createdAt: doc.data().createdAt,
          jobId: doc.id,
          jobDate: doc.data().jobDate,
          notified: doc.data().notified,
          description: doc.data().description,
          parts: doc.data().parts,
          comments: doc.data().comments
        });
      });
      console.log(activity);
      return res.json(activity);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// exports.editUserActivity = (req, res) => {};

exports.postOneActivity = (req, res) => {
  // create new activity object
  console.log(req.user);
  const newActivity = {
    createdAt: new Date().toISOString(),
    createdBy: req.user.handle,
    time: new Date().getTime(),
    name: req.body.name,
    phoneNum: req.body.phoneNum || "",
    subject: req.body.subject,
    followUp: req.body.followUp || false,
    done: false
  };

  const { valid, errors } = validateActivityData(newActivity);

  if (!valid) {
    return res.status(400).json(errors);
  }

  db.collection("activity")
    .add(newActivity)
    .then(doc => {
      res.json({
        message: `activity ${req.body.subject} created successfully`
      });
    })
    .catch(err => {
      res.status(500).json({ error: "Something went wrong" });
      console.log(err);
    });
};

exports.editActivity = (req, res) => {
  db.doc(`/activity/${req.params.activity}`)
    .set(req.body, {
      merge: true
    })
    .then(doc => {
      return res.status(200).json({ message: "activity edited successfully" });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    });
};

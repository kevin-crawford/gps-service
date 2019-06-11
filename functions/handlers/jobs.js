const { db } = require("../util/admin");

const { validateJobData } = require("../util/authenticators");

exports.getAllJobs = (req, res) => {
  db.collection("/jobs")
    .get()
    .then(data => {
      let jobs = [];
      data.forEach(doc => {
        jobs.push({
          customer: doc.data().customer,
          createdAt: doc.data().createdAt,
          jobDate: doc.data().jobDate,
          createdBy: doc.data().createdBy,
          notified: doc.data().notified,
          description: doc.data().description,
          parts: doc.data().parts,
          comments: doc.data().comments
        });
      });
      console.log(jobs);
      return res.json(jobs);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getJobsByDate = (req, res) => {
  db.collection("jobs")
    .where("jobDate", "==", req.body.jobDate)
    .orderBy("customer", "asc")
    .get()
    .then(data => {
      let jobs = [];
      data.forEach(doc => {
        jobs.push({
          customer: doc.data().customer,
          createdAt: doc.data().createdAt,
          jobDate: doc.data().jobDate,
          createdBy: doc.data().createdBy,
          notified: doc.data().notified,
          description: doc.data().description,
          parts: doc.data().parts,
          comments: doc.data().comments
        });
      });
      console.log(jobs);
      return res.json(jobs);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.postOneJob = (req, res) => {
  const newJob = {
    customer: req.body.customer,
    createdAt: new Date().toISOString(),
    jobDate: req.body.jobDate || "",
    createdBy: req.user.name,
    notified: false,
    description: req.body.description,
    parts: req.body.parts || "",
    comments: req.body.comments || ""
  };

  const { valid, errors } = validateJobData(newJob);

  if (!valid) {
    return res.status(400).json(errors);
  }

  db.collection("jobs")
    .add(newJob)
    .then(doc => {
      res.json({
        message: `Job ${req.body.description} on ${req.body.jobDate} for ${
          req.body.customer
        } created successfully`
      });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.log(err);
    });
};

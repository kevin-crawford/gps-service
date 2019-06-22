const { db } = require("../util/admin");

const { validateJobData } = require("../util/authenticators");
const { getOneCustomer } = require("./customers")

exports.getAllJobs = (req, res) => {
  db.collection("/jobs")
    .get()
    .then(data => {
      let jobs = [];
      data.forEach(doc => {
        jobs.push({
          customer: doc.data().customer,
          createdAt: doc.data().createdAt,
          jobId: doc.id,
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
          jobId: doc.id,
          jobDate: doc.data().jobDate,
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
  
  db.doc(`/customers/${req.body.customer}`)
    .get()
    .then(doc => {
      // if it does not exists, respond with not found
      if (!doc.exists) {
        return res.status(400).json({ message: "Customer not found" });
      } else {
        // return data from document
        console.log(doc.data());
        const customer = {
          name: doc.data().name,
          customerId: doc.id,
          address: doc.data().address,
          phoneNum: doc.data().phoneNum,
          createdAt: doc.data().createdAt
        }
        return customer;
      }
    })
    .then( customer => {
      console.log(customer);

      const newJob = {
        customer: customer,
        createdAt: new Date().toISOString(),
        jobDate: req.body.jobDate || "",
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
            message: `Job ${req.body.description} 
                      on ${req.body.jobDate} 
                      for ${newJob.customer.name} created successfully`
          });
        })
        .catch(err => {
          res.status(500).json({ error: "something went wrong" });
          console.log(err);
         });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Something went wrong" });
        });
};

  


exports.uploadJobImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    const imageExt = filename.split(".")[filename.split(".").length - 1];
    const imageFileName = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExt}}`;

    const filepath = path.join(os.tempdir(), imageFileName);

    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          firebaseConfig.storageBucket
        }/o/${imageFileName}?alt=media`;
        return db
          .doc(`/jobs/${req.body.jobId}`)
          .update({ jobImages: [...jobImages, imageUrl] });
      })
      .then(() => {
        return res.json({ message: "Image uploaded successfully" });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });
};

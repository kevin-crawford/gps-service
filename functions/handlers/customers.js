const { db } = require("../util/admin");
const { validateCustomerData } = require("../util/authenticators");

exports.getAllCustomers = (req, res) => {
  db.collection("customers")
    .orderBy("name", "asc")
    .get()
    .then(data => {
      let customers = [];
      data.forEach(doc => {
        customers.push({
          name: doc.data().name,
          customerId: doc.id,
          address: doc.data().address,
          phoneNum: doc.data().phoneNum,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(customers);
    })
    .catch(err => {
      console.err(err);
    });
};

exports.postOneCustomer = (req, res) => {
  // create new customer request object
  const newCustomer = {
    name: req.body.name,
    address: req.body.address,
    phoneNum: req.body.phoneNum,
    createdAt: new Date().toISOString()
  };

  const { valid, errors } = validateCustomerData(newCustomer);

  if (!valid) {
    return res.status(400).json(errors);
  }

  db.doc(`/customers/${newCustomer.name}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ name: "customer name already in system" });
      } else {
        db.collection("customers")
          .add(newCustomer)
          .then(doc => {
            res.json({
              message: `customer ${req.body.name} created successfully`
            });
          })
          .catch(err => {
            res.status(500).json({ error: "something went wrong" });
            console.log(err);
          });
      }
    });
};

exports.getOneCustomer = (req, res) => {
  console.log(req.params.customerId);
  // check for customer id in the request parameters
  if (!req.params.customerId) {
    return res.status(200).json({ message: "No customer id" });
  }

  // call the db to find the customer by its ID
  db.doc(`/customers/${req.params.customerId}`)
    .get()
    .then(doc => {
      // if it does not exists, respond with not found
      if (!doc.exists) {
        return res.status(400).json({ message: "Customer not found" });
      } else {
        // return data from document
        console.log(doc.data());
        return res.status(200).json({
          name: doc.data().name,
          customerId: doc.id,
          address: doc.data().address,
          phoneNum: doc.data().phoneNum,
          createdAt: doc.data().createdAt
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    });
};

exports.editCustomer = (req, res) => {
  db.doc(`/customers/${req.params.customerId}`)
    .get()
    .then(doc => {
      console.log(req.body);
      if (!doc.exists) {
        return res.status(404).json({ message: " Cannot find customer" });
      } else {
        let updatedInfo = req.body;
        db.doc(`/customers/${req.params.customerId}`).set(updatedInfo, {
          merge: true
        });
        return res
          .status(200)
          .json({ message: `updated customer fields with ${req.body}` });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    });
  // add logic to update related jobs with correct customer
};

exports.deleteCustomer = (req, res) => {
  // ADD HOOK TO REMOVE RELATED JOBS TO CUSTOMER
  db.collection(`/customers`)
    .doc(req.body.customerId)
    .delete()
    .then(() => {
      res.status(202).json({
        message: `customer ${req.body.customerId} successfully deleted`
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Something went wrong" });
    });
};

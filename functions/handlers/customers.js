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
          custId: doc.id,
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

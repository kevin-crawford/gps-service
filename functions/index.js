const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const cors = require("cors");

app.use(cors());

const {
  getAllCustomers,
  postOneCustomer,
  getOneCustomer,
  deleteCustomer,
  editCustomer
} = require("./handlers/customers");

const {
  postOneActivity,
  getAllActivity,
  getUserActivity,
  editActivity
} = require("./handlers/activity");

const { signup, login, getAuthenticatedUser } = require("./handlers/users");

const {
  getAllJobs,
  getJobsByDate,
  postOneJob,
  getJob,
  uploadJobImage
} = require("./handlers/jobs");

// customer routes
// Get Customer
app.get("/customers", getAllCustomers);
// Get Single Customer
app.get("/customers/:customerId", getOneCustomer);
// Add Customer
app.post("/customers", postOneCustomer);
// Delete Customer
app.delete("/customers", FBAuth, deleteCustomer);
// Edit Customer TODO
app.put("/customers/:customerId", editCustomer);

// activity routes
// Add Activity
app.post("/activity", FBAuth, postOneActivity);
// Get Single User Activity
app.get("/myactivity", FBAuth, getUserActivity);
// Get All User Activity
app.get("/activity", getAllActivity);
// Edit Single Activity Item
app.put("/activity/:activityId", editActivity);
// Delete Single Activity Item
// app.delete("/activity/:activityId", FBAuth, deleteActivity)

// user routes
// Sign up user
app.post("/signup", signup);
// Login User
app.post("/login", login);
// Get User Credentials
app.get("/users", FBAuth, getAuthenticatedUser);
// Edit User Info
// app.put('/users/:userId', FBAuth, editUserInfo);

app.post("/jobs", FBAuth, postOneJob);
app.get("/jobs/:jobId", getJob);
app.get("/jobs", getAllJobs);
app.get("/jobsbydate/:jobDate", getJobsByDate);
app.post("/jobs/image", FBAuth, uploadJobImage);

//TODO:  ,
// 3 DELETE JOB
// app.delete("/jobs/:jobId", FBAuth, deleteJob)
// 4 EDIT job
// app.put('/jobs/:jobId', FBAuth, editJob)
// 2 GET jobs by CUST
// app.get('/jobs/:customerId, FBAuth, getCustomerJobs)

exports.api = functions.https.onRequest(app);

// TODO: add HOOKS to db
// on Customer Delete, remove related jobs
// on User Account Delete, remove related activites.

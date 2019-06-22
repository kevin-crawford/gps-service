const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./util/fbAuth");
const cors = require('cors')

app.use(cors());


const {
  getAllCustomers,
  postOneCustomer,
  getOneCustomer
} = require("./handlers/customers");

const { signup, login, getAuthenticatedUser } = require("./handlers/users");

const {
  getAllJobs,
  getJobsByDate,
  postOneJob,
  uploadJobImage
} = require("./handlers/jobs");

// customer routes
app.get("/customers", getAllCustomers);
app.get("/customers/:customerId", getOneCustomer);
app.post("/customers", postOneCustomer);

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.get("/users", FBAuth, getAuthenticatedUser);

//TODO: 1 GET jobs by DATE, 2 GET jobs by CUST, 3 DELETE JOB by CUST, 4 EDIT job by CUST
app.post("/jobs", FBAuth, postOneJob);
app.get("/jobs", getAllJobs);
app.post("/jobsbydate", getJobsByDate);
app.post("/jobs/image", FBAuth, uploadJobImage);

exports.api = functions.https.onRequest(app);

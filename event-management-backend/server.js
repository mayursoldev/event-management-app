const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events")
const locationRoutes = require("./routes/locations")
const eventRegistrationRoutes = require("./routes/eventRegistration")

const app = express();

// Middleware - to avois corss origin access issues
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/locations", locationRoutes);
app.use('/users', eventRegistrationRoutes)

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

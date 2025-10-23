import app from "./app";

import config from "./config";
import { Dbconnection } from "./database/dbConnection";

const PORT = config.port;

Dbconnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });

import app from "./app";

import config from "./config";
import { DbConnection } from "./database/dbConnection";

const PORT = config.PORT;

const startServer = async () => {
  try {
    await DbConnection();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

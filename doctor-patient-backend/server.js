import app from "./app.js";
import "dotenv/config";
import './cron.js';

const PORT = process.env.PORT || 5000 || 3000;

app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

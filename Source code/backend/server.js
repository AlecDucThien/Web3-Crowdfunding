const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { initializeContract, syncCampaigns, listenToEvents } = require('./services/blockchain');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const contract = await initializeContract();
  await syncCampaigns(contract);
  listenToEvents(contract);
  app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
  });
};

startServer();
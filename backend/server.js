// const app = require('./app');
// const { connectMongo } = require('./config/db.mongo');
// const BootstrapService = require('./services/BootstrapService');
// const PORT = process.env.PORT || 5000;

// connectMongo()
//   .then(() => BootstrapService.ensureDemoAccounts())
//   .then(() => {
//     console.log('✅ Demo local accounts ready');
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error('❌ Startup failed:', err.message);
//     process.exit(1);
//   });


const app = require('./app');
const { connectMongo } = require('./config/db.mongo');
const BootstrapService = require('./services/BootstrapService');

const PORT = process.env.PORT || 5000;

// Try MongoDB but don't stop server
connectMongo()
  .then(() => {
    console.log('MongoDB tried');

    // Try demo accounts but don't crash
    return BootstrapService.ensureDemoAccounts()
      .then(() => console.log('✅ Demo local accounts ready'))
      .catch((err) => {
        console.log('⚠️ Demo accounts skipped:', err.message);
      });
  })
  .catch((err) => {
    console.log('⚠️ MongoDB failed, but continuing...');
  });

// 🚀 ALWAYS START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
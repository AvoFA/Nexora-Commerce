// server/scripts/migrateLogs.js
require('dotenv').config();
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const Question = require('../models/Question');
const Product = require('../models/Product'); // Register Product schema for populate

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop-admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const logs = await ActivityLog.find({
      targetModel: 'Question',
      targetId: { $ne: null },
      $or: [
        { metadata: null },
        { 'metadata.questionText': { $exists: false } }
      ]
    });

    console.log(`Found ${logs.length} question logs without metadata. Migrating...`);

    let updatedCount = 0;
    for (const log of logs) {
      const question = await Question.findById(log.targetId).populate('product', 'name');
      if (question) {
        log.metadata = {
          questionText: question.text,
          answerText: question.answer || '—',
          productName: question.product?.name || '—'
        };
        await log.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} logs with question metadata.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();

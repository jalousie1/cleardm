import axios from 'axios';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export class DiscordDeleter {
  constructor(token) {
    this.token = token;
    this.stopped = false;
    this.axios = axios.create({
      baseURL: 'https://discord.com/api/v9',
      headers: { 'Authorization': token }
    });
  }

  async verifyToken() {
    try {
      const response = await this.axios.get('/users/@me');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getDMChannels() {
    try {
      const response = await this.axios.get('/users/@me/channels');
      return response.data.filter(c => c.type === 1); // Type 1 is DM
    } catch (error) {
      logger.error(`Error getting DM channels: ${error.message}`);
      return [];
    }
  }

  async getMessages(channelId, limit = 100, before = null) {
    try {
      let allMessages = [];
      let url = `/channels/${channelId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }

      const response = await this.axios.get(url);
      const messages = response.data;
      
      if (messages.length > 0) {
        // Get your user ID first
        const meResponse = await this.axios.get('/users/@me');
        const myUserId = meResponse.data.id;
        
        // Filter only your messages
        const myMessages = messages.filter(msg => msg.author.id === myUserId);
        allMessages = allMessages.concat(myMessages);
        
        // If we got the maximum number of messages, there might be more
        if (messages.length === limit) {
          const oldestMessage = messages[messages.length - 1];
          const moreMessages = await this.getMessages(channelId, limit, oldestMessage.id);
          allMessages = allMessages.concat(moreMessages);
        }
      }

      // Sort messages by timestamp (newest first)
      return allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      logger.error(`Error getting messages: ${error.message}`);
      return [];
    }
  }

  async deleteMessage(channelId, messageId) {
    try {
      const response = await this.axios.delete(`/channels/${channelId}/messages/${messageId}`);
      return response.status === 204;
    } catch (error) {
      logger.error(`Error deleting message ${messageId}: ${error.message}`);
      return false;
    }
  }

  async deleteMessages(channelId, messages) {
    const batchSize = 40;
    const delayBetweenBatches = 30000; // 30 seconds in milliseconds
    let deleted = 0;
    let failed = 0;

    logger.info(`Starting deletion of ${messages.length} messages...`);
    logger.info('Messages will be deleted from newest to oldest');
    logger.info(`Batch size: ${batchSize}, Delay between batches: ${delayBetweenBatches/1000}s`);

    // Process messages in batches
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      logger.info(`\nProcessing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(messages.length/batchSize)}`);
      logger.info(`Batch size: ${batch.length} messages`);

      for (const message of batch) {
        if (this.stopped) {
          logger.info('Process stopped by user');
          return { deleted, failed };
        }

        const success = await this.deleteMessage(channelId, message.id);
        if (success) {
          deleted++;
          logger.info(`Deleted message from ${new Date(message.timestamp).toLocaleString()}: ${message.content || '[no content]'}`);
        } else {
          failed++;
          logger.error(`Failed to delete message: ${message.id}`);
        }

        const progress = (deleted + failed) / messages.length * 100;
        logger.info(`Progress: ${progress.toFixed(1)}% (${deleted} deleted, ${failed} failed)`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (i + batchSize < messages.length) {
        logger.info(`\nBatch complete. Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return { deleted, failed };
  }

  stop() {
    this.stopped = true;
  }
}

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('Process interrupted by user');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}
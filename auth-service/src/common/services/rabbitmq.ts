import amqp, { Channel, Connection } from 'amqplib';
import config from '../../config';
import logger from '../utils/logger';

class RabbitMQService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', { durable: true });

      // Assert queue
      await this.channel.assertQueue(config.rabbitmq.queue, { durable: true });

      logger.info('Successfully connected to RabbitMQ');
    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async publishEvent(routingKey: string, data: any): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not initialized');
      }

      const message = Buffer.from(JSON.stringify(data));
      this.channel.publish(config.rabbitmq.exchange, routingKey, message, {
        persistent: true,
      });

      logger.debug(`Published event: ${routingKey}`, { data });
    } catch (error) {
      logger.error(`Error publishing event: ${routingKey}`, error);
      throw error;
    }
  }

  async subscribe(routingKey: string, handler: (data: any) => Promise<void>): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not initialized');
      }

      // Bind queue to exchange with routing key
      await this.channel.bindQueue(config.rabbitmq.queue, config.rabbitmq.exchange, routingKey);

      // Consume messages
      await this.channel.consume(config.rabbitmq.queue, async (msg) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            await handler(data);
            this.channel?.ack(msg);
          } catch (error) {
            logger.error(`Error processing message: ${routingKey}`, error);
            // Reject the message and requeue it
            this.channel?.nack(msg, false, true);
          }
        }
      });

      logger.info(`Subscribed to event: ${routingKey}`);
    } catch (error) {
      logger.error(`Error subscribing to event: ${routingKey}`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      logger.info('Disconnected from RabbitMQ');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }
}

export default new RabbitMQService();
import amqp, { ChannelModel, Channel, ConsumeMessage } from 'amqplib';
import config from '../../config';
import logger from '../utils/logger';


class RabbitMQService {
  private connection!: ChannelModel;
  private channel!: Channel;

  async connect(): Promise<void> {
    try {
      if (this.channel) return;
      
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', {
        durable: true,
      });

      await this.channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
      });

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

  async subscribe(
    routingKey: string,
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel not initialized');
      }

      await this.channel.bindQueue(
        config.rabbitmq.queue,
        config.rabbitmq.exchange,
        routingKey
      );

      await this.channel.consume(
        config.rabbitmq.queue,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              const data = JSON.parse(msg.content.toString());
              await handler(data);
              this.channel?.ack(msg);
            } catch (error) {
              logger.error(`Error processing message: ${routingKey}`, error);
              this.channel?.nack(msg, false, true);
            }
          }
        }
      );

      logger.info(`Subscribed to event: ${routingKey}`);
    } catch (error) {
      logger.error(`Error subscribing to event: ${routingKey}`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }

      logger.info('Disconnected from RabbitMQ');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }
}

export default new RabbitMQService();

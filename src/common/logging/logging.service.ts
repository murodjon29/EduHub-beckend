import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { logger } from './winston.logger';
import { RequestLog } from '../../core/entities/request-log.entity';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(RequestLog) private repo: Repository<RequestLog>,
  ) {}

  private async getGeo(ip: string) {
    try {
      if (process.env.IP_GEO_LOOKUP !== 'true') return null;
      const provider = process.env.IP_GEO_PROVIDER || 'http://ip-api.com/json';
      const url = `${provider}/${ip}`;
      const res = await axios.get(url, { timeout: 3000 });
      if (res?.data?.status === 'success' || res?.data?.country) {
        return res.data;
      }
      return null;
    } catch (error: any) {
      logger.error(`Geo lookup error: ${error.message}`);
      return null;
    }
  }

  async logToFile(entry: any) {
    try {
      const message = JSON.stringify(entry);
      logger.info(message);
    } catch (err: any) {
      logger.error(`File log error: ${err.message}`);
    }
  }

  async logToDb(entry: Partial<RequestLog>) {
    try {
      if (process.env.LOG_TO_DB !== 'true') return;
      const rec = this.repo.create(entry);
      await this.repo.save(rec);
    } catch (err: any) {
      logger.error(`DB log error: ${err.message}`);
    }
  }

  async logRequest(data: {
    method: string;
    url: string;
    statusCode?: number;
    responseTimeMs?: number;
    ip?: string;
    userAgent?: string;
    userId?: string;
    requestBody?: any;
  }) {
    try {
      const geo = data.ip ? await this.getGeo(data.ip) : null;
      const entry = {
        method: data.method,
        url: data.url,
        statusCode: data.statusCode,
        responseTimeMs: data.responseTimeMs,
        ip: data.ip,
        userAgent: data.userAgent,
        userId: data.userId,
        requestBody: data.requestBody,
        country: geo?.country || null,
        region: geo?.regionName || geo?.region || null,
        city: geo?.city || null,
        isp: geo?.isp || null,
      };

      if (process.env.LOG_TO_FILE === 'true') {
        await this.logToFile(entry);
      }

      await this.logToDb(entry);
    } catch (err: any) {
      logger.error(`Request log error: ${err.message}`);
    }
  }
}

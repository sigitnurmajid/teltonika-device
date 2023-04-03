import { Injectable } from '@nestjs/common';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { HealthAPI } from '@influxdata/influxdb-client-apis';

@Injectable()
export class InfluxProvider {
  private influxClient: InfluxDB
  private healthApi: HealthAPI

  constructor() {
    this.influxClient = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN })
  }

  public async writePoints(points: Array<Point>) {
    if (points.length === 0) return
    const writeApi = this.influxClient.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET)
    writeApi.writePoints(points)
    return await writeApi.close()
  }

  public async writePoint(point: Point) {
    const writeApi = this.influxClient.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET)
    writeApi.writePoint(point)
    return await writeApi.close()
  }

  public async readPoints(fluxQuery: string) {
    const queryApi = this.influxClient.getQueryApi(process.env.INFLUX_ORG)
    return await queryApi.collectRows(fluxQuery)
  }

  public async report() {
    const response = await this.healthApi.getHealth()

    return {
      connection: 'timeseries_influxdb',
      message: response.message,
      error: response.status === 'pass' ? null : true,
    }
  }
}
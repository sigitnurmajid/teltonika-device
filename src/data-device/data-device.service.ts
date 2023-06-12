import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluxProvider } from './providers/influx.provider';

@Injectable()
export class DataDeviceService {
  constructor(
    private influx: InfluxProvider
  ) { }

  async getLast(params: any) {
    const imei = params.imei

    const avlQuery = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([AVLId, dataId]) => {
        return `(r["AVLId"] == "${AVLId}" and r["dataId"] == "${dataId}")`
      })
    }).join(' or ')

    const fluxQuery = `
    from(bucket: "vms")
    |> range(start: -14d)
    |> filter(fn: (r) => r["_measurement"] == "${imei}")
    |> filter(fn: (r) => ${avlQuery})
    |> group(columns: ["AVLId", "dataId"])
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> last(column: "AVLValue")
    `

    const returnInflux = await this.influx.readPoints(fluxQuery)

    const dataAVL = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId, dataId]) => {
        return this.decode(returnInflux, dataId.toString(), avlId)
      })[0]
    })

    return {
      APItype: 'realtime data',
      queryTime: new Date(),
      imei: imei,
      AVLIdCount: dataAVL.length,
      AVLData: dataAVL
    }
  }

  async getTcpStatus() {
    const re = /\b\d{15}\b/

    const fluxQuery = `
    from(bucket: "vms")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "TCPStatus" and r["imei"] =~ ${re} )
    |> last()
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> drop(columns: ["_start","_stop"])
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    return returnInflux
  }

  async findOneTcpStatus(IMEINumber: string) {
    const fluxQuery = `
    from(bucket: "vms")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "TCPStatus" and r["imei"] == "${IMEINumber}")
      |> last()
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> drop(columns: ["_start","_stop"])
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((item: any, index, object) => {
      if (item.hasOwnProperty('imei') === false) {
        object.splice(index, 1)
      }
    })

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    return returnInflux[0]
  }

  async getHistory(params: any) {
    const imei = params.imei
    const startTime = params.startTime
    const endTime = params.endTime

    const avlQuery = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([AVLId, dataId]) => {
        return `(r["AVLId"] == "${AVLId}" and r["dataId"] == "${dataId}")`
      })
    }).join(' or ')

    const fluxQuery = `
    from(bucket: "vms")
    |> range(start: ${startTime}, stop: ${endTime})
    |> filter(fn: (r) => r["_measurement"] == "${imei}")
    |> filter(fn: (r) => ${avlQuery})
    |> group(columns: ["AVLId", "dataId"])
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    const dataAVL = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId, dataId]) => {
        return this.decode(returnInflux, dataId.toString(), avlId)
      })[0]
    })

    return {
      APItype: 'historical data',
      startTime: startTime,
      endTime: endTime,
      queryTime: new Date(),
      imei: imei,
      AVLIdCount: dataAVL.length,
      AVLData: dataAVL
    }
  }

  decode(dataFromInflux: Array<any>, dataId: string, AVLId: string) {
    const dataDecode = dataFromInflux.map(x => {
      delete x.result
      delete x.table
      delete x._measurement
      delete x._start
      delete x._stop
      return x
    }).filter(x => (x.AVLId == AVLId) && (x.dataId == dataId))

    return {
      AVLId: AVLId,
      dataId: dataId,
      dataCount: dataDecode.length,
      data: dataDecode
    }
  }

  async getLocationDataLast(params: any) {
    const imei = params.imei
    
    const fluxQuery = `
    from(bucket: "vms")
    |> range(start: 0)
    |> filter(fn: (r) => r["_measurement"] == "${imei}")
    |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "altitude" or r["_field"] == "angle" or r["_field"] == "satellites")
    |> group()
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> filter(fn: (r) => r["satellites"] != "0")
    |> last(column: "latitude")
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    return returnInflux[0]
  }

  async getLocationDataHistory(params: any) {
    const imei = params.imei
    const startTime = params.startTime
    const endTime = params.endTime

    const fluxQuery = `
    from(bucket: "vms")
    |> range(start: ${startTime}, stop: ${endTime})
    |> filter(fn: (r) => r["_measurement"] == "${imei}")
    |> filter(fn: (r) => r["_field"] == "latitude" or r["_field"] == "longitude" or r["_field"] == "altitude" or r["_field"] == "angle" or r["_field"] == "satellites")
    |> group()
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> filter(fn: (r) => r["satellites"] != "0")
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    return returnInflux
  }
}
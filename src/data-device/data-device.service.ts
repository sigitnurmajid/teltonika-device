import { Injectable } from '@nestjs/common';
import { InfluxProvider } from './providers/influx.provider';

@Injectable()
export class DataDeviceService {
  constructor(
    private influx: InfluxProvider
  ) { }

  async getHistory(params: any) {
    const imei = params.imei
    const startTime = params.startTime
    const endTime = params.endTime
    const avlId = params.avlId
    const enableDecode = params.enableDecode === "true" ? true : false
    const dataId = params.dataId
    const maskingBit = params.maskingBit

    const response = {
      APItype: 'historical data',
      startTime: startTime,
      endTime: endTime,
      queryTime: new Date(),
      imei: imei,
      AVLId: avlId,
      decode: enableDecode,
      maskingBit: (enableDecode) ? maskingBit : '-',
      dataId: (enableDecode) ? dataId : '-'
    }

    let fluxQuery = `
    import "math"
    import "bitwise"
    
    maskingBit = ${parseInt(maskingBit)}
    maskingBitValue = math.log2(x: float(v: maskingBit + 1)) 

    from(bucket: "teltonika")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r["_measurement"] == "${imei}")
      |> filter(fn: (r) => r["ioID"] == "${avlId}")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> map(fn: (r) => ({
        AVLValue : r.ioValue,
        AVLTimestamp : r._time,
        altitude : r.altitude,
        longitude : r.longitude,
        latitude : r.latitude,
        angle : r.angle,
        satellites : r.satellites,
        speed : r.speed,
        priority: r.priority,
        eventTriggered: r.event,
        storedTime : r.storedTime,
        decodedData : bitwise.srshift(a: r.ioValue, b: int(v: maskingBitValue)),
        dataId:  if ${enableDecode} == true then bitwise.sand(a: r.ioValue, b: maskingBit) else r.ioValue }))
      `
    if (enableDecode) {
      fluxQuery = fluxQuery.concat(`|> filter(fn: (r) => r["dataId"] == ${dataId})
      |> drop(columns: ["dataId"])`)
    } else {
      fluxQuery = fluxQuery.concat(`|> drop(columns: ["dataId" , "decodedData"])`)
    }

    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    response['dataCount'] = returnInflux.length
    response['data'] = returnInflux
    return response
  }

  async getLast(params: any) {
    const imei = params.imei
    const avlId = params.avlId
    const enableDecode = params.enableDecode === "true" ? true : false
    const dataId = params.dataId
    const maskingBit = params.maskingBit

    const response = {
      APItype: 'realtime data',
      queryTime: new Date(),
      imei: imei,
      AVLId: avlId,
      decode: enableDecode,
      maskingBit: (enableDecode) ? maskingBit : '-',
      dataId: (enableDecode) ? dataId : '-'
    }

    let fluxQuery = `
    import "math"
    import "bitwise"
    
    maskingBit = ${parseInt(maskingBit)}
    maskingBitValue = math.log2(x: float(v: maskingBit + 1)) 

    from(bucket: "teltonika")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "${imei}")
      |> filter(fn: (r) => r["ioID"] == "${avlId}")
      |> last()
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> map(fn: (r) => ({
        AVLValue : r.ioValue,
        AVLTimestamp : r._time,
        altitude: r.altitude,
        longitude : r.longitude,
        latitude : r.latitude,
        angle : r.angle,
        satellites : r.satellites,
        speed : r.speed,
        priority: r.priority,
        eventTriggered: r.event,
        storedTime : r.storedTime,
        decodedData : bitwise.srshift(a: r.ioValue, b: int(v: maskingBitValue)),
        dataId:  if ${enableDecode} == true then bitwise.sand(a: r.ioValue, b: maskingBit) else r.ioValue }))
      `
    if (enableDecode) {
      fluxQuery = fluxQuery.concat(`|> filter(fn: (r) => r["dataId"] == ${dataId})
      |> drop(columns: ["dataId"])`)
    } else {
      fluxQuery = fluxQuery.concat(`|> drop(columns: ["dataId" , "decodedData"])`)
    }

    const returnInflux = await this.influx.readPoints(fluxQuery)

    returnInflux.forEach((data: any) => {
      delete data.result
      delete data.table
    })

    response['dataCount'] = returnInflux.length
    response['data'] = returnInflux
    return response
  }

  async getTcpStatus(params: any) {

  }
}

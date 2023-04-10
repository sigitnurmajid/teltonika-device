import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluxProvider } from './providers/influx.provider';

@Injectable()
export class DataDeviceService {
  constructor(
    private influx: InfluxProvider
  ) { }

  async getLast(params: any) {
    const imei = params.imei
    const enableDecode = params.enableDecode === "true" ? true : false
    const maskingBit = params.maskingBit

    const avlQuery = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId]) => {
        return ` r["ioID"] == "${avlId}" `
      })
    }).join('or')

    const fluxQuery = `
    from(bucket: "teltonika")
    |> range(start: -14d)
    |> filter(fn: (r) => r["_measurement"] == "${imei}" and (${avlQuery}))
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    const dataAVL = params.avl.map((x: any) => {
       return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId, dataId]) => {
        return this.decode(returnInflux, parseInt(maskingBit), enableDecode, dataId.toString(), avlId, true)
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
    from(bucket: "teltonika")
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
    from(bucket: "teltonika")
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
    const enableDecode = params.enableDecode === "true" ? true : false
    const maskingBit = params.maskingBit

    const avlQuery = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId]) => {
        return ` r["ioID"] == "${avlId}" `
      })
    }).join('or')

    const fluxQuery = `
    from(bucket: "teltonika")
    |> range(start: ${startTime}, stop: ${endTime})
    |> filter(fn: (r) => r["_measurement"] == "${imei}" and (${avlQuery}))
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `
    const returnInflux = await this.influx.readPoints(fluxQuery)

    const dataAVL = params.avl.map((x: any) => {
      return Object.entries((typeof (x) === 'string') ? JSON.parse(x) : x).map(([avlId, dataId]) => {
        return this.decode(returnInflux, parseInt(maskingBit), enableDecode, dataId.toString(), avlId)
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

  decode(dataFromInflux: Array<any>, maskingBit: number, isDecode: boolean, dataId: string, AVLId: string, isLast?: boolean) {
    let dataResult: Array<any>

    const bitCount = Math.log2(maskingBit + 1)
    const dataDecode = dataFromInflux.map(x => {
      delete x.result
      delete x.table
      delete x._measurement
      delete x._start
      delete x._stop

      if (!isDecode) return x

      x.dataId = (BigInt(x.AVLValue) & BigInt(maskingBit)).toString()
      x.decodedData = (BigInt(x.AVLValue) >> BigInt(bitCount)).toString()
      return x
    }).filter(x => x.ioID === AVLId)

    if (!isDecode) {
      dataResult = dataDecode
    } else {
      dataResult = dataDecode.filter(x => {
        return x.dataId === dataId
      })
    }

    return {
      AVLId: AVLId,
      decode: isDecode,
      maskingBit: (isDecode) ? maskingBit : '-',
      dataId: (isDecode) ? dataId : '-',
      dataCount: (isLast === true && dataResult.length !== 0) ? 1 : dataResult.length,
      data: (!isLast) ? dataResult : dataResult[dataResult.length - 1]
    }
  }
}
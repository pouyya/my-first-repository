import _ from 'lodash';
import * as moment from 'moment';
import { StockHistory, Reason } from './../model/stockHistory';
import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import { Http, Response } from '@angular/http';
import { ENV } from '@app/env';
import { UserService } from '../modules/dataSync/services/userService';

@Injectable()
export class StockHistoryService extends BaseEntityService<StockHistory> {

  readonly view_stock_per_store = "inventory/stock_per_store";

  constructor(private http: Http,
    private userService: UserService) {
    super(StockHistory);
  }

  public async getByStoreAndProductId(storeId: string, productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { storeId, productId },
        sort: [{ _id: 'desc' }],
        limit: 50
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getByProductId(productId: string): Promise<StockHistory[]> {
    try {
      return await this.findBy({
        selector: { productId },
        sort: [{ _id: 'desc' }],
        limit: 50
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getAllProductsTotalStockValue() {

    var param = { reduce: true, group: true, group_level: 1 };

    var result = await this.getDB().query(this.view_stock_per_store, param);

    return result ? result.rows.map(row => {
      return {
        productId: row.key[0],
        value: row.value
      }
    }) : null;
  }

  public async getAvailableStock(productIds: string[], storeId) {

    var param = { keys: productIds.map(productId => [productId, storeId]), reduce: true, group: true };

    var result = await this.getDB().query(this.view_stock_per_store, param);

    return result ? result.rows.map(row => {
      return {
        productId: row.key[0],
        value: row.value
      }
    }) : null;
  }

  public async getProductTotalStockValue(productId: string) {

    var param = { reduce: true, group: true, startkey: [productId], endkey: [productId, {}] };
    var result = await this.getDB().query(this.view_stock_per_store, param);

    return result ? result.rows.map(row => {
      return {
        value: row.value,
        storeId: row.key[1]
      };
    }) : null;
  }

  public async getProductsTotalStockValueByStore(productIds: string[], storeId: string): Promise<{ [id: string]: number }> {

    if (productIds.length > 0) {
      let stockPromises: Promise<any>[] = productIds.map(id => this.getByStoreAndProductId(storeId, id));
      let productStocks: any[] = await Promise.all(stockPromises);
      return <{ [id: string]: number }>_.zipObject(productIds, productStocks.map(stocks => {
        let value: number = stocks.length > 0 ? stocks.map(stock => stock.value)
          .reduce((a, b) => Number(a) + Number(b)) : 0;
        return value;
      }));
    }

    return {};
  }

  public static createStockForSale(productId: string, storeId: string, value: number): StockHistory {
    let stock = new StockHistory();
    stock.createdAt = moment().utc().format();
    stock.productId = productId;
    stock.storeId = storeId;
    stock.value = value * -1;
    stock.reason = stock.value <= 0 ? Reason.Purchase : Reason.Return;
    return stock;
  }

  public async getAllStockHistoryByDate(storeId: string, fromDate: Date, toDate: Date): Promise<StockHistory[]> {
    try {
      const query = { createdAt: { $gte: fromDate, $lt: toDate } };
      if (storeId) {
        query['storeId'] = storeId;
      }
      return await this.findBy({
        selector: query,
        sort: [{ _id: 'desc' }]
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getStockMovement(storeId: string, fromDate: Date, toDate: Date) {
    return this.http
      .get(`${ENV.webapp.baseUrl}${ENV.webapp.inventoryReportUrl}?fromDate=${fromDate.getFullYear()}-${fromDate.getMonth()}-${fromDate.getDate()}&toDate=${toDate.getFullYear()}-${toDate.getMonth()}-${toDate.getDate()}&currentStoreId=${storeId}&token=${await this.userService.getUserToken()}`)
      .map((response: Response) => <StockMovement[]>response.json());
  }

  //const staffAttendance = Convert.toStaffAttendance(json);
  public async getStaffAttendance(storeId: string, fromDate: Date, toDate: Date) {
    return this.http
      .get(`http://localhost:5000/v1/api/reports/StaffAttendance/?type=json&employeeIds=2018-01-02T06:00:59.9610000,2018-01-02T06:00:59.9610000&fromDate=${fromDate.getFullYear()}-${fromDate.getMonth()}-${fromDate.getDate()}&toDate=${toDate.getFullYear()}-${toDate.getMonth()}-${toDate.getDate()}&storeId=${storeId}&token=${await this.userService.getUserToken()}`)
      .map((response: Response) => response.json());
  }
}

export interface StockMovement {
  productName: string,
  startStock: number,
  received: number,
  sold: number,
  deducted: number,
  endStock: number,
  returned: number
}

export interface StaffAttendance {
  days:    Day[];
  warning: string;
}

export interface Day {
  dateTime: string;
  date:     string;
  dateMMM:  string;
  dateDMMM: string;
  Employee: Employee[];
}

export interface Employee {
  name:              string;
  storeName:         string;
  attendance:        Attendance;
  attendanceDetails: AttendanceDetail[];
}

export interface Attendance {
  working: string;
  break:   string;
}

export interface AttendanceDetail {
  key:   string;
  value: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export namespace Convert {
  export function toStaffAttendance(json: string): StaffAttendance {
      return cast((json), r("StaffAttendance"));
  }

  export function staffAttendanceToJson(value: StaffAttendance): string {
      return JSON.stringify(uncast(value, r("StaffAttendance")), null, 2);
  }

  function invalidValue(typ: any, val: any): never {
      throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
  }

  function jsonToJSProps(typ: any): any {
      if (typ.jsonToJS === undefined) {
          var map: any = {};
          typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
          typ.jsonToJS = map;
      }
      return typ.jsonToJS;
  }

  function jsToJSONProps(typ: any): any {
      if (typ.jsToJSON === undefined) {
          var map: any = {};
          typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
          typ.jsToJSON = map;
      }
      return typ.jsToJSON;
  }

  function transform(val: any, typ: any, getProps: any): any {
      function transformPrimitive(typ: string, val: any): any {
          if (typeof typ === typeof val) return val;
          return invalidValue(typ, val);
      }

      function transformUnion(typs: any[], val: any): any {
          // val must validate against one typ in typs
          var l = typs.length;
          for (var i = 0; i < l; i++) {
              var typ = typs[i];
              try {
                  return transform(val, typ, getProps);
              } catch (_) {}
          }
          return invalidValue(typs, val);
      }

      function transformEnum(cases: string[], val: any): any {
          if (cases.indexOf(val) !== -1) return val;
          return invalidValue(cases, val);
      }

      function transformArray(typ: any, val: any): any {
          // val must be an array with no invalid elements
          if (!Array.isArray(val)) return invalidValue("array", val);
          return val.map(el => transform(el, typ, getProps));
      }

      function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
          if (val === null || typeof val !== "object" || Array.isArray(val)) {
              return invalidValue("object", val);
          }
          var result: any = {};
          Object.getOwnPropertyNames(props).forEach(key => {
              const prop = props[key];
              const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
              result[prop.key] = transform(v, prop.typ, getProps);
          });
          Object.getOwnPropertyNames(val).forEach(key => {
              if (!Object.prototype.hasOwnProperty.call(props, key)) {
                  result[key] = transform(val[key], additional, getProps);
              }
          });
          return result;
      }

      if (typ === "any") return val;
      if (typ === null) {
          if (val === null) return val;
          return invalidValue(typ, val);
      }
      if (typ === false) return invalidValue(typ, val);
      while (typeof typ === "object" && typ.ref !== undefined) {
          typ = typeMap[typ.ref];
      }
      if (Array.isArray(typ)) return transformEnum(typ, val);
      if (typeof typ === "object") {
          return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
              : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
              : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
              : invalidValue(typ, val);
      }
      return transformPrimitive(typ, val);
  }

  function cast<T>(val: any, typ: any): T {
      return transform(val, typ, jsonToJSProps);
  }

  function uncast<T>(val: T, typ: any): any {
      return transform(val, typ, jsToJSONProps);
  }

  function a(typ: any) {
      return { arrayItems: typ };
  }

  function u(...typs: any[]) {
      return { unionMembers: typs };
  }

  function o(props: any[], additional: any) {
      return { props, additional };
  }

  function m(additional: any) {
      return { props: [], additional };
  }

  function r(name: string) {
      return { ref: name };
  }

  const typeMap: any = {
      "StaffAttendance": o([
          { json: "days", js: "days", typ: a(r("Day")) },
          { json: "warning", js: "warning", typ: "" },
      ], false),
      "Day": o([
          { json: "dateTime", js: "dateTime", typ: "" },
          { json: "date", js: "date", typ: "" },
          { json: "dateMMM", js: "dateMMM", typ: "" },
          { json: "dateDMMM", js: "dateDMMM", typ: "" },
          { json: "Employee", js: "Employee", typ: a(r("Employee")) },
      ], false),
      "Employee": o([
          { json: "name", js: "name", typ: "" },
          { json: "storeName", js: "storeName", typ: "" },
          { json: "attendance", js: "attendance", typ: r("Attendance") },
          { json: "attendanceDetails", js: "attendanceDetails", typ: a(r("AttendanceDetail")) },
      ], false),
      "Attendance": o([
          { json: "working", js: "working", typ: "" },
          { json: "break", js: "break", typ: "" },
      ], false),
      "AttendanceDetail": o([
          { json: "key", js: "key", typ: "" },
          { json: "value", js: "value", typ: "" },
      ], false),
  };
}
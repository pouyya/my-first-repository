
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Injectable()
export class ProductService{

    public database: SQLite;
    constructor(public platform: Platform, public storage: Storage){
        // this.platform.ready().then(()=>{
        //     this.database = new SQLite();
        //     this.database.openDatabase({name:"data.db", location:"default"}).then(()=>{
        //         console.log("Db open");       
        //     },(error)=>{
        //         console.log("ERROR : ", error);
        //     });
        // });
    }    

    public saveProduct(orders:any){
        for(var i = 0 ; i < orders.length ; i++){
            this.database.executeSql("INSERT INTO orders (brand, item, item_no, price, discount, enabled, status, mdate) VALUES (?,?,?,?,?,?,?,?)", [orders[i].brand, orders[i].item, orders[i].item_no, orders[i].price, orders[i].discount, orders[i].enabled, orders[i].status, orders[i].mdate]).then((data)=>{
                console.log("INSERTED : ", JSON.stringify(data));
            }, (error)=>{
                console.log("ERROR : " + JSON.stringify(error));
            });
        }
    }

    public deleteProduct(){
        return this.database.executeSql("DELETE FROM orders", []);
    }

    public getProduct(){
        return this.database.executeSql("SELECT * FROM orders", [])
    }

    public getAllProductStatus(){
        return this.database.executeSql("SELECT * FROM orders_status", []);
    }

    public getProductStatus(status:string){
        return this.database.executeSql("SELECT * FROM orders_status WHERE status = ?", ['saved']);
    }

    public saveProductStatus(order:any){
        return this.database.executeSql("INSERT INTO orders_status (price, status, mdate) VALUES (?,?,?)",[order.price, order.status, order.mdate]);
    }

    
    public updataProductStatusData(order:any){
        return this.database.executeSql("UPDATE orders_status SET price = ?, mdate = ? WHERE status = ?", [order.price, order.mdate, order.status]);
    }

    public updateProductStatus(mdate:string){
        return this.database.executeSql("UPDATE orders_status SET status = ?, mdate = ? WHERE status = ?", ['confirmed', mdate, 'saved']);
    }

    public getSelectedProduct(){
        return this.storage.get('selectedProduct');
    }

    public setSelectedProduct(product:any){
        return this.storage.set('selectedProduct', JSON.stringify(product));
    }

    public removeSelectedProduct(){
        return this.storage.remove('selectedProduct');
    }

    


}
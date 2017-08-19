import { Injectable } from '@angular/core';
import { CacheFactory } from 'cachefactory';

let cache;

@Injectable()
export class CacheService {
    constructor(private cacheService: CacheFactory) {
        var cacheFactory = new CacheFactory();
        if (!cacheFactory.exists('SimplePOS-Cache')) {
            cache = cacheFactory.createCache('SimplePOS-Cache');
        }
    }

    public get(key: string): any {
        return cache.get(key);
    }

    public put(key: string, value: any) {
        cache.put(key, value);
    }

    public getAndPut(key: string, fetchDelegate: (e: string) => Promise<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            var cacheValue = cache.get(key);

            if (cacheValue === undefined) {
                fetchDelegate(key).then(value => {
                    cache.put(key, value);
                    resolve(value);
                });
            }
            else {
                resolve(cacheValue);
            }
        });
    }

    public removeAll(){
        cache.removeAll();
    }
}

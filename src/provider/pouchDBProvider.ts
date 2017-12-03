import * as PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { ConfigService } from '../services/configService';

export class PouchDBProvider {

    public static initializePlugin() {
        
        PouchDB.default.plugin(PouchDBFind);

        if (ConfigService.isDevelopment()) {
            PouchDB.default.debug.enable('*');
            window["PouchDB"] = PouchDB.default;
        }
        else {
            PouchDB.default.debug.disable()
        }
    }

    public static createDb(url: string) {
        return PouchDB.default(url);
    }

    public static async getPendingMax(url: string) {
        var externalDBInfo = await PouchDB.default(url).info();
        var updateSeq = externalDBInfo.update_seq.toString();
        var firstPortionNumber = updateSeq.indexOf('-')
        return Number(updateSeq.substring(0, firstPortionNumber));
    }

    public static getProgress(change, pendingMax) {
        var lastSeq = change.last_seq.toString();
        var pending = Number(lastSeq.substring(0, lastSeq.indexOf('-')));
        var progress;
        if (pendingMax > 0) {
            progress = pending / pendingMax;
        } else {
            progress = 1;  // 100%
        }

        return progress;
    }
}
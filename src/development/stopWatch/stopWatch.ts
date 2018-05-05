export class Stopwatch {

	time: number;

    start() {
        this.time = Date.now();
    }
    
    stop() {
		var result =  Date.now() - this.time;
		this.time =  null;
		return result;
    }
}


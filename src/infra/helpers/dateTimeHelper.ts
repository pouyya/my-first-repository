export class DateTimeHelper {
    public static getWeekRange(date: Date): Week {

        if (!date) {
            return null;
        }

        var todayNumber = date.getDay();
        var mondayNumber = 1 - todayNumber;
        var sundayNumber = 7 - todayNumber;
        var result = new Week();
        result.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + mondayNumber);
        result.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + sundayNumber);
        return result;
    }
}

export class Week {
    public startDate: Date;
    public endDate: Date;
}
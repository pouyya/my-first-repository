import { DateTime } from "ionic-angular";

export interface StaffAttendance {
    days: Day[];
    warning: null;
}

export interface Day {
    hide: string;
    date: DateTime;
    Employee: Employee[];
}

export interface Employee {
    name: string;
    storeName: string;
    attendance: Attendance;
    attendanceDetails: AttendanceDetail[];
}

export interface Attendance {
    working: string;
    break: string;
}

export interface AttendanceDetail {
    key: Key;
    value: DateTime;
}

export enum Key {
    BreakEnd = "break_end",
    BreakStart = "break_start",
    ClockIn = "clock_in",
    ClockOut = "clock_out",
}

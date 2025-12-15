export enum UserRole {
  STUDENT = 'STUDENT',
  WARDEN = 'WARDEN'
}

export enum LogType {
  ENTER = 'ENTER',
  EXIT = 'EXIT'
}

export enum EntryStatus {
  NORMAL = 'NORMAL',
  LATE = 'LATE', // 6PM - 9PM
  DENIED = 'DENIED', // > 9PM without permission
  APPROVED_LATE = 'APPROVED_LATE', // > 9PM with permission
  VIOLATION = 'VIOLATION' // > 9PM forced entry
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum StudentStatus {
  IN = 'IN',
  OUT = 'OUT'
}

export interface Student {
  id: string; // Student ID (e.g., S12345)
  name: string;
  rfidTag: string;
  room: string;
  block: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  parentPhone: string;
  photoUrl: string;
  currentStatus: StudentStatus;
}

export interface AccessLog {
  id: string;
  studentId: string;
  studentName: string; // Denormalized for easier display
  timestamp: string; // ISO string
  type: LogType;
  status: EntryStatus;
  remarks?: string;
  block: string; // For filtering
}

export interface ExitRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  dateFrom: string;
  dateTo: string;
  proofUrl?: string; // Mock URL for PDF
  status: RequestStatus;
  wardenRemarks?: string;
  createdAt: string;
}

export interface HostelEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  attendees: string[]; // List of student IDs
}

export interface UserSession {
  id: string;
  role: UserRole;
  name: string;
}
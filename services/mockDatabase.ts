import { Student, AccessLog, ExitRequest, HostelEvent, StudentStatus, LogType, EntryStatus, RequestStatus } from '../types';

// Helper to generate past time dynamically
const getTime = (daysAgo: number, hours: number, minutes: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const INITIAL_STUDENTS: Student[] = [
  { id: 'S001', name: 'Alice Johnson', rfidTag: 'TAG001', room: '101', block: 'A', gender: 'FEMALE', phone: '555-0101', parentPhone: '555-0201', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', currentStatus: StudentStatus.IN },
  { id: 'S002', name: 'Bob Smith', rfidTag: 'TAG002', room: '102', block: 'B', gender: 'MALE', phone: '555-0102', parentPhone: '555-0202', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', currentStatus: StudentStatus.IN },
  { id: 'S003', name: 'Charlie Brown', rfidTag: 'TAG003', room: '201', block: 'A', gender: 'MALE', phone: '555-0103', parentPhone: '555-0203', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', currentStatus: StudentStatus.IN },
  { id: 'S004', name: 'Diana Prince', rfidTag: 'TAG004', room: '202', block: 'B', gender: 'FEMALE', phone: '555-0104', parentPhone: '555-0204', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', currentStatus: StudentStatus.IN },
  { id: 'S005', name: 'Evan Wright', rfidTag: 'TAG005', room: '103', block: 'A', gender: 'MALE', phone: '555-0105', parentPhone: '555-0205', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan', currentStatus: StudentStatus.IN },
  { id: 'S006', name: 'Fiona Gallagher', rfidTag: 'TAG006', room: '104', block: 'B', gender: 'FEMALE', phone: '555-0106', parentPhone: '555-0206', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona', currentStatus: StudentStatus.IN },
  { id: 'S007', name: 'George Michael', rfidTag: 'TAG007', room: '203', block: 'A', gender: 'MALE', phone: '555-0107', parentPhone: '555-0207', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George', currentStatus: StudentStatus.OUT },
  { id: 'S008', name: 'Hannah Montana', rfidTag: 'TAG008', room: '204', block: 'B', gender: 'FEMALE', phone: '555-0108', parentPhone: '555-0208', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah', currentStatus: StudentStatus.IN },
  { id: 'S009', name: 'Ian Somerhalder', rfidTag: 'TAG009', room: '301', block: 'A', gender: 'MALE', phone: '555-0109', parentPhone: '555-0209', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ian', currentStatus: StudentStatus.IN },
  { id: 'S010', name: 'Julia Roberts', rfidTag: 'TAG010', room: '302', block: 'B', gender: 'FEMALE', phone: '555-0110', parentPhone: '555-0210', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia', currentStatus: StudentStatus.OUT },
  { id: 'S011', name: 'Kevin Hart', rfidTag: 'TAG011', room: '303', block: 'A', gender: 'MALE', phone: '555-0111', parentPhone: '555-0211', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin', currentStatus: StudentStatus.IN },
  { id: 'S012', name: 'Luna Lovegood', rfidTag: 'TAG012', room: '304', block: 'B', gender: 'FEMALE', phone: '555-0112', parentPhone: '555-0212', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', currentStatus: StudentStatus.IN },
  { id: 'S013', name: 'Michael Scott', rfidTag: 'TAG013', room: '401', block: 'A', gender: 'MALE', phone: '555-0113', parentPhone: '555-0213', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', currentStatus: StudentStatus.IN },
  { id: 'S014', name: 'Nancy Wheeler', rfidTag: 'TAG014', room: '402', block: 'B', gender: 'FEMALE', phone: '555-0114', parentPhone: '555-0214', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy', currentStatus: StudentStatus.IN },
  { id: 'S015', name: 'Oscar Martinez', rfidTag: 'TAG015', room: '403', block: 'A', gender: 'MALE', phone: '555-0115', parentPhone: '555-0215', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar', currentStatus: StudentStatus.OUT },
];

// GENERATE BULK LOGS TO SIMULATE ~400 RECORDS/DAY
const generateBulkLogs = (): AccessLog[] => {
  const logs: AccessLog[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const days = [today, yesterday];
  
  days.forEach(day => {
    // Simulate activity from 6 AM to 11 PM
    for (let hour = 6; hour < 23; hour++) {
      // High traffic: Morning (8-10), Lunch (12-2), Evening (17-19)
      let recordsPerHour = 10; 
      if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19)) {
        recordsPerHour = 35; // Peak times
      }

      for (let i = 0; i < recordsPerHour; i++) {
        const student = INITIAL_STUDENTS[Math.floor(Math.random() * INITIAL_STUDENTS.length)];
        const min = Math.floor(Math.random() * 60);
        const sec = Math.floor(Math.random() * 60);
        
        const timestamp = new Date(day);
        timestamp.setHours(hour, min, sec);

        const type = Math.random() > 0.5 ? LogType.ENTER : LogType.EXIT;
        
        let status = EntryStatus.NORMAL;
        let remarks = undefined;

        // Logic for status
        if (type === LogType.ENTER) {
          if (hour >= 18 && hour < 21) status = EntryStatus.LATE;
          if (hour >= 21) status = EntryStatus.VIOLATION;
          if (hour >= 21 && Math.random() > 0.8) status = EntryStatus.APPROVED_LATE; // Rare approved
        }

        logs.push({
          id: `BULK-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 5)}`,
          studentId: student.id,
          studentName: student.name,
          timestamp: timestamp.toISOString(),
          type: type,
          status: status,
          block: student.block,
          remarks: status !== EntryStatus.NORMAL ? 'Automated Log' : undefined
        });
      }
    }
  });

  // Sort newest first
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const INITIAL_LOGS: AccessLog[] = generateBulkLogs();

const INITIAL_REQUESTS: ExitRequest[] = [
  {
    id: 'R001',
    studentId: 'S006',
    studentName: 'Fiona Gallagher',
    reason: 'Family Event',
    dateFrom: getTime(1, 14, 0),
    dateTo: getTime(1, 22, 0),
    status: RequestStatus.APPROVED,
    createdAt: getTime(2, 10, 0),
    proofUrl: '#'
  },
  {
    id: 'R002',
    studentId: 'S007',
    studentName: 'George Michael',
    reason: 'Medical Appointment',
    dateFrom: getTime(0, 9, 0),
    dateTo: getTime(0, 18, 0),
    status: RequestStatus.PENDING,
    createdAt: getTime(1, 15, 0),
    proofUrl: '#'
  },
  {
    id: 'R003',
    studentId: 'S001',
    studentName: 'Alice Johnson',
    reason: 'Weekend Home Visit',
    dateFrom: getTime(-1, 16, 0), 
    dateTo: getTime(-3, 20, 0),
    status: RequestStatus.PENDING,
    createdAt: getTime(0, 8, 30),
    proofUrl: '#'
  },
  {
    id: 'R004',
    studentId: 'S001',
    studentName: 'Alice Johnson',
    reason: 'Sister Wedding',
    dateFrom: getTime(10, 10, 0), 
    dateTo: getTime(8, 10, 0),
    status: RequestStatus.APPROVED,
    wardenRemarks: 'Enjoy the wedding!',
    createdAt: getTime(15, 9, 0),
    proofUrl: '#'
  },
  {
    id: 'R005',
    studentId: 'S002',
    studentName: 'Bob Smith',
    reason: 'Late Night Movie',
    dateFrom: getTime(0, 20, 0),
    dateTo: getTime(0, 23, 30),
    status: RequestStatus.REJECTED,
    wardenRemarks: 'Not a valid reason for late entry.',
    createdAt: getTime(0, 12, 0),
    proofUrl: '#'
  },
  {
    id: 'R006',
    studentId: 'S014',
    studentName: 'Nancy Wheeler',
    reason: 'Internship Interview',
    dateFrom: getTime(-2, 8, 0),
    dateTo: getTime(-2, 18, 0),
    status: RequestStatus.PENDING,
    createdAt: getTime(0, 14, 20),
    proofUrl: '#'
  }
];

const INITIAL_EVENTS: HostelEvent[] = [
  {
    id: 'E001',
    title: 'Weekly Floor Meeting',
    date: getTime(0, 0, 0).split('T')[0], // Today
    startTime: '20:00',
    attendees: ['S001', 'S002', 'S003']
  },
  {
    id: 'E002',
    title: 'Fire Drill',
    date: getTime(-2, 0, 0).split('T')[0], // 2 days from now
    startTime: '10:00',
    attendees: []
  }
];

const STORAGE_KEYS = {
  STUDENTS: 'hostel_students',
  LOGS: 'hostel_logs',
  REQUESTS: 'hostel_requests',
  EVENTS: 'hostel_events',
};

// Helper to get data
const getItems = <T>(key: string, initial: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

// Helper to set data
const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const db = {
  students: {
    getAll: () => getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
    getById: (id: string) => getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS).find(s => s.id === id),
    update: (updatedStudent: Student) => {
      const students = getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const index = students.findIndex(s => s.id === updatedStudent.id);
      if (index !== -1) {
        students[index] = updatedStudent;
        setItems(STORAGE_KEYS.STUDENTS, students);
      }
    },
    add: (student: Student) => {
       const students = getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
       setItems(STORAGE_KEYS.STUDENTS, [...students, student]);
    },
    updateStatus: (id: string, status: StudentStatus) => {
      const students = getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const student = students.find(s => s.id === id);
      if (student) {
        student.currentStatus = status;
        setItems(STORAGE_KEYS.STUDENTS, students);
      }
    }
  },
  logs: {
    getAll: () => getItems<AccessLog>(STORAGE_KEYS.LOGS, INITIAL_LOGS),
    add: (log: AccessLog) => {
      const logs = getItems<AccessLog>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
      setItems(STORAGE_KEYS.LOGS, [log, ...logs]); // Newest first
    }
  },
  requests: {
    getAll: () => getItems<ExitRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
    add: (req: ExitRequest) => {
      const requests = getItems<ExitRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
      setItems(STORAGE_KEYS.REQUESTS, [req, ...requests]);
    },
    update: (updated: ExitRequest) => {
      const requests = getItems<ExitRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
      const index = requests.findIndex(r => r.id === updated.id);
      if (index !== -1) {
        requests[index] = updated;
        setItems(STORAGE_KEYS.REQUESTS, requests);
      }
    }
  },
  events: {
    getAll: () => getItems<HostelEvent>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
    add: (event: HostelEvent) => {
      const events = getItems<HostelEvent>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      setItems(STORAGE_KEYS.EVENTS, [...events, event]);
    },
    updateAttendees: (eventId: string, attendees: string[]) => {
      const events = getItems<HostelEvent>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      const event = events.find(e => e.id === eventId);
      if (event) {
        event.attendees = attendees;
        setItems(STORAGE_KEYS.EVENTS, events);
      }
    }
  },
  
  // CORE BUSINESS LOGIC for Entry/Exit
  processScan: (rfidOrId: string, manualOverride: boolean = false, overrideType?: LogType): { success: boolean, message: string, log?: AccessLog } => {
    const students = getItems<Student>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const student = students.find(s => s.id === rfidOrId || s.rfidTag === rfidOrId);

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine Action (Toggle status unless manual override)
    let action = student.currentStatus === StudentStatus.IN ? LogType.EXIT : LogType.ENTER;
    if (manualOverride && overrideType) {
        action = overrideType;
    }

    let status = EntryStatus.NORMAL;
    let message = `${student.name} ${action === LogType.ENTER ? 'Entered' : 'Exited'}`;

    if (action === LogType.ENTER) {
      if (currentHour >= 18 && currentHour < 21) {
        status = EntryStatus.LATE;
        message = `LATE ENTRY: ${student.name}`;
      } else if (currentHour >= 21 || currentHour < 6) {
        // Check for approved requests covering today
        const requests = getItems<ExitRequest>(STORAGE_KEYS.REQUESTS, []);
        const hasApproval = requests.find(r => 
          r.studentId === student.id && 
          r.status === RequestStatus.APPROVED &&
          new Date(r.dateTo) >= now
        );

        if (hasApproval) {
          status = EntryStatus.APPROVED_LATE;
          message = `APPROVED LATE ENTRY: ${student.name}`;
        } else {
            status = EntryStatus.VIOLATION; // Or DENIED if we want to block mechanism
            message = `VIOLATION: ${student.name} attempted entry after curfew without approval. Recorded.`;
        }
      }
    }

    // Create Log
    const newLog: AccessLog = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      timestamp: now.toISOString(),
      type: action,
      status: status,
      block: student.block,
      remarks: manualOverride ? 'Manual Override' : undefined
    };

    // Update DB
    db.logs.add(newLog);
    db.students.updateStatus(student.id, action === LogType.ENTER ? StudentStatus.IN : StudentStatus.OUT);

    return { success: true, message, log: newLog };
  }
};
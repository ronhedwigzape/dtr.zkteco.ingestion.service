export interface RawEntry {
    sn: number;
    user_id: string;
    recordTime?: string;
    record_time?: string;
    type: number;
    state: number;
    ip: string;
  }
  
  export interface NormalizedEntry {
    id: string;
    /** maps to your Employee.id */
    userId: string;
    /** ISO timestamp */
    timestamp: string;
    type: number;
    state: number;
    ip: string;
  }
  
declare module 'pg' {
  export class Client {
    constructor(config?: any);
    connect(): Promise<void>;
    query: (text: string, params?: any[]) => Promise<{ rowCount: number; rows: any[] }>;
    end(): Promise<void>;
  }
}

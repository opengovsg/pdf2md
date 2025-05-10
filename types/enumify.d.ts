declare module 'enumify' {
  export class Enum {
    static initEnum(enums: Record<string, any>): void;
    static enumValueOf(name: string): any;
    name: string;
    ordinal: number;
  }
} 

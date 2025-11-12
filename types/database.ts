export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericRecord = Record<string, unknown>;

type GenericTable = {
  Row: GenericRecord;
  Insert: GenericRecord;
  Update: GenericRecord;
};

export interface Database {
  public: {
    Tables: { [key: string]: GenericTable };
    Views: { [key: string]: GenericTable };
    Functions: { [key: string]: unknown };
    Enums: { [key: string]: string };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          ein: string;
          industry_type: 'construction' | 'logistics' | 'manufacturing' | 'field_services';
          employee_count: number;
          stripe_customer_id: string | null;
          unit_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          ein: string;
          industry_type: 'construction' | 'logistics' | 'manufacturing' | 'field_services';
          employee_count: number;
          stripe_customer_id?: string | null;
          unit_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          ein?: string;
          industry_type?: 'construction' | 'logistics' | 'manufacturing' | 'field_services';
          employee_count?: number;
          stripe_customer_id?: string | null;
          unit_customer_id?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          role: 'owner' | 'admin' | 'field_worker' | 'compliance_officer';
          created_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          role: 'owner' | 'admin' | 'field_worker' | 'compliance_officer';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          role?: 'owner' | 'admin' | 'field_worker' | 'compliance_officer';
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          location: Json;
          start_date: string;
          end_date: string | null;
          estimated_value: number | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          location: Json;
          start_date: string;
          end_date?: string | null;
          estimated_value?: number | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          location?: Json;
          start_date?: string;
          end_date?: string | null;
          estimated_value?: number | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
        };
      };
      compliance_requirements: {
        Row: {
          id: string;
          regulation_id: string;
          title: string;
          description: string;
          industry_types: string[];
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          embedding: number[] | null;
        };
        Insert: {
          id?: string;
          regulation_id: string;
          title: string;
          description: string;
          industry_types: string[];
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          embedding?: number[] | null;
        };
        Update: {
          id?: string;
          regulation_id?: string;
          title?: string;
          description?: string;
          industry_types?: string[];
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          embedding?: number[] | null;
        };
      };
      compliance_audits: {
        Row: {
          id: string;
          company_id: string;
          requirement_id: string;
          job_id: string | null;
          status: 'compliant' | 'non_compliant' | 'pending' | 'waived';
          audit_data: Json;
          auditor_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          requirement_id: string;
          job_id?: string | null;
          status: 'compliant' | 'non_compliant' | 'pending' | 'waived';
          audit_data: Json;
          auditor_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          requirement_id?: string;
          job_id?: string | null;
          status?: 'compliant' | 'non_compliant' | 'pending' | 'waived';
          audit_data?: Json;
          auditor_user_id?: string | null;
          created_at?: string;
        };
      };
      financial_products: {
        Row: {
          id: string;
          company_id: string;
          product_type: 'material_financing' | 'payroll_advance' | 'invoice_factoring';
          stripe_loan_id: string | null;
          unit_account_id: string | null;
          amount: number;
          status: 'pending' | 'approved' | 'funded' | 'repaid' | 'defaulted';
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          product_type: 'material_financing' | 'payroll_advance' | 'invoice_factoring';
          stripe_loan_id?: string | null;
          unit_account_id?: string | null;
          amount: number;
          status: 'pending' | 'approved' | 'funded' | 'repaid' | 'defaulted';
          metadata: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          product_type?: 'material_financing' | 'payroll_advance' | 'invoice_factoring';
          stripe_loan_id?: string | null;
          unit_account_id?: string | null;
          amount?: number;
          status?: 'pending' | 'approved' | 'funded' | 'repaid' | 'defaulted';
          metadata?: Json;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          company_id: string;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          event_type: string;
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      job_finance_rollup: {
        Row: {
          company_id: string;
          job_id: string;
          financed_amount: number | null;
          financing_events: number | null;
        };
      };
    };
    Functions: {
      current_user_company_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}

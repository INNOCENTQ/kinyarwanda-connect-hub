export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          active: boolean
          active_until: string | null
          business_name: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link_url: string | null
          phone: string | null
          title: string
          user_id: string
        }
        Insert: {
          active?: boolean
          active_until?: string | null
          business_name: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          phone?: string | null
          title: string
          user_id: string
        }
        Update: {
          active?: boolean
          active_until?: string | null
          business_name?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          phone?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosis_records: {
        Row: {
          ai_diagnosis: string | null
          ai_recommendations: string | null
          ai_treatment: string | null
          confidence: number | null
          created_at: string
          diagnosis_type: string
          id: string
          input_type: string
          latitude: number | null
          longitude: number | null
          media_url: string | null
          symptoms_text: string | null
          user_id: string
          weather_context: Json | null
        }
        Insert: {
          ai_diagnosis?: string | null
          ai_recommendations?: string | null
          ai_treatment?: string | null
          confidence?: number | null
          created_at?: string
          diagnosis_type: string
          id?: string
          input_type: string
          latitude?: number | null
          longitude?: number | null
          media_url?: string | null
          symptoms_text?: string | null
          user_id: string
          weather_context?: Json | null
        }
        Update: {
          ai_diagnosis?: string | null
          ai_recommendations?: string | null
          ai_treatment?: string | null
          confidence?: number | null
          created_at?: string
          diagnosis_type?: string
          id?: string
          input_type?: string
          latitude?: number | null
          longitude?: number | null
          media_url?: string | null
          symptoms_text?: string | null
          user_id?: string
          weather_context?: Json | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: string
          created_at: string
          currency: string | null
          description: string | null
          district: string | null
          featured_until: string | null
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          price: number | null
          product_type: string
          quantity: number | null
          sector: string | null
          status: string
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string | null
          description?: string | null
          district?: string | null
          featured_until?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          price?: number | null
          product_type: string
          quantity?: number | null
          sector?: string | null
          status?: string
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          district?: string | null
          featured_until?: string | null
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          price?: number | null
          product_type?: string
          quantity?: number | null
          sector?: string | null
          status?: string
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          phone: string
          reference_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          phone: string
          reference_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          phone?: string
          reference_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          sector: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          sector?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          sector?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active_until: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_until: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_until?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vet_consultations: {
        Row: {
          created_at: string
          description: string
          id: string
          phone: string
          status: string
          user_id: string
          vet_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          phone: string
          status?: string
          user_id: string
          vet_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          phone?: string
          status?: string
          user_id?: string
          vet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_consultations_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "vets"
            referencedColumns: ["id"]
          },
        ]
      }
      vets: {
        Row: {
          active: boolean
          created_at: string
          district: string | null
          fee: number
          id: string
          name: string
          phone: string | null
          specialty: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          district?: string | null
          fee?: number
          id?: string
          name: string
          phone?: string | null
          specialty?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          district?: string | null
          fee?: number
          id?: string
          name?: string
          phone?: string | null
          specialty?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { _uid: string }; Returns: boolean }
      review_payment: {
        Args: { _approve: boolean; _id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          id: string;
          idea_id: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          idea_id: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          idea_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "idea_scores";
            referencedColumns: ["idea_id"];
          },
          {
            foreignKeyName: "comments_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "trip_ideas";
            referencedColumns: ["id"];
          },
        ];
      };
      ideas: {
        Row: {
          author_id: string | null;
          created_at: string;
          deleted_at: string | null;
          geom: unknown;
          id: string;
          kind: string;
          last_voted_at: string | null;
          note: string | null;
          source_url: string | null;
          stage_id: string | null;
          title: string;
          trip_id: string;
          updated_at: string;
          withered_at: string | null;
        };
        Insert: {
          author_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          geom?: unknown;
          id?: string;
          kind: string;
          last_voted_at?: string | null;
          note?: string | null;
          source_url?: string | null;
          stage_id?: string | null;
          title: string;
          trip_id: string;
          updated_at?: string;
          withered_at?: string | null;
        };
        Update: {
          author_id?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          geom?: unknown;
          id?: string;
          kind?: string;
          last_voted_at?: string | null;
          note?: string | null;
          source_url?: string | null;
          stage_id?: string | null;
          title?: string;
          trip_id?: string;
          updated_at?: string;
          withered_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ideas_stage_id_fkey";
            columns: ["stage_id", "trip_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id", "trip_id"];
          },
          {
            foreignKeyName: "ideas_stage_id_fkey";
            columns: ["stage_id", "trip_id"];
            isOneToOne: false;
            referencedRelation: "trip_stages";
            referencedColumns: ["id", "trip_id"];
          },
          {
            foreignKeyName: "ideas_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_color: string | null;
          avatar_url: string | null;
          created_at: string;
          id: string;
          name: string;
          traveler_tags: string[];
          updated_at: string;
        };
        Insert: {
          avatar_color?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          name?: string;
          traveler_tags?: string[];
          updated_at?: string;
        };
        Update: {
          avatar_color?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          traveler_tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      stages: {
        Row: {
          color: string | null;
          created_at: string;
          ends_on: string | null;
          geom: unknown;
          id: string;
          name: string;
          position: number;
          starts_on: string | null;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          ends_on?: string | null;
          geom?: unknown;
          id?: string;
          name: string;
          position: number;
          starts_on?: string | null;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          ends_on?: string | null;
          geom?: unknown;
          id?: string;
          name?: string;
          position?: number;
          starts_on?: string | null;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stages_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_invites: {
        Row: {
          created_at: string;
          created_by: string | null;
          expires_at: string;
          token: string;
          trip_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string;
          token?: string;
          trip_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string;
          token?: string;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_invites_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_members: {
        Row: {
          joined_at: string;
          role: string;
          trip_id: string;
          user_id: string;
        };
        Insert: {
          joined_at?: string;
          role?: string;
          trip_id: string;
          user_id: string;
        };
        Update: {
          joined_at?: string;
          role?: string;
          trip_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          area: unknown;
          created_at: string;
          created_by: string | null;
          ends_on: string | null;
          id: string;
          name: string;
          plant_in_forest: boolean;
          starts_on: string | null;
          updated_at: string;
        };
        Insert: {
          area?: unknown;
          created_at?: string;
          created_by?: string | null;
          ends_on?: string | null;
          id?: string;
          name: string;
          plant_in_forest?: boolean;
          starts_on?: string | null;
          updated_at?: string;
        };
        Update: {
          area?: unknown;
          created_at?: string;
          created_by?: string | null;
          ends_on?: string | null;
          id?: string;
          name?: string;
          plant_in_forest?: boolean;
          starts_on?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          created_at: string;
          idea_id: string;
          updated_at: string;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          idea_id: string;
          updated_at?: string;
          user_id?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          idea_id?: string;
          updated_at?: string;
          user_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "idea_scores";
            referencedColumns: ["idea_id"];
          },
          {
            foreignKeyName: "votes_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "trip_ideas";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      idea_scores: {
        Row: {
          down: number | null;
          fire: number | null;
          idea_id: string | null;
          score: number | null;
          stage: string | null;
          trip_id: string | null;
          up: number | null;
          members: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "ideas_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_ideas: {
        Row: {
          author_id: string | null;
          author_name: string | null;
          comment_count: number | null;
          created_at: string | null;
          down: number | null;
          fire: number | null;
          growth: string | null;
          id: string | null;
          kind: string | null;
          lat: number | null;
          length_m: number | null;
          lon: number | null;
          my_vote: string | null;
          note: string | null;
          score: number | null;
          shape: Json | null;
          source_url: string | null;
          stage_id: string | null;
          title: string | null;
          trip_id: string | null;
          up: number | null;
          members: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "ideas_stage_id_fkey";
            columns: ["stage_id", "trip_id"];
            isOneToOne: false;
            referencedRelation: "stages";
            referencedColumns: ["id", "trip_id"];
          },
          {
            foreignKeyName: "ideas_stage_id_fkey";
            columns: ["stage_id", "trip_id"];
            isOneToOne: false;
            referencedRelation: "trip_stages";
            referencedColumns: ["id", "trip_id"];
          },
          {
            foreignKeyName: "ideas_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_stages: {
        Row: {
          color: string | null;
          created_at: string | null;
          ends_on: string | null;
          id: string | null;
          lat: number | null;
          lon: number | null;
          name: string | null;
          position: number | null;
          starts_on: string | null;
          trip_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          ends_on?: string | null;
          id?: string | null;
          lat?: never;
          lon?: never;
          name?: string | null;
          position?: number | null;
          starts_on?: string | null;
          trip_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          ends_on?: string | null;
          id?: string | null;
          lat?: never;
          lon?: never;
          name?: string | null;
          position?: number | null;
          starts_on?: string | null;
          trip_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stages_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      add_stage: {
        Args: {
          p_ends_on?: string;
          p_lat?: number;
          p_lon?: number;
          p_name: string;
          p_starts_on?: string;
          p_trip_id: string;
        };
        Returns: string;
      };
      cast_vote: {
        Args: { p_idea_id: string; p_value: string };
        Returns: string;
      };
      delete_idea: { Args: { p_idea_id: string }; Returns: string };
      delete_my_account: { Args: never; Returns: undefined };
      join_trip: { Args: { p_token: string }; Returns: string };
      move_stage: {
        Args: { p_stage_id: string; p_up: boolean };
        Returns: boolean;
      };
      plant_idea: {
        Args: {
          p_kind: string;
          p_lat?: number;
          p_lon?: number;
          p_note?: string;
          p_source_url?: string;
          p_stage_id?: string;
          p_title: string;
          p_trip_id: string;
        };
        Returns: string;
      };
      reorder_stages: {
        Args: { p_stage_ids: string[]; p_trip_id: string };
        Returns: undefined;
      };
      restore_idea: { Args: { p_idea_id: string }; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

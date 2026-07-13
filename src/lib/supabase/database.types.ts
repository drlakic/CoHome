// Database types for the CoHome schema.
// Hand-authored to match supabase gen output shape (the CLI generator needs
// Docker, unavailable here). Keep in sync with supabase/migrations/ — or
// regenerate with:
//   supabase gen types typescript --db-url <connection-string>

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RelationshipStatus =
  | "divorced"
  | "widowed"
  | "never_married"
  | "other";
export type MoveInTimeframe =
  | "immediate"
  | "within_1_month"
  | "within_3_months"
  | "flexible";
export type Pets = "has_pets" | "okay_with_pets" | "no_pets";
export type Smoking = "yes" | "no" | "outside_only";
export type ScheduleType = "early_riser" | "night_owl" | "flexible";
export type OvernightGuestsFrequency = "never" | "occasionally" | "regularly";
export type OvernightGuestsNotice =
  | "no_notice_needed"
  | "some_notice"
  | "advance_notice_required";
export type DatingPreference =
  | "comfortable"
  | "prefer_discreet"
  | "prefer_not_dating";
export type HostingFrequency = "never" | "small_only" | "regularly";
export type CustodyArrangement = "full_time" | "shared" | "occasional" | "none";
export type RoommateKidsPreference =
  | "comfortable"
  | "prefer_no_kids"
  | "no_preference";
export type MatchStatus = "pending" | "mutual" | "declined";
export type ReportReason =
  | "inappropriate_content"
  | "harassment"
  | "fake_profile"
  | "dating_solicitation"
  | "safety_concern"
  | "other";
export type ReportStatus = "open" | "reviewed" | "dismissed" | "actioned";

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: string;
          name: string;
          region: string;
          country: string;
          metro_area: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          country: string;
          metro_area: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          country?: string;
          metro_area?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      neighborhoods: {
        Row: {
          id: string;
          city_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          birthdate: string;
          gender: string | null;
          bio: string | null;
          relationship_status: RelationshipStatus;
          photo_urls: string[];
          city_id: string | null;
          budget_min: number | null;
          budget_max: number | null;
          move_in_timeframe: MoveInTimeframe | null;
          phone_verified: boolean;
          id_verified: boolean;
          notify_new_match: boolean;
          notify_new_message: boolean;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          birthdate: string;
          gender?: string | null;
          bio?: string | null;
          relationship_status: RelationshipStatus;
          photo_urls?: string[];
          city_id?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_timeframe?: MoveInTimeframe | null;
          phone_verified?: boolean;
          id_verified?: boolean;
          notify_new_match?: boolean;
          notify_new_message?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birthdate?: string;
          gender?: string | null;
          bio?: string | null;
          relationship_status?: RelationshipStatus;
          photo_urls?: string[];
          city_id?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          move_in_timeframe?: MoveInTimeframe | null;
          phone_verified?: boolean;
          id_verified?: boolean;
          notify_new_match?: boolean;
          notify_new_message?: boolean;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_lifestyle: {
        Row: {
          profile_id: string;
          pets: Pets | null;
          smoking: Smoking | null;
          cleanliness_level: number | null;
          schedule_type: ScheduleType | null;
          noise_tolerance: number | null;
          overnight_guests_frequency: OvernightGuestsFrequency | null;
          overnight_guests_notice: OvernightGuestsNotice | null;
          dating_while_cohabiting_preference: DatingPreference | null;
          hosting_frequency: HostingFrequency | null;
          shared_space_guest_policy: string | null;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          pets?: Pets | null;
          smoking?: Smoking | null;
          cleanliness_level?: number | null;
          schedule_type?: ScheduleType | null;
          noise_tolerance?: number | null;
          overnight_guests_frequency?: OvernightGuestsFrequency | null;
          overnight_guests_notice?: OvernightGuestsNotice | null;
          dating_while_cohabiting_preference?: DatingPreference | null;
          hosting_frequency?: HostingFrequency | null;
          shared_space_guest_policy?: string | null;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          pets?: Pets | null;
          smoking?: Smoking | null;
          cleanliness_level?: number | null;
          schedule_type?: ScheduleType | null;
          noise_tolerance?: number | null;
          overnight_guests_frequency?: OvernightGuestsFrequency | null;
          overnight_guests_notice?: OvernightGuestsNotice | null;
          dating_while_cohabiting_preference?: DatingPreference | null;
          hosting_frequency?: HostingFrequency | null;
          shared_space_guest_policy?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_lifestyle_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_kids_custody: {
        Row: {
          profile_id: string;
          has_kids: boolean;
          num_kids: number | null;
          kid_ages: number[];
          custody_arrangement: CustodyArrangement | null;
          typical_schedule: string | null;
          roommate_kids_preference: RoommateKidsPreference | null;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          has_kids?: boolean;
          num_kids?: number | null;
          kid_ages?: number[];
          custody_arrangement?: CustodyArrangement | null;
          typical_schedule?: string | null;
          roommate_kids_preference?: RoommateKidsPreference | null;
          updated_at?: string;
        };
        Update: {
          profile_id?: string;
          has_kids?: boolean;
          num_kids?: number | null;
          kid_ages?: number[];
          custody_arrangement?: CustodyArrangement | null;
          typical_schedule?: string | null;
          roommate_kids_preference?: RoommateKidsPreference | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_kids_custody_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interests: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_interests: {
        Row: {
          profile_id: string;
          interest_id: string;
        };
        Insert: {
          profile_id: string;
          interest_id: string;
        };
        Update: {
          profile_id?: string;
          interest_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_interests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_interests_interest_id_fkey";
            columns: ["interest_id"];
            isOneToOne: false;
            referencedRelation: "interests";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_neighborhood_preferences: {
        Row: {
          profile_id: string;
          neighborhood_id: string;
        };
        Insert: {
          profile_id: string;
          neighborhood_id: string;
        };
        Update: {
          profile_id?: string;
          neighborhood_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_neighborhood_preferences_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_neighborhood_preferences_neighborhood_id_fkey";
            columns: ["neighborhood_id"];
            isOneToOne: false;
            referencedRelation: "neighborhoods";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          user_a_interested: boolean;
          user_b_interested: boolean;
          status: MatchStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_a: string;
          user_b: string;
          user_a_interested?: boolean;
          user_b_interested?: boolean;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_a?: string;
          user_b?: string;
          user_a_interested?: boolean;
          user_b_interested?: boolean;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey";
            columns: ["user_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_b_fkey";
            columns: ["user_b"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      match_reads: {
        Row: {
          match_id: string;
          profile_id: string;
          last_read_at: string;
        };
        Insert: {
          match_id: string;
          profile_id: string;
          last_read_at?: string;
        };
        Update: {
          match_id?: string;
          profile_id?: string;
          last_read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "match_reads_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_reads_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          match_id: string | null;
          reason: ReportReason;
          details: string | null;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          match_id?: string | null;
          reason: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_id?: string;
          match_id?: string | null;
          reason?: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      express_interest: {
        Args: { target: string };
        Returns: string;
      };
      is_blocked_between: {
        Args: { a: string; b: string };
        Returns: boolean;
      };
      unread_message_count: {
        Args: Record<string, never>;
        Returns: number;
      };
      unread_counts_by_match: {
        Args: Record<string, never>;
        Returns: { match_id: string; unread_count: number }[];
      };
      blocked_members: {
        Args: Record<string, never>;
        Returns: { blocked_id: string; name: string; created_at: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

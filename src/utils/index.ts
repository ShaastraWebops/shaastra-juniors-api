export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
  }

export const ADMINMAILLIST = ["webops@shaastra.org"]

export interface SendVerificationMailOptions {
  name: string;
  email: string;
  id: string;
  verifyToken: string
}

export interface SendConfirmationMailOptions {
  name: string;
  email: string;
}

export enum Standard {
  KIDS = "KIDS",
  FIRST = "I",
  SECOND = "II",
  THIRD = "III",
  FOURTH = "IV",
  FIFTH = "V",
  SIXTH = "VI",
  SEVENTH = "VII",
  EIGHTH = "VIII",
  NINTH = "IX",
  TENTH = "X",
  ELEVENTH = "XI",
  TWELFTH = "XII"
}

export enum EventType {
  WORKSHOPS = "WORKSHOPS",
  COMPETITIONS = "COMPETITIONS",
  SHOWS = "SHOWS"
}

export enum RegistraionType {
  TEAM = "TEAM",
  INDIVIDUAL = "INDIVIDUAL",
  NONE = "NONE"
}
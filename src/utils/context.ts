import { Request, Response } from "express";
import { User } from "../entities/user";

export interface MyContext {
  req: Request;
  res: Response;
  user: User;
};
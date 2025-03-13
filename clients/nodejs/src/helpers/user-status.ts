import { NextFunction, Request, Response } from "express";

export function AuthenticatedUser(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    next();
  }
  else {
    res.redirect("/oidc/login");
  }
}

export function isAuthenticated(req: Request, res: Response) : boolean {
  if (req.session.user) {
    return true;
  }
  else {
    return false;
  }
}

export function VerifiedUser(req: Request, res: Response, next: NextFunction) {
  if (req.session.user && req.session.user.coreidentity || req.session.user && req.session.user.returnCode) {
    next();
  }
  else {
    res.redirect("/oidc/verify");
  }
}

export function isVerified(req: Request, res: Response) : boolean {
  if (req.session.user && req.session.user.coreidentity) {
    return true;
  }
  else {
    return false;
  }
}
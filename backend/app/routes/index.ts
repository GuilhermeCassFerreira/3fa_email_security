import express, { Request, Response } from "express";
import {
  activate2FA,
  authCode,
  login,
  userRegistration,
} from "../controllers/userController";
import { receiveMessage } from "../controllers/messageController";
import { listUsers } from "../controllers/userController";

const router = express.Router();

router.get("/users", listUsers); 
router.get("/", (req: Request, res: Response) => {
  res.send("API com 2FA");
});

router.post("/register", userRegistration);

router.post("/activate2FA", activate2FA);

router.post("/login", login);

router.post("/authCode", authCode);

router.post("/message", receiveMessage);

export default router;

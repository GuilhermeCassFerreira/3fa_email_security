import { Request, Response } from "express";
import * as crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { getUsers, saveUsers, getUserIdByUsername } from "../repositories/user";
import axios from "axios"; // Adicione esta dependência para fazer requisições HTTP

// Registrar usuário
export const userRegistration = async (req: Request, res: Response) => {
  const { username, token, email } = req.body;

  if (!username || !token || !email) {
    return res.status(400).send("missing params");
  }

  // Token da API IPInfo
  const tokenIPInfo = "46a2a58a0b924d";

  // Buscar o IP público do cliente diretamente da API IPInfo
  let clientIp;
  try {
    const ipResponse = await axios.get(`https://ipinfo.io?token=${tokenIPInfo}`);
    clientIp = ipResponse.data.ip; // Captura o IP público
  } catch (error) {
    console.error("Erro ao buscar o IP público:", error);
    return res.status(500).send("Error fetching public IP");
  }

  console.log("Client Public IP:", clientIp);

  // Buscar informações de localização do IP
  let locationInfo;
  try {
    const response = await axios.get(`https://ipinfo.io/${clientIp}?token=${tokenIPInfo}`);
    locationInfo = response.data.country, response.data.ip;
  } catch (error) {
    console.error("Erro ao buscar informações de IP:", error);
    return res.status(500).send("Error fetching IP information");
  }

  const pass = username + token;

  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(pass, salt, 64, {
      cost: 2048,
      blockSize: 8,
      parallelization: 1,
    })
    .toString("hex");

  const users = getUsers();

  const id = Object.keys(users).length + 1;

  const newUser = {
    id,
    username,
    email,
    hash,
    salt,
    twoFactor: false,
    msgCount: 0,
    ip: clientIp, // Armazenar o IP público
    location: locationInfo, // Armazenar as informações de localização
  };

  console.log("User registration data:", newUser);

  users[id] = newUser;
  saveUsers(users);

  return res.status(201).send(newUser);
};

// Habilitar 2° fator
export const activate2FA = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send("missing params");
  }

  const users = getUsers();

  if (users[id] == undefined) {
    return res.status(400).send("user not found");
  }

  // Gerar a OTP
  const secret = speakeasy.generateSecret();

  users[id]["secret"] = secret;
  users[id]["twoFactor"] = true;

  saveUsers(users);

  const otp = secret.otpauth_url;
  if (otp != undefined) {
    await qrcode.toDataURL(otp, (err, qrcode) => {
      return res.send({ qrcode: qrcode });
    });
  } else {
    return res.status(400).send("Error generating otp");
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const { username, token } = req.body;

  if (!username || !token) {
    return res.status(400).send("missing params");
  }

  // Token da API IPInfo
  const tokenIPInfo = "46a2a58a0b924d";

  // Capturar o IP público do cliente
  let clientIp;
  try {
    const ipResponse = await axios.get(`https://ipinfo.io?token=${tokenIPInfo}`);
    clientIp = ipResponse.data.ip; // Captura o IP público
  } catch (error) {
    console.error("Erro ao buscar o IP público:", error);
    return res.status(500).send("Error fetching public IP");
  }

  console.log("Client Public IP:", clientIp);

  // Buscar informações de localização do IP
  let clientCountry;
  try {
    const response = await axios.get(`https://ipinfo.io/${clientIp}?token=${tokenIPInfo}`);
    clientCountry = response.data.country; // Captura o país associado ao IP
  } catch (error) {
    console.error("Erro ao buscar informações de IP:", error);
    return res.status(500).send("Error fetching IP information");
  }

  console.log("Client Country:", clientCountry);

  const pass = username + token;

  const users = getUsers();

  // Verificar se o usuário existe
  const id = getUserIdByUsername(username);
  if (id == undefined) {
    return res.status(400).send("user not found");
  }

  const user = users[id];

  // Comparar o país do cliente com o país armazenado
  if (user.location !== clientCountry) {
    return res.status(403).send("Access denied: login from a different country");
  }

  // Verificar o hash da senha
  const salt = user["salt"];
  const hash = crypto
    .scryptSync(pass, salt, 64, {
      cost: 2048,
      blockSize: 8,
      parallelization: 1,
    })
    .toString("hex");

  if (hash === user["hash"]) {
    return res.send(id);
  } else {
    return res.status(401).send("wrong auth code");
  }
};

// Verificação do 2° fator
export const authCode = async (req: Request, res: Response) => {
  const { id, code } = req.body;

  if (!id || !code) {
    return res.status(400).send("missing params");
  }

  const users = getUsers();

  if (users[id] == undefined) {
    return res.status(400).send("user not found");
  }

  const secret = users[id]["secret"];

  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: "base32",
    token: code,
    window: 2,
  });

  if (!verified) {
    return res.status(401).send("wrong auth code");
  }

  const hashSalt = crypto.createHash("sha256");

  hashSalt.update(users[id]["username"]);

  const salt = hashSalt.digest("base64");

  const sessionToken = crypto
    .pbkdf2Sync(code, salt, 1000, 16, "sha512")
    .toString("hex");

  users[id]["msgCount"] = 0;
  users[id]["session"] = sessionToken;

  saveUsers(users);

  const user = users[id];

  return res.status(200).send({ user });
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = getUsers(); // Obtém os usuários do arquivo users.json
    return res.status(200).send(users); // Retorna os usuários como resposta
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).send("Error listing users");
  }
};
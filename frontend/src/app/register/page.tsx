"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as crypto from "crypto";
import Link from "next/link";

const registerUser = async (
  username: string,
  password: string,
  email: string
) => {
  const token = crypto.pbkdf2Sync(password, username, 1000, 64, "sha512");

  const userData = {
    username: username,
    token: token,
    email: email,
  };

  const res = await fetch("http://localhost:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res;
};

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await registerUser(username, password, email).then(
      async (res: Response) => {
        if (res.ok) {
          console.log("Usuário registrado com sucesso!");
          const data = await res.json();
          router.push(`activate2FA/${data.id}`);
        } else {
          console.log("Erro ao registrar usuário");
          setError("Erro ao registrar usuário");
        }
      }
    );
  };

  return (
    <main>
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">
          Criar Conta
        </h1>
        {error && (
          <div className={`mb-4 p-3 ${error.includes("sucesso") || error.includes("bem-sucedido") ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"} rounded-md`}>
            <p>{error}</p>
          </div>
        )}
        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de usuário
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow-md"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow-md"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-150 ease-in-out hover:shadow-md"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:-translate-y-px active:translate-y-0 active:shadow-inner"
            >
              Registrar
            </button>
          </div>
        </form>
        <p className="mt-6 sm:mt-8 text-center text-sm text-gray-600">
          Já possui uma conta?{' '}
          <Link href="/login" legacyBehavior>
            <a className="font-medium text-green-600 hover:text-green-700 hover:underline">
              Faça login
            </a>
          </Link>
        </p>
      </div>
    </main>
  );
}

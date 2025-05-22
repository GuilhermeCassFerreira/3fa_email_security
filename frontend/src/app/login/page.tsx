"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as crypto from "crypto";
import Link from 'next/link';

const loginUser = async (username: string, password: string) => {
  const token = crypto.pbkdf2Sync(password, username, 1000, 64, "sha512");

  const userData = {
    username: username,
    token: token,
  };

  const res = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, preencha o usuário e a senha.");
      return;
    }

    try {
      const res = await loginUser(username, password);
      if (res.ok) {
        console.log("Usuário logado com sucesso!");
        const id = await res.json();
        router.push(`authCode/${id}`);
      } else {
        const errorText = await res.text();
        console.error("Erro ao logar usuário:", res.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          setError(errorJson.message || errorJson.error || "Usuário e/ou senha incorreto(s).");
        } catch {
          setError(errorText || "Usuário e/ou senha incorreto(s).");
        }
      }
    } catch (err) {
      console.error("Falha na requisição de login:", err);
      setError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
  };

  return (
    <main>
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">
          Login
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}
        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuário
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:-translate-y-px active:translate-y-0 active:shadow-inner"
            >
              Entrar
            </button>
          </div>
        </form>
        <p className="mt-6 sm:mt-8 text-center text-sm text-gray-600">
          Ainda não tem registro?{' '}
          <Link href="/register" legacyBehavior>
            <a className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Cadastre-se
            </a>
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">
          Bem-vindo ao Sistema de Autenticação
        </h1>

        <div className="space-y-4">
          <Link href="/login" legacyBehavior>
            <a className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:-translate-y-0.5">
              Login
            </a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:-translate-y-0.5">
              Registrar
            </a>
          </Link>
        </div>
      </div>
    </main>
  );
}

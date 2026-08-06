import { redirect } from 'next/navigation';

// Redireciona direto ao painel (modo auditoria — sem guard de autenticação)
export default function Page() {
	redirect('/panel/merchant/dashboard');
}

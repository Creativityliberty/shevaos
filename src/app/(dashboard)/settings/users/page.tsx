import { getTeamMembers } from "@/features/settings/actions/user-actions";
import { UserCircle, Shield, CheckCircle2, XCircle } from "lucide-react";

export default async function UsersSettingsPage() {
    // Si l'utilisateur n'a pas les droits, getUsers jettera une erreur
    const members = await getTeamMembers();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion de l'Équipe</h1>
                    <p className="text-gray-500 font-medium">Contrôlez les accès, ajoutez des livreurs et attribuez les rôles.</p>
                </div>
                {/* Plus tard on ajoutera le composant modal CreateUserModal */}
                <button className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold shadow-md shadow-orange-100 hover:scale-105 transition-all">
                    + Nouveau collaborateur
                </button>
            </div>

            <div className="bg-white border text-left border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-3xl">Utilisateur</th>
                            <th className="px-6 py-4">Rôle</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4">Date d'ajout</th>
                            <th className="px-6 py-4 text-right rounded-tr-3xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {members.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                                            <UserCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.full_name || "Sans nom"}</p>
                                            <p className="text-gray-500 text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                                        <Shield className="w-3.5 h-3.5" />
                                        {user.role.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-xs">
                                            <CheckCircle2 className="w-4 h-4" /> Actif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold text-xs">
                                            <XCircle className="w-4 h-4" /> Désactivé
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-medium">
                                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary font-semibold text-sm hover:underline">Modifier</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="p-12 text-center text-gray-500">Aucun membre trouvé.</div>
                )}
            </div>
        </div>
    );
}

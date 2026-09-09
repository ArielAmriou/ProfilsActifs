"use client";

import { useEffect, useState } from "react";
import { ContentCard } from "@/components/layout/ContentCard";
import { fetchAllUsers, deleteUser, type AdminUser } from "@/lib/admin-api";
import { AlertDialog, Button } from "@heroui/react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  return (
    /* L'ajout de font-title ici force toute la page, le tableau et la modale à suivre la police moderne */
    <ContentCard className="font-title max-w-5xl">
      <h1 className="text-2xl font-bold text-institutional">Gestion des Utilisateurs</h1>
      <p className="mt-2 text-sm text-institutional/80 mb-8">
        Consultez et supprimez les utilisateurs inscrits sur la plateforme.
      </p>

      {loading ? (
        <p className="py-8 text-center text-sm text-institutional/70">Chargement en cours...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-institutional/5 text-institutional">
              <tr>
                <th className="px-4 py-3 font-bold">NOM</th>
                <th className="px-4 py-3 font-bold">EMAIL</th>
                <th className="px-4 py-3 font-bold">RÔLE</th>
                <th className="px-4 py-3 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-institutional/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-institutional">{user.name}</td>
                  <td className="px-4 py-3 text-institutional/80">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-institutional/10 px-2.5 py-1 text-xs font-bold uppercase text-institutional">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-institutional/70">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog isOpen={Boolean(userToDelete)} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="font-title sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Supprimer l'utilisateur ?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>
                  Cela supprimera définitivement <strong>{userToDelete?.name}</strong> et toutes ses données associées. Cette action est irréversible.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" onPress={() => setUserToDelete(null)}>
                  Annuler
                </Button>
                <Button variant="danger" onPress={confirmDelete}>
                  Supprimer
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </ContentCard>
  );
}
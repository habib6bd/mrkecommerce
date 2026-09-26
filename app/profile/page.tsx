"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import {
  AddressInput,
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "@/lib/api/auth";
import { useAuth } from "@/store/AuthContext";
import { Address } from "@/types/user";

const EMPTY_ADDRESS: AddressInput = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
  isDefault: false,
};

function AddressBook() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    listAddresses(token)
      .then(setAddresses)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load addresses."))
      .finally(() => setLoading(false));
  }, [token]);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await updateAddress(token, editingId, form);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await createAddress(token, form);
        setAddresses((prev) => [...prev, created]);
      }
      cancelEdit();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    setError(null);
    try {
      await deleteAddress(token, id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete address.");
    }
  }

  return (
    <div className="card mx-auto mt-6 max-w-lg p-6">
      <h2 className="text-xl font-black">Address Book</h2>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
      )}

      {!loading && addresses.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No saved addresses yet.</p>
      )}

      <ul className="mt-4 space-y-3">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">
                  {address.fullName} {address.isDefault && <span className="text-brand-600">(Default)</span>}
                </p>
                <p>{address.phone}</p>
                <p>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p>
                  {address.city}
                  {address.state ? `, ${address.state}` : ""} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(address)}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3 border-t pt-5">
        <h3 className="text-sm font-black">{editingId ? "Edit Address" : "Add New Address"}</h3>
        <input
          required
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Address line 1"
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="Address line 2 (optional)"
          value={form.line2}
          onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="State (optional)"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Postal code (optional)"
            value={form.postalCode}
            onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isDefault ?? false}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          Set as default address
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Update Address" : "Add Address"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-black"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({ name, phone });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <main className="container-shop py-4">
      <div className="card mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-black">My Profile</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-bold">Email</label>
            <input
              disabled
              value={user.email}
              className="mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2 text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-bold">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>}
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
              Profile updated.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-600 px-5 py-3 font-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileForm />
      <AddressBook />
    </RequireAuth>
  );
}

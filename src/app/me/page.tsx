"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteMe } from "@/actions/users";

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) throw new Error("Failed to fetch profile");
        setUser(await response.json());
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteMe();
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const ProfileField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between border-b border-muted pb-1">
      <label className="text-sm font-bold">{label}</label>
      <p>{value}</p>
    </div>
  );

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-50 flex items-center justify-between border-t-2 border-primary bg-background px-5"
        aria-label="Main navigation"
      >
        <Brand />

        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </header>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto max-w-xl px-2 py-8"
      >
        <div className="px-2 md:shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Account information</h2>
          <div className="space-y-4">
            <ProfileField label="Name" value={user?.name || "N/A"} />
            <ProfileField label="Email" value={user?.email || "N/A"} />
            <ProfileField
              label="Member Since"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-center justify-between gap-8 px-2 md:gap-5">
            <div>
              <h2 className="mb-2 text-xl font-bold text-destructive">
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground">
                Deleting your account will remove all your information from our
                servers.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="mt-4"
                  aria-label="Delete account"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>
    </>
  );
}
